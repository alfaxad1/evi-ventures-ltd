import express from "express";
import connection from "../config/dbConnection.js";

const router = express.Router();
router.use(express.json());

// {
//
//     "customer_id": 1,
//     "product_id": 1,
//     "officer_id": 1,
//     "amount": "40000.00",
//     "purpose": "for a start up business",
//     "status": "pending",
//     "approval_date": null,
//     "comments": "the loaner assured to pay on time",
//
// }

// Get all loan applications
router.get("/", (req, res) => {
  const sql = "SELECT * FROM loan_applications";
  connection.query(sql, (err, result) => {
    if (err)
      return res.status(500).json({ error: "error getting loan applications" });
    res.status(200).json(result);
  });
});

// Get a loan application by ID
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM loan_applications WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err)
      return res.status(500).json({ error: "error getting loan application" });
    res.status(200).json(result);
  });
});

// Create a new loan application
router.post("/", (req, res) => {
  const {
    customerId,
    productId,
    officerId,
    amount,
    purpose,
    status,
    approvalDate,
    comments,
  } = req.body;
  const sql =
    "INSERT INTO loan_applications (customer_id, product_id, officer_id, amount, purpose, status, approval_date, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [
    customerId,
    productId,
    officerId,
    amount,
    purpose,
    status,
    approvalDate,
    comments,
  ];
  connection.query(sql, values, (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ error: "error creating loan application", err });
    res.status(200).json({
      message: "Loan application created successfully",
      Status: "Success",
    });
  });
});

// Update a loan application by ID
router.put("/:id", (req, res) => {
  const {
    customerId,
    productId,
    officerId,
    amount,
    purpose,
    status,
    approvalDate,
    comments,
  } = req.body;
  const sql =
    "UPDATE loan_applications SET customer_id = ?, product_id = ?, officer_id = ?, amount = ?, purpose = ?, status = ?, approval_date = ?, comments = ? WHERE id = ?";
  const values = [
    customerId,
    productId,
    officerId,
    amount,
    purpose,
    status,
    approvalDate,
    comments,
    req.params.id,
  ];
  connection.query(sql, values, (err, result) => {
    if (err)
      return res.status(500).json({ error: "error updating loan application" });
    res.status(200).json({
      message: "Loan application updated successfully",
      Status: "Success",
    });
  });
});

// Delete a loan application by ID
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM loan_applications WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err)
      return res.status(500).json({ error: "error deleting loan application" });
    res.status(200).json({
      message: "Loan application deleted successfully",
      Status: "Success",
    });
  });
});

export default router;
