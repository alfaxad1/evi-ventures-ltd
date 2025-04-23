import express from "express";
import connection from "../config/dbConnection.js";
import { body, validationResult } from "express-validator";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(express.json());

// Validation middleware
const validateLoanApplication = [
  body("customerId").isInt().withMessage("Valid customer ID required"),
  body("productId").isInt().withMessage("Valid product ID required"),
  //body("officerId").isInt().withMessage("Valid officer ID required"),
  body("amount")
    .isFloat({ min: 1000 })
    .withMessage("Amount must be at least 1000"),
  body("purpose")
    .isLength({ min: 10 })
    .withMessage("Purpose must be at least 10 characters"),
  body("status")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .withMessage("Invalid status"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Get all loan applications with pagination and filters
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerId, officerId } = req.query;
    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT la.*, 
        c.first_name as customer_first_name, 
        c.last_name as customer_last_name,
        u.first_name as officer_first_name,
        u.last_name as officer_last_name,
        lp.name as product_name
      FROM loan_applications la
      JOIN customers c ON la.customer_id = c.id
      JOIN users u ON la.officer_id = u.id
      JOIN loan_products lp ON la.product_id = lp.id
    `;
    const whereClauses = [];
    const queryParams = [];

    if (status) {
      whereClauses.push("la.status = ?");
      queryParams.push(status);
    }
    if (customerId) {
      whereClauses.push("la.customer_id = ?");
      queryParams.push(customerId);
    }
    if (officerId) {
      whereClauses.push("la.officer_id = ?");
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

    // Add pagination
    const finalQuery = `${baseQuery} LIMIT ? OFFSET ?`;
    const [applications] = await connection
      .promise()
      .query(finalQuery, [...queryParams, parseInt(limit), offset]);

    res.status(200).json({
      data: applications,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error getting loan applications:", err);
    res.status(500).json({ error: "Failed to retrieve loan applications" });
  }
});

// Get pending loan applications with extended customer details
router.get("/pending", async (req, res) => {
  try {
    const [applications] = await connection.promise().query(`
      SELECT 
        la.id AS application_id,  
        la.customer_id,
        la.product_id,
        la.officer_id,
        la.amount,
        la.purpose,
        la.status,
        la.created_at,
        la.approval_date,
        la.comments,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_full_name,
        c.occupation,
        c.monthly_income,
        c.address,
        c.phone,
        c.national_id,
        lp.name AS product_name,
        lp.min_amount,
        lp.max_amount,
        lp.interest_rate,
        lp.duration_days
      FROM loan_applications la
      JOIN customers c ON la.customer_id = c.id
      JOIN loan_products lp ON la.product_id = lp.id
      WHERE la.status = 'pending'
      ORDER BY la.created_at DESC
    `);

    res.status(200).json(applications);
  } catch (err) {
    console.error("Error getting pending applications:", err);
    res.status(500).json({
      error: "Failed to retrieve pending applications",
      //details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

//rejected loans
router.get("/rejected", async (req, res) => {
  try {
    const { officerId, role } = req.query; // Get officerId and role from query parameters

    let sql = `
      SELECT 
        la.id AS application_id,  
        la.customer_id,
        la.product_id,
        la.officer_id,
        la.amount,
        la.purpose,
        la.status,
        la.created_at,
        la.approval_date,
        CASE 
          WHEN la.comments LIKE '%Rejection reason:%' 
          THEN SUBSTRING(la.comments, 
                LOCATE('Rejection reason:', la.comments) + CHAR_LENGTH('Rejection reason:') + 1)
          ELSE la.comments
        END AS rejection_reason,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_full_name,
        c.occupation,
        c.monthly_income,
        c.address,
        c.phone,
        c.national_id,
        lp.name AS product_name,
        lp.min_amount,
        lp.max_amount,
        lp.interest_rate,
        lp.duration_days
      FROM loan_applications la
      JOIN customers c ON la.customer_id = c.id
      JOIN loan_products lp ON la.product_id = lp.id
      WHERE la.status = 'rejected'
    `;

    const queryParams = [];

    // Add filtering for officer role
    if (role === "officer") {
      sql += " AND la.officer_id = ?";
      queryParams.push(officerId);
    }

    sql += " ORDER BY la.created_at DESC";

    const [applications] = await connection.promise().query(sql, queryParams);

    res.status(200).json(applications);
  } catch (err) {
    console.error("Error getting rejected applications:", err);
    res.status(500).json({
      error: "Failed to retrieve rejected applications",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Get loan application by ID with full details
router.get("/:id", async (req, res) => {
  try {
    const [application] = await connection.promise().query(
      `
      SELECT 
        la.*,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        c.phone as customer_phone,
        u.first_name as officer_first_name,
        u.last_name as officer_last_name,
        lp.name as product_name,
        lp.interest_rate,
        lp.duration_days
      FROM loan_applications la
      JOIN customers c ON la.customer_id = c.id
      JOIN users u ON la.officer_id = u.id
      JOIN loan_products lp ON la.product_id = lp.id
      WHERE la.id = ?
    `,
      [req.params.id]
    );

    if (application.length === 0) {
      return res.status(404).json({ error: "Loan application not found" });
    }

    res.status(200).json(application[0]);
  } catch (err) {
    console.error("Error getting loan application:", err);
    res.status(500).json({ error: "Failed to retrieve loan application" });
  }
});

// Approve a loan application
router.put("/approve/:id", authorizeRoles(["admin"]), async (req, res) => {
  const { disbursedAmount } = req.body;

  if (!disbursedAmount || disbursedAmount <= 0) {
    return res.status(400).json({
      error: "Disbursed amount is required and must be greater than 0",
    });
  }

  try {
    await connection.promise().beginTransaction();

    // Get application details
    const [application] = await connection
      .promise()
      .query("SELECT * FROM loan_applications WHERE id = ?", [req.params.id]);

    if (application.length === 0) {
      return res.status(404).json({ error: "Loan application not found" });
    }

    const { installment_type, customer_id, product_id } = application[0];

    // Calculate interest and total amount
    const interestAmount =
      disbursedAmount * (application[0].interest_rate / 100);
    const totalAmount = disbursedAmount + interestAmount;

    // Calculate installment amount and first due date
    let installmentAmount, firstDueDate;
    if (installment_type === "daily") {
      installmentAmount = totalAmount / 30; // Daily installment
      firstDueDate = new Date();
      firstDueDate.setDate(firstDueDate.getDate() + 1);
    } else if (installment_type === "weekly") {
      installmentAmount = totalAmount / 4; // Weekly installment
      firstDueDate = new Date();
      firstDueDate.setDate(firstDueDate.getDate() + 7);
    }

    // Create loan record
    const [loanResult] = await connection.promise().query(
      `INSERT INTO loans 
      (application_id, customer_id, product_id, total_amount, installment_amount, installment_type, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        req.params.id,
        customer_id,
        product_id,
        totalAmount,
        installmentAmount,
        installment_type,
        firstDueDate,
      ]
    );

    await connection.promise().commit();
    res.status(200).json({
      message: "Loan approved successfully",
      loanId: loanResult.insertId,
    });
  } catch (err) {
    await connection.promise().rollback();
    console.error("Error approving loan:", err);
    res.status(500).json({ error: "Failed to approve loan" });
  }
});

// Reject a loan application
router.put("/reject/:id", authorizeRoles(["admin"]), async (req, res) => {
  try {
    const [result] = await connection
      .promise()
      .query(
        "UPDATE loan_applications SET status = 'rejected', comments = CONCAT(IFNULL(comments, ''), ?) WHERE id = ? AND status = 'pending'",
        [
          req.body.reason ? `\nRejection reason: ${req.body.reason}` : "",
          req.params.id,
        ]
      );

    if (result.affectedRows === 0) {
      return res
        .status(400)
        .json({ error: "Application not found or already processed" });
    }

    res.status(200).json({
      message: "Loan application rejected successfully",
    });
  } catch (err) {
    console.error("Error rejecting loan application:", err);
    res.status(500).json({ error: "Failed to reject loan application" });
  }
});

// Create a new loan application
router.post("/", validateLoanApplication, async (req, res) => {
  try {
    const {
      customerId,
      productId,
      officerId = 3,
      amount,
      purpose,
      status = "pending",
      comments,
      installmentType, // Add installment type
    } = req.body;

    // Verify customer exists
    const [customer] = await connection
      .promise()
      .query("SELECT id FROM customers WHERE id = ?", [customerId]);
    if (customer.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Verify product exists
    const [product] = await connection
      .promise()
      .query("SELECT id FROM loan_products WHERE id = ?", [productId]);
    if (product.length === 0) {
      return res.status(404).json({ error: "Loan product not found" });
    }

    // Calculate expected completion date (30 days from now)
    const expectedCompletionDate = new Date();
    expectedCompletionDate.setDate(expectedCompletionDate.getDate() + 30);

    // Insert loan application
    const [result] = await connection.promise().query(
      `INSERT INTO loan_applications 
      (customer_id, product_id, officer_id, amount, purpose, status, comments, installment_type, expected_completion_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        productId,
        officerId,
        amount,
        purpose,
        status,
        comments,
        installmentType,
        expectedCompletionDate,
      ]
    );

    res.status(201).json({
      message: "Loan application created successfully",
      applicationId: result.insertId,
    });
  } catch (err) {
    console.error("Error creating loan application:", err);
    res.status(500).json({ error: "Failed to create loan application" });
  }
});

// Update a loan application
router.put("/:id", validateLoanApplication, async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, productId, officerId, amount, purpose, status } =
      req.body;

    // Verify application exists and is pending
    const [existing] = await connection
      .promise()
      .query(
        "SELECT id FROM loan_applications WHERE id = ? AND status = 'pending'",
        [id]
      );
    if (existing.length === 0) {
      return res
        .status(400)
        .json({ error: "Application not found or already processed" });
    }

    await connection.promise().query(
      `UPDATE loan_applications SET 
        customer_id = ?, 
        product_id = ?, 
        officer_id = ?, 
        amount = ?, 
        purpose = ?, 
        status = ?
      WHERE id = ?`,
      [customerId, productId, officerId, amount, purpose, status, id]
    );

    res.status(200).json({
      message: "Loan application updated successfully",
    });
  } catch (err) {
    console.error("Error updating loan application:", err);
    res.status(500).json({ error: "Failed to update loan application" });
  }
});

// Delete a loan application
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await connection
      .promise()
      .query(
        "DELETE FROM loan_applications WHERE id = ? AND status = 'pending'",
        [req.params.id]
      );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        error: "Application not found or already processed",
      });
    }

    res.status(200).json({
      message: "Loan application deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting loan application:", err);
    res.status(500).json({ error: "Failed to delete loan application" });
  }
});

export default router;
