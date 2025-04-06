import express from "express";
import connection from "../config/dbConnection.js";

const router = express.Router();
router.use(express.json());

// Middleware to check if the request body is empty
router.use((req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body cannot be empty" });
  }
  next();
});

// Middleware to check if the request body has the required fields
router.use((req, res, next) => {
  const requiredFields = [
    "loanId",
    "amount",
    "dueDate",
    "paidDate",
    "status",
    "mpesaCode",
  ];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `${field} is required` });
    }
  }
  next();
});

// Get all repayments
router.get("/", (req, res) => {
  const sql = "SELECT * FROM repayments";
  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "error getting repayments" });
    res.status(200).json(result);
  });
});

// Get a repayment by id
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM repayments WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "error getting repayment" });
    res.status(200).json(result);
  });
});

// Create a repayment
router.post("/", (req, res) => {
  const { loanId, amount, dueDate, paidDate, status, mpesaCode } = req.body;
  const sql =
    "INSERT INTO repayments (loan_id, amount, due_date, paid_date, status, mpesa_code) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [loanId, amount, dueDate, paidDate, status, mpesaCode];
  connection.query(sql, values, (err, result) => {
    if (err)
      return res.status(500).json({ error: "error creating repayment", err });
    res
      .status(200)
      .json({ message: "Repayment created successfully", Status: "Success" });
  });
});

// Update a repayment
router.put("/:id", (req, res) => {
  const { loanId, amount, dueDate, paidDate, status, mpesaCode } = req.body;
  const sql =
    "UPDATE repayments SET loan_id = ?, amount = ?, due_date = ?, paid_date = ?, status = ?, mpesa_code = ? WHERE id = ?";
  const values = [
    loanId,
    amount,
    dueDate,
    paidDate,
    status,
    mpesaCode,
    req.params.id,
  ];
  connection.query(sql, values, (err, result) => {
    if (err)
      return res.status(500).json({ error: "error updating repayment", err });
    res.status(200).json(result);
  });
});

// Delete a repayment
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM repayments WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "error deleting repayment" });
    res.status(200).json(result);
  });
});

export default router;
