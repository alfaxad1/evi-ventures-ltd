import express from "express";
import connection from "../config/dbConnection.js";

const router = express.Router();
router.use(express.json());

// Get all loan products
router.get("/", (req, res) => {
  const sql = "SELECT * FROM loan_products";
  connection.query(sql, (err, result) => {
    if (err)
      return res.status(500).json({ error: "error getting loan products" });
    res.status(200).json(result);
  });
});

// Get a loan product by ID
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM loan_products WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err)
      return res.status(500).json({ error: "error getting loan product" });
    res.status(200).json(result);
  });
});

// Create a new loan product
router.post("/", (req, res) => {
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
  const sql =
    "INSERT INTO loan_products (name, description, min_amount, max_amount, interest_rate, duration_days, processing_fee, is_active) VALUES (?)";
  const values = [
    name,
    description,
    minAmount,
    maxAmount,
    interestRate,
    durationDays,
    processingFee,
    isActive,
  ];
  connection.query(sql, [values], (err, result) => {
    if (err)
      return res.status(500).json({ error: "error creating loan product" });
    res.status(200).json({
      message: "Loan product created successfully",
      Status: "Success",
    });
  });
});

// Update a loan product by ID
router.put("/:id", (req, res) => {
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
  const sql =
    "UPDATE loan_products SET name = ?, description = ?, min_amount = ?, max_amount = ?, interest_rate = ?, duration_days = ?, processing_fee = ?, is_active = ? WHERE id = ?";
  const values = [
    name,
    description,
    minAmount,
    maxAmount,
    interestRate,
    durationDays,
    processingFee,
    isActive,
    req.params.id,
  ];
  connection.query(sql, values, (err, result) => {
    if (err)
      return res.status(500).json({ error: "error updating loan product" });
    res.status(200).json({
      message: "Loan product updated successfully",
      Status: "Success",
    });
  });
});

// Delete a loan product by ID
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM loan_products WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err)
      return res.status(500).json({ error: "error deleting loan product" });
    res.status(200).json({
      message: "Loan product deleted successfully",
      Status: "Success",
    });
  });
});

export default router;
