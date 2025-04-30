import express from "express";
import connection from "../config/dbConnection.js";
import { body, validationResult } from "express-validator";

const router = express.Router();
router.use(express.json());

// Validation middleware
const validateCustomerData = [
  body("firstName").notEmpty().trim().withMessage("First name is required"),
  body("lastName").notEmpty().trim().withMessage("Last name is required"),
  body("phone")
    .notEmpty()
    .isMobilePhone()
    .withMessage("Valid phone number is required"),
  body("nationalId").notEmpty().withMessage("National ID is required"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),
  body("monthlyIncome")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Income must be a positive number"),
  body("creditScore")
    .optional()
    .isInt({ min: 0, max: 850 })
    .withMessage("Credit score must be between 0-850"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Get all customers with pagination
router.get("/", async (req, res) => {
  try {
    const { role, userId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        c.*,
        u.first_name AS created_by_name
      FROM customers c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.is_active = TRUE
    `;
    let queryParams = [];

    // If the user is an officer, filter customers by created_by field
    if (role === "officer") {
      query += " AND c.created_by = ?";
      queryParams.push(userId);
    }

    // Get total count for pagination metadata
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM (${query}) as filtered`,
      queryParams
    );
    const total = countResult[0].total;

    // Get paginated customers
    query += " ORDER BY c.id LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    const [customers] = await connection.query(query, queryParams);

    res.status(200).json({
      data: customers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error getting customers:", err);
    res.status(500).json({ error: "Failed to retrieve customers" });
  }
});

// Get a single customer with loan summary
router.get("/:id", async (req, res) => {
  try {
    const [customer] = await connection.query(
      "SELECT * FROM customers WHERE id = ?",
      [req.params.id]
    );

    if (customer.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Get loan summary
    const [loanSummary] = await connection.query(
      `
      SELECT 
        COUNT(*) as total_loans,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_loans,
        SUM(CASE WHEN status = 'defaulted' THEN 1 ELSE 0 END) as defaulted_loans
      FROM loans
      WHERE customer_id = ?
    `,
      [req.params.id]
    );

    res.status(200).json({
      ...customer[0],
      loanSummary: loanSummary[0],
    });
  } catch (err) {
    console.error("Error getting customer:", err);
    res.status(500).json({ error: "Failed to retrieve customer" });
  }
});

// Delete a customer (with validation)
router.delete("/:id", async (req, res) => {
  try {
    await connection.beginTransaction();

    // Check if customer has active loans
    const [activeLoans] = await connection.query(
      "SELECT id FROM loans WHERE customer_id = ? AND status IN ('active', 'partially_paid')",
      [req.params.id]
    );

    if (activeLoans.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        error: "Cannot delete customer with active loans",
      });
    }

    // Soft delete instead of hard delete
    await connection.query(
      "UPDATE customers SET is_active = FALSE, deleted_at = NOW() WHERE id = ?",
      [req.params.id]
    );

    await connection.commit();
    res.status(200).json({
      message: "Customer deactivated successfully",
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error deleting customer:", err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

export default router;
