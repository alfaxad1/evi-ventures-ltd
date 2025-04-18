import express from "express";
import connection from "../config/dbConnection.js";
import { body, validationResult } from "express-validator";

const router = express.Router();
router.use(express.json());

// Validation middleware
const validateLoanData = [
  body("applicationId").isInt().withMessage("Valid application ID required"),
  body("customerId").isInt().withMessage("Valid customer ID required"),
  body("officerId").isInt().withMessage("Valid officer ID required"),
  body("principal")
    .isFloat({ min: 1000 })
    .withMessage("Principal must be at least 1000"),
  body("totalInterest")
    .isFloat({ min: 0 })
    .withMessage("Interest must be positive"),
  body("totalAmount")
    .isFloat({ min: 0 })
    .withMessage("Total amount must be positive"),
  body("disbursementDate").isISO8601().withMessage("Invalid disbursement date"),
  body("dueDate").isISO8601().withMessage("Invalid due date"),
  body("status")
    .isIn(["active", "paid", "defaulted", "partially_paid"])
    .withMessage("Invalid status"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Get all loans with pagination and filters
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerId, officerId } = req.query;
    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT l.*, 
        c.first_name as customer_first_name, 
        c.last_name as customer_last_name,
        u.first_name as officer_first_name,
        u.last_name as officer_last_name,
        lp.name as product_name
      FROM loans l
      JOIN customers c ON l.customer_id = c.id
      JOIN users u ON l.officer_id = u.id
      JOIN loan_applications la ON l.application_id = la.id
      JOIN loan_products lp ON la.product_id = lp.id
    `;
    const whereClauses = [];
    const queryParams = [];

    if (status) {
      whereClauses.push("l.status = ?");
      queryParams.push(status);
    }
    if (customerId) {
      whereClauses.push("l.customer_id = ?");
      queryParams.push(customerId);
    }
    if (officerId) {
      whereClauses.push("l.officer_id = ?");
      queryParams.push(officerId);
    }

    if (whereClauses.length > 0) {
      baseQuery += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    // Get total count
    const [countResult] = await connection
      .promise()
      .query(
        `SELECT COUNT(*) as total FROM (${baseQuery}) as count_query`,
        queryParams
      );
    const total = countResult[0].total;

    // Add pagination and sorting
    const finalQuery = `${baseQuery} ORDER BY l.disbursement_date DESC LIMIT ? OFFSET ?`;
    const [loans] = await connection
      .promise()
      .query(finalQuery, [...queryParams, parseInt(limit), offset]);

    res.status(200).json({
      data: loans,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error getting loans:", err);
    res.status(500).json({ error: "Failed to retrieve loans" });
  }
});

// Get detailed loan information
router.get("/loan-details", async (req, res) => {
  try {
    const [loans] = await connection.promise().query(`
      SELECT 
        l.id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.national_id,
        c.phone,
        lp.name AS loan_product,
        la.purpose,
        l.disbursement_date,
        l.due_date,
        l.principal,
        l.total_interest,
        l.total_amount,
        l.status,
        (SELECT SUM(amount) FROM repayments WHERE loan_id = l.id AND status = 'paid') as paid_amount,
        IFNULL(
          l.remaining_balance, 
          (l.total_amount - IFNULL((SELECT SUM(amount) FROM repayments WHERE loan_id = l.id AND status = 'paid'), 0))
        ) as remaining_balance,
        DATEDIFF(l.due_date, CURDATE()) as days_remaining
      FROM loans l
      JOIN customers c ON l.customer_id = c.id
      JOIN loan_applications la ON l.application_id = la.id
      JOIN loan_products lp ON la.product_id = lp.id
      WHERE l.status IN ('active', 'partially_paid') -- Filter by status
      ORDER BY l.disbursement_date DESC
    `);

    res.status(200).json(loans);
  } catch (err) {
    console.error("Error fetching loan details:", err);
    res.status(500).json({ error: "Failed to retrieve loan details" });
  }
});

//with status paid
router.get("/loan-details/paid", async (req, res) => {
  try {
    const [loans] = await connection.promise().query(`
      SELECT 
        l.id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.national_id,
        c.phone,
        lp.name AS loan_product,
        la.purpose,
        l.disbursement_date,
        l.due_date,
        l.principal,
        l.total_interest,
        l.total_amount,
        l.status,
        (SELECT SUM(amount) FROM repayments WHERE loan_id = l.id AND status = 'paid') as paid_amount,
        IFNULL(
          l.remaining_balance, 
          (l.total_amount - IFNULL((SELECT SUM(amount) FROM repayments WHERE loan_id = l.id AND status = 'paid'), 0))
        ) as remaining_balance,
        DATEDIFF(l.due_date, CURDATE()) as days_remaining
      FROM loans l
      JOIN customers c ON l.customer_id = c.id
      JOIN loan_applications la ON l.application_id = la.id
      JOIN loan_products lp ON la.product_id = lp.id
      WHERE l.status = 'paid' -- Filter by status
      ORDER BY l.disbursement_date DESC
    `);

    res.status(200).json(loans);
  } catch (err) {
    console.error("Error fetching paid loan details:", err);
    res.status(500).json({ error: "Failed to retrieve paid loan details" });
  }
});

//pending disbursement
router.get("/loan-details/pending-disbursement", async (req, res) => {
  try {
    const [loans] = await connection.promise().query(`
      SELECT 
        l.id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.national_id,
        c.phone,
        lp.name AS loan_product,
        la.purpose,
        l.principal,
        l.total_interest,
        l.total_amount,
        l.status,
        l.due_date,
        DATEDIFF(l.due_date, CURDATE()) as days_remaining
      FROM loans l
      JOIN customers c ON l.customer_id = c.id
      JOIN loan_applications la ON l.application_id = la.id
      JOIN loan_products lp ON la.product_id = lp.id
      WHERE l.status = 'pending_disbursement'
      ORDER BY l.id DESC
    `);

    res.status(200).json(loans);
  } catch (err) {
    console.error(
      "Error fetching loans with pending disbursement status:",
      err
    );
    res
      .status(500)
      .json({
        error: "Failed to retrieve loans with pending disbursement status",
      });
  }
});

//disburse a loan
router.put("/disburse/:loanId", async (req, res) => {
  const { mpesaCode } = req.body;

  if (!mpesaCode) {
    return res.status(400).json({ error: "Mpesa code is required" });
  }

  try {
    await connection.promise().beginTransaction();

    // 1. Update loan status to active
    const [updateResult] = await connection
      .promise()
      .query(
        "UPDATE loans SET status = 'active', disbursement_date = NOW() WHERE id = ? AND status = 'pending_disbursement'",
        [req.params.loanId]
      );

    if (updateResult.affectedRows === 0) {
      await connection.promise().rollback();
      return res.status(400).json({
        error: "Loan not found or not in pending disbursement status",
      });
    }

    // 2. Save transaction in mpesa_transactions table
    await connection.promise().query(
      `INSERT INTO mpesa_transactions (loan_id, mpesa_code, transaction_date) 
       VALUES (?, ?, NOW())`,
      [req.params.loanId, mpesaCode]
    );

    await connection.promise().commit();
    res.status(200).json({ message: "Loan disbursed successfully" });
  } catch (err) {
    await connection.promise().rollback();
    console.error("Error disbursing loan:", err);
    res.status(500).json({ error: "Failed to disburse loan" });
  }
});
// Get loan by ID with full details
router.get("/:id", async (req, res) => {
  try {
    const [loan] = await connection.promise().query(
      `
      SELECT 
        l.*,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.phone as customer_phone,
        c.national_id,
        CONCAT(u.first_name, ' ', u.last_name) AS officer_name,
        lp.name as product_name,
        lp.interest_rate,
        la.purpose,
        (SELECT COUNT(*) FROM repayments WHERE loan_id = l.id) as repayment_count,
        (SELECT SUM(amount) FROM repayments WHERE loan_id = l.id AND status = 'paid') as total_paid,
        (l.total_amount - IFNULL((SELECT SUM(amount) FROM repayments WHERE loan_id = l.id AND status = 'paid'), 0)) as remaining_balance
      FROM loans l
      JOIN customers c ON l.customer_id = c.id
      JOIN users u ON l.officer_id = u.id
      JOIN loan_applications la ON l.application_id = la.id
      JOIN loan_products lp ON la.product_id = lp.id
      WHERE l.id = ?
    `,
      [req.params.id]
    );

    if (loan.length === 0) {
      return res.status(404).json({ error: "Loan not found" });
    }

    // Get repayment history
    const [repayments] = await connection.promise().query(
      `
      SELECT * FROM repayments 
      WHERE loan_id = ?
      ORDER BY due_date ASC
    `,
      [req.params.id]
    );

    res.status(200).json({
      ...loan[0],
      repayments,
    });
  } catch (err) {
    console.error("Error getting loan:", err);
    res.status(500).json({ error: "Failed to retrieve loan" });
  }
});

// Create a new loan
router.post("/", validateLoanData, async (req, res) => {
  try {
    const {
      applicationId,
      customerId,
      officerId,
      principal,
      totalInterest,
      totalAmount,
      disbursementDate,
      dueDate,
      status,
      mpesaCode,
    } = req.body;

    // Verify application exists
    const [application] = await connection
      .promise()
      .query("SELECT id FROM loan_applications WHERE id = ?", [applicationId]);
    if (application.length === 0) {
      return res.status(404).json({ error: "Loan application not found" });
    }

    // Verify customer exists
    const [customer] = await connection
      .promise()
      .query("SELECT id FROM customers WHERE id = ?", [customerId]);
    if (customer.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Verify officer exists
    const [officer] = await connection
      .promise()
      .query("SELECT id FROM users WHERE id = ? AND role = 'officer'", [
        officerId,
      ]);
    if (officer.length === 0) {
      return res.status(404).json({ error: "Loan officer not found" });
    }

    // Create loan record
    const [result] = await connection.promise().query(
      `INSERT INTO loans 
      (application_id, customer_id, officer_id, principal, total_interest, total_amount, disbursement_date, due_date, status, mpesa_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        applicationId,
        customerId,
        officerId,
        principal,
        totalInterest,
        totalAmount,
        disbursementDate,
        dueDate,
        status,
        mpesaCode,
      ]
    );

    // Record M-Pesa transaction if applicable
    if (mpesaCode) {
      await connection.promise().query(
        `INSERT INTO mpesa_transactions 
        (loan_id, amount, type, mpesa_code, status, timestamp)
        VALUES (?, ?, 'disbursement', ?, 'completed', NOW())`,
        [result.insertId, principal, mpesaCode]
      );
    }

    res.status(201).json({
      message: "Loan created successfully",
      loanId: result.insertId,
    });
  } catch (err) {
    console.error("Error creating loan:", err);
    res.status(500).json({ error: "Failed to create loan" });
  }
});

// Update loan information
router.put("/:id", validateLoanData, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      applicationId,
      customerId,
      officerId,
      principal,
      totalInterest,
      totalAmount,
      disbursementDate,
      dueDate,
      status,
      mpesaCode,
    } = req.body;

    // Verify loan exists
    const [existing] = await connection
      .promise()
      .query("SELECT id FROM loans WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Loan not found" });
    }

    await connection.promise().query(
      `UPDATE loans SET 
        application_id = ?,
        customer_id = ?,
        officer_id = ?,
        principal = ?,
        total_interest = ?,
        total_amount = ?,
        disbursement_date = ?,
        due_date = ?,
        status = ?,
        mpesa_code = ?
      WHERE id = ?`,
      [
        applicationId,
        customerId,
        officerId,
        principal,
        totalInterest,
        totalAmount,
        disbursementDate,
        dueDate,
        status,
        mpesaCode,
        id,
      ]
    );

    res.status(200).json({
      message: "Loan updated successfully",
    });
  } catch (err) {
    console.error("Error updating loan:", err);
    res.status(500).json({ error: "Failed to update loan" });
  }
});

// Delete a loan (with validation)
router.delete("/:id", async (req, res) => {
  try {
    // Check if loan has repayments
    const [repayments] = await connection
      .promise()
      .query("SELECT id FROM repayments WHERE loan_id = ?", [req.params.id]);

    if (repayments.length > 0) {
      return res.status(400).json({
        error: "Cannot delete loan with repayment history",
      });
    }

    // Soft delete instead of hard delete
    await connection
      .promise()
      .query(
        "UPDATE loans SET status = 'archived', deleted_at = NOW() WHERE id = ?",
        [req.params.id]
      );

    res.status(200).json({
      message: "Loan archived successfully",
    });
  } catch (err) {
    console.error("Error deleting loan:", err);
    res.status(500).json({ error: "Failed to delete loan" });
  }
});

export default router;
