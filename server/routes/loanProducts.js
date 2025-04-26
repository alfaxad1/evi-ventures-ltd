import express from "express";
import connection from "../config/dbConnection.js";
import { body, validationResult } from "express-validator";

const router = express.Router();
router.use(express.json());

// Validation middleware
const validateLoanProduct = [
  body("name").notEmpty().trim().withMessage("Product name is required"),
  body("description").optional().trim(),
  body("minAmount")
    .isFloat({ min: 0 })
    .withMessage("Minimum amount must be a positive number"),
  body("maxAmount")
    .isFloat({ min: 0 })
    .withMessage("Maximum amount must be a positive number"),
  body("interestRate")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Interest rate must be between 0-100"),
  body("durationDays")
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 day"),
  body("processingFee")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Processing fee must be positive"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Additional validation: maxAmount should be >= minAmount
    if (parseFloat(req.body.minAmount) > parseFloat(req.body.maxAmount)) {
      return res.status(400).json({
        error: "Maximum amount must be greater than or equal to minimum amount",
      });
    }
    next();
  },
];

// Get all loan products with optional filters
router.get("/", async (req, res) => {
  try {
    const { isActive, minAmount, maxAmount } = req.query;

    let query = "SELECT * FROM loan_products";
    const conditions = [];
    const params = [];

    if (isActive !== undefined) {
      conditions.push("is_active = ?");
      params.push(isActive === "true");
    }
    if (minAmount) {
      conditions.push("min_amount >= ?");
      params.push(parseFloat(minAmount));
    }
    if (maxAmount) {
      conditions.push("max_amount <= ?");
      params.push(parseFloat(maxAmount));
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY name ASC";

    const [products] = await connection.query(query, params);
    res.status(200).json(products);
  } catch (err) {
    console.error("Error getting loan products:", err);
    res.status(500).json({ error: "Failed to retrieve loan products" });
  }
});

// Get loan product by ID with usage statistics
router.get("/:id", async (req, res) => {
  try {
    const [product] = await connection.query(
      "SELECT * FROM loan_products WHERE id = ?",
      [req.params.id]
    );

    if (product.length === 0) {
      return res.status(404).json({ error: "Loan product not found" });
    }

    // Get usage statistics from loan_applications instead of loans
    const [stats] = await connection.query(
      `
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_applications,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_applications
      FROM loan_applications
      WHERE product_id = ?
    `,
      [req.params.id]
    );

    res.status(200).json({
      ...product[0],
      statistics: stats[0],
    });
  } catch (err) {
    console.error("Error getting loan product:", err);
    res.status(500).json({ error: "Failed to retrieve loan product" });
  }
});

// Create a new loan product
router.post("/", validateLoanProduct, async (req, res) => {
  try {
    const {
      name,
      description,
      minAmount,
      maxAmount,
      interestRate,
      durationDays,
      processingFee = 0,
      isActive = true,
    } = req.body;

    // Check for duplicate product name
    const [existing] = await connection.query(
      "SELECT id FROM loan_products WHERE name = ?",
      [name]
    );

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: "Loan product with this name already exists" });
    }

    const [result] = await connection.query(
      `INSERT INTO loan_products 
      (name, description, min_amount, max_amount, interest_rate, duration_days, processing_fee, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        minAmount,
        maxAmount,
        interestRate,
        durationDays,
        processingFee,
        isActive,
      ]
    );

    res.status(201).json({
      message: "Loan product created successfully",
      productId: result.insertId,
    });
  } catch (err) {
    console.error("Error creating loan product:", err);
    res.status(500).json({ error: "Failed to create loan product" });
  }
});

// Update a loan product
router.put("/:id", validateLoanProduct, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      minAmount,
      maxAmount,
      interestRate,
      durationDays,
      processingFee,
      isActive,
    } = req.body;

    // Verify product exists
    const [existing] = await connection.query(
      "SELECT id FROM loan_products WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Loan product not found" });
    }

    // Check for duplicate product name (excluding current product)
    const [duplicate] = await connection.query(
      "SELECT id FROM loan_products WHERE name = ? AND id != ?",
      [name, id]
    );

    if (duplicate.length > 0) {
      return res
        .status(409)
        .json({ error: "Another loan product with this name already exists" });
    }

    await connection.query(
      `UPDATE loan_products SET 
        name = ?,
        description = ?,
        min_amount = ?,
        max_amount = ?,
        interest_rate = ?,
        duration_days = ?,
        processing_fee = ?,
        is_active = ?
      WHERE id = ?`,
      [
        name,
        description,
        minAmount,
        maxAmount,
        interestRate,
        durationDays,
        processingFee,
        isActive,
        id,
      ]
    );

    res.status(200).json({
      message: "Loan product updated successfully",
    });
  } catch (err) {
    console.error("Error updating loan product:", err);
    res.status(500).json({ error: "Failed to update loan product" });
  }
});

// Delete a loan product (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    // Check if product has active loans
    const [activeLoans] = await connection.query(
      "SELECT id FROM loans WHERE product_id = ? AND status IN ('active', 'partially_paid')",
      [req.params.id]
    );

    if (activeLoans.length > 0) {
      return res.status(400).json({
        error: "Cannot delete product with active loans",
      });
    }

    // Soft delete instead of hard delete
    await connection.query(
      "UPDATE loan_products SET is_active = FALSE, deleted_at = NOW() WHERE id = ?",
      [req.params.id]
    );

    res.status(200).json({
      message: "Loan product deactivated successfully",
    });
  } catch (err) {
    console.error("Error deleting loan product:", err);
    res.status(500).json({ error: "Failed to delete loan product" });
  }
});

export default router;
