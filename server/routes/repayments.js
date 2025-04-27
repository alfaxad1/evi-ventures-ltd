import express from "express";
import connection from "../config/dbConnection.js";
import {
  calculateRemainingBalance,
  updateLoanStatus,
} from "../services/loanService.js";
import { checkLoanDefaults } from "../services/loanService.js";

const router = express.Router();
router.use(express.json());

// Middleware to validate repayment data
const validateRepaymentData = (req, res, next) => {
  const requiredFields = ["loanId", "amount", "status"];
  const optionalFields = ["dueDate", "paidDate", "mpesaCode"];

  // Check for empty body
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body cannot be empty" });
  }

  // Check required fields
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `${field} is required` });
    }
  }

  // Validate status
  const validStatuses = ["pending", "paid", "late", "missed"];
  if (!validStatuses.includes(req.body.status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  // Set default paidDate if status is paid
  if (req.body.status === "paid" && !req.body.paidDate) {
    req.body.paidDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  }

  next();
};
//get all repayments of status pending with loan details
router.get("/pending", async (req, res) => {
  try {
    const { officerId, role } = req.query; // Get officerId and role from query parameters

    let sql = `
      SELECT r.*, l.total_amount, l.status as loan_status,
             c.id as customer_id,  
             CONCAT(c.first_name, ' ', c.last_name) as customer_name
      FROM repayments r
      JOIN loans l ON r.loan_id = l.id
      JOIN customers c ON l.customer_id = c.id
      WHERE r.status = 'pending'
    `;

    const queryParams = [];

    // Add filtering for officer role
    if (role === "officer") {
      sql += " AND l.officer_id = ?";
      queryParams.push(officerId);
    }

    const [results] = await connection.query(sql, queryParams);

    // Count the number of pending repayments
    const count = results.length;

    res.status(200).json({
      count,
      data: results,
    });
  } catch (err) {
    console.error("Error getting pending repayments:", err);
    res.status(500).json({ error: "Error getting pending repayments" });
  }
});

//approved repayments
router.get("/approved", async (req, res) => {
  try {
    const { officerId, role } = req.query; // Get officerId and role from query parameters

    let sql = `
      SELECT r.*, l.total_amount, l.status as loan_status,
             c.id as customer_id,  
             CONCAT(c.first_name, ' ', c.last_name) as customer_name
      FROM repayments r
      JOIN loans l ON r.loan_id = l.id
      JOIN customers c ON l.customer_id = c.id
      WHERE r.status = 'paid'
    `;

    const queryParams = [];

    // Add filtering for officer role
    if (role === "officer") {
      sql += " AND l.officer_id = ?";
      queryParams.push(officerId);
    }

    const [results] = await connection.query(sql, queryParams);

    // Count the number of approved repayments
    const count = results.length;

    res.status(200).json({
      count,
      data: results,
    });
  } catch (err) {
    console.error("Error getting approved repayments:", err);
    res.status(500).json({ error: "Error getting approved repayments" });
  }
});

// Get monthly approved repayments for a specific officer with summary
router.get("/monthly-approved", async (req, res) => {
  try {
    const { officerId, month, year } = req.query;

    if (!officerId || !month || !year) {
      return res.status(400).json({
        error: "Officer ID, month, and year are required",
      });
    }

    const targetAmount = 700000; // Target total amount

    // Query to get approved repayments for the specified officer, month, and year
    const [repayments] = await connection.query(
      `
      SELECT 
        r.id,
        r.amount,
        r.paid_date,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.national_id,
        c.phone,
        l.total_amount AS loan_total,
        lp.name AS loan_product
      FROM repayments r
      JOIN loans l ON r.loan_id = l.id
      JOIN customers c ON l.customer_id = c.id
      JOIN loan_products lp ON l.product_id = lp.id
      WHERE r.status = 'paid'
        AND l.officer_id = ?
        AND MONTH(r.paid_date) = ?
        AND YEAR(r.paid_date) = ?
      ORDER BY r.paid_date DESC
      `,
      [officerId, month, year]
    );

    // Query to calculate the sum of approved repayments and count
    const [summary] = await connection.query(
      `
      SELECT 
        COUNT(*) as repayment_count,
        SUM(r.amount) as total_amount_sum
      FROM repayments r
      JOIN loans l ON r.loan_id = l.id
      WHERE r.status = 'paid'
        AND l.officer_id = ?
        AND MONTH(r.paid_date) = ?
        AND YEAR(r.paid_date) = ?
      `,
      [officerId, month, year]
    );

    const totalAmountSum = summary[0].total_amount_sum || 0; // Ensure no null values
    const repaymentCount = summary[0].repayment_count || 0;

    // Calculate deficit and percentage
    const deficit = targetAmount - totalAmountSum;
    const percentage = ((totalAmountSum / targetAmount) * 100).toFixed(2); // Rounded to 2 decimal places

    res.status(200).json({
      repayments,
      summary: {
        repayment_count: repaymentCount,
        total_amount_sum: totalAmountSum,
        deficit: deficit,
        percentage: `${percentage}%`,
        target_amount: targetAmount,
      },
    });
  } catch (err) {
    console.error("Error fetching monthly approved repayments:", err);
    res
      .status(500)
      .json({ error: "Failed to retrieve monthly approved repayments" });
  }
});

// Get repayment by ID with full details
router.get("/:id", async (req, res) => {
  try {
    const sql = `
      SELECT r.*, l.total_amount, l.status as loan_status, 
             c.phone as customer_phone, lp.name as product_name
      FROM repayments r
      JOIN loans l ON r.loan_id = l.id
      JOIN customers c ON l.customer_id = c.id
      JOIN loan_products lp ON l.product_id = lp.id
      WHERE r.id = ?
    `;
    const [results] = await connection.query(sql, [req.params.id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Repayment not found" });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error getting repayment:", err);
    res.status(500).json({ error: "Error getting repayment" });
  }
});

// Create a new repayment with loan status updates
router.post("/", validateRepaymentData, async (req, res) => {
  const { loanId, amount, mpesaCode } = req.body;

  try {
    await connection.beginTransaction();

    // Get loan details
    const [loan] = await connection.query("SELECT * FROM loans WHERE id = ?", [
      loanId,
    ]);

    if (loan.length === 0) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const {
      installment_amount,
      installment_type,
      due_date,
      arrears,
      officer_id,
    } = loan[0];

    let newArrears = arrears || 0;
    let nextDueDate = new Date(due_date);

    // Check if payment is sufficient
    if (amount < installment_amount) {
      newArrears += installment_amount - amount; // Add shortfall to arrears
    } else if (amount > installment_amount) {
      newArrears -= amount - installment_amount; // Reduce arrears if overpaid
    }

    // Update due date
    if (installment_type === "daily") {
      nextDueDate.setDate(nextDueDate.getDate() + 1);
    } else if (installment_type === "weekly") {
      nextDueDate.setDate(nextDueDate.getDate() + 7);
    }

    // Update loan record
    await connection.query(
      `UPDATE loans 
      SET arrears = ?, due_date = ? 
      WHERE id = ?`,
      [newArrears, nextDueDate, loanId]
    );

    // Record repayment
    await connection.query(
      `INSERT INTO repayments (loan_id, amount, due_date, paid_date, status, mpesa_code, created_by, created_at) 
      VALUES (?, ?, ?, NOW(), 'pending', ?, ?, NOW())`,
      [loanId, amount, nextDueDate, mpesaCode, officer_id]
    );

    await connection.commit();
    res.status(200).json({ message: "Repayment recorded successfully" });
  } catch (err) {
    await connection.rollback();
    console.error("Error recording repayment:", err);
    res.status(500).json({ error: "Failed to record repayment" });
  }
});

// Approve repayment and handle status changes
router.put("/:id", validateRepaymentData, async (req, res) => {
  const { id } = req.params;
  const { loanId, amount, status, mpesaCode, customerId, initiatedBy } =
    req.body;

  try {
    await connection.beginTransaction();

    // 1. Get current repayment data
    const [currentRepayment] = await connection.query(
      "SELECT * FROM repayments WHERE id = ?",
      [id]
    );

    if (currentRepayment.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Repayment not found" });
    }

    // 2. Update the repayment
    const updateSql = `
      UPDATE repayments 
      SET status = ?, paid_date = NOW() 
      WHERE id = ?
    `;
    await connection.query(updateSql, [status, id]);

    // 3. Handle loan updates
    if (status === "paid") {
      // Record M-Pesa transaction if applicable
      if (mpesaCode) {
        const mpesaSql = `
          INSERT INTO mpesa_transactions 
            (customer_id, loan_id, amount, type, mpesa_code, status, initiated_by, created_at) 
          VALUES (?, ?, ?, 'repayment', ?, 'completed', ?, NOW())
        `;
        await connection.query(mpesaSql, [
          customerId,
          loanId,
          amount,
          mpesaCode,
          initiatedBy,
        ]);
      }

      // Update loan status and balance
      await updateLoanStatus(loanId, connection);
    }

    await connection.commit();

    res.status(200).json({
      message: "Repayment updated successfully",
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error updating repayment:", err);
    res.status(500).json({ error: "Error updating repayment" });
  }
});

// Delete a repayment (with loan status recalculation)
router.delete("/:id", async (req, res) => {
  try {
    await connection.beginTransaction();

    // 1. Get repayment data before deletion
    const [repayment] = await connection.query(
      "SELECT loan_id, status FROM repayments WHERE id = ?",
      [req.params.id]
    );

    if (repayment.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Repayment not found" });
    }

    const loanId = repayment[0].loan_id;
    const wasPaid = repayment[0].status === "paid";

    // 2. Delete the repayment
    await connection.query("DELETE FROM repayments WHERE id = ?", [
      req.params.id,
    ]);

    // 3. Recalculate loan status if deleted repayment was paid
    if (wasPaid) {
      await updateLoanStatus(loanId, connection);
    }

    await connection.commit();

    res.status(200).json({
      message: "Repayment deleted successfully",
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error deleting repayment:", err);
    res.status(500).json({ error: "Error deleting repayment" });
  }
});

// Run default checks daily (call this from a cron job)
router.post("/check-defaults", async (req, res) => {
  try {
    await checkLoanDefaults(connection);
    res.status(200).json({ message: "Default check completed" });
  } catch (err) {
    console.error("Error checking defaults:", err);
    res.status(500).json({ message: "Error checking loan defaults", error: err.message });
  }
});

// Now properly using calculateRemainingBalance in GET endpoints
router.get("/:id/balance", async (req, res) => {
  try {
    const balance = await calculateRemainingBalance(req.params.id, connection);
    res.status(200).json({ remaining_balance: balance });
  } catch (err) {
    console.error("Error calculating balance:", err);
    res.status(500).json({ error: "Error calculating remaining balance" });
  }
});

export default router;
