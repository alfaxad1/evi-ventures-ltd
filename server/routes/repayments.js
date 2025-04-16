import express from "express";
import connection from "../config/dbConnection.js";
import {
  calculateRemainingBalance,
  updateLoanStatus,
} from "../services/loanService.js";

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
    const sql = `
      SELECT r.*, l.total_amount, l.status as loan_status, 
             CONCAT(c.first_name, ' ', c.last_name) as customer_name
      FROM repayments r
      JOIN loans l ON r.loan_id = l.id
      JOIN customers c ON l.customer_id = c.id
      WHERE r.status = 'pending'
    `;
    const [results] = await connection.promise().query(sql);

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

// Get repayment by ID with full details
router.get("/:id", async (req, res) => {
  try {
    const sql = `
      SELECT r.*, l.total_amount, l.status as loan_status, 
             c.phone as customer_phone, lp.name as product_name
      FROM repayments r
      JOIN loans l ON r.loan_id = l.id
      JOIN customers c ON l.customer_id = c.id
      JOIN loan_products lp ON l.loan_product_id = lp.id
      WHERE r.id = ?
    `;
    const [results] = await connection.promise().query(sql, [req.params.id]);

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
  const { loanId, amount, dueDate, paidDate, status, mpesaCode, createdBy } =
    req.body;

  try {
    await connection.promise().beginTransaction();

    // 1. Create the repayment record
    const createSql = `
      INSERT INTO repayments 
        (loan_id, amount, due_date, paid_date, status, mpesa_code, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [createResult] = await connection
      .promise()
      .query(createSql, [
        loanId,
        amount,
        dueDate,
        paidDate,
        status,
        mpesaCode,
        createdBy,
      ]);

    // 2. Update loan status and balance if payment is made
    if (status === "paid") {
      // Record M-Pesa transaction if applicable
      if (mpesaCode) {
        const mpesaSql = `
          INSERT INTO mpesa_transactions 
            (loan_id, amount, type, mpesa_code, status, timestamp) 
          VALUES (?, ?, 'repayment', ?, 'completed', NOW())
        `;
        await connection.promise().query(mpesaSql, [loanId, amount, mpesaCode]);
      }

      // Update loan status and balance
      await updateLoanStatus(loanId, connection);
    }

    await connection.promise().commit();

    res.status(201).json({
      message: "Repayment created successfully",
      repaymentId: createResult.insertId,
    });
  } catch (err) {
    await connection.promise().rollback();
    console.error("Error creating repayment:", err);
    res.status(500).json({ error: "Error creating repayment" });
  }
});

// Update repayment and handle status changes
router.put("/:id", validateRepaymentData, async (req, res) => {
  const { id } = req.params;
  const { loanId, amount, status, mpesaCode, customerId, initiatedBy } =
    req.body;

  try {
    await connection.promise().beginTransaction();

    // 1. Get current repayment data
    const [currentRepayment] = await connection
      .promise()
      .query("SELECT * FROM repayments WHERE id = ?", [id]);

    if (currentRepayment.length === 0) {
      await connection.promise().rollback();
      return res.status(404).json({ error: "Repayment not found" });
    }

    // 2. Update the repayment
    const updateSql = `
    UPDATE repayments 
    SET status = ?
    WHERE id = ?
  `;
    await connection.promise().query(updateSql, [status, id]);

    // 3. Handle status changes that affect loan balance
    const statusChangedToPaid =
      status === "paid" && currentRepayment[0].status !== "paid";
    const statusChangedFromPaid =
      status !== "paid" && currentRepayment[0].status === "paid";

    if (statusChangedToPaid || statusChangedFromPaid) {
      // Record M-Pesa transaction if applicable
      if (mpesaCode && status === "paid") {
        const mpesaSql = `
          INSERT INTO mpesa_transactions 
            (customer_id, loan_id, amount, type, mpesa_code, status, initiated_by, created_at) 
          VALUES (?, ?, ?, 'repayment', ?, 'completed', ?, NOW())
        `;
        await connection
          .promise()
          .query(mpesaSql, [
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

    await connection.promise().commit();

    res.status(200).json({
      message: "Repayment updated successfully",
    });
  } catch (err) {
    await connection.promise().rollback();
    console.error("Error updating repayment:", err);
    res.status(500).json({ error: "Error updating repayment" });
  }
});

// Delete a repayment (with loan status recalculation)
router.delete("/:id", async (req, res) => {
  try {
    await connection.promise().beginTransaction();

    // 1. Get repayment data before deletion
    const [repayment] = await connection
      .promise()
      .query("SELECT loan_id, status FROM repayments WHERE id = ?", [
        req.params.id,
      ]);

    if (repayment.length === 0) {
      await connection.promise().rollback();
      return res.status(404).json({ error: "Repayment not found" });
    }

    const loanId = repayment[0].loan_id;
    const wasPaid = repayment[0].status === "paid";

    // 2. Delete the repayment
    await connection
      .promise()
      .query("DELETE FROM repayments WHERE id = ?", [req.params.id]);

    // 3. Recalculate loan status if deleted repayment was paid
    if (wasPaid) {
      await updateLoanStatus(loanId, connection);
    }

    await connection.promise().commit();

    res.status(200).json({
      message: "Repayment deleted successfully",
    });
  } catch (err) {
    await connection.promise().rollback();
    console.error("Error deleting repayment:", err);
    res.status(500).json({ error: "Error deleting repayment" });
  }
});

// Run default checks daily (call this from a cron job)
router.get("/check-defaults", async (req, res) => {
  try {
    await checkLoanDefaults(connection);
    res.status(200).json({ message: "Default check completed" });
  } catch (err) {
    console.error("Error checking defaults:", err);
    res.status(500).json({ error: "Error checking loan defaults" });
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
