import express from "express";
import connection from "../config/dbConnection.js";

const router = express.Router();
router.use(express.json());

// Get all loans
router.get("/", (req, res) => {
  const sql = "SELECT * FROM loans";
  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "error getting loans" });
    res.status(200).json(result);
  });
});

//get loan details
router.get("/loan-details", (req, res) => {
  const sql = `
    SELECT 
      CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
      c.national_id,
      c.phone,
      lp.name AS loan_product,
      la.purpose,
      l.disbursement_date,
      l.due_date,
      l.principal,
      l.total_amount
    FROM loans l
    JOIN customers c ON l.customer_id = c.id
    JOIN loan_applications la ON l.application_id = la.id
    JOIN loan_products lp ON la.product_id = lp.id
  `;
  connection.query(sql, (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Error fetching loan details", err });
    res.status(200).json(result);
  });
});

// Get loan by id
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM loans WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "error getting loan" });
    res.status(200).json(result);
  });
});

// Create loan
router.post("/", (req, res) => {
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
  const sql =
    "INSERT INTO loans (application_id, customer_id, officer_id, principal, total_interest, total_amount, disbursement_date, due_date, status, mpesa_code) VALUES (?)";
  const values = [
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
  ];
  connection.query(sql, [values], (err, result) => {
    if (err) return res.status(500).json({ error: "error creating loan", err });
    res.status(200).json({
      message: "Loan created successfully",
      Status: "Success",
    });
  });
});

// Update loan
router.put("/:id", (req, res) => {
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
  const sql =
    "UPDATE loans SET application_id = ?, customer_id = ?, officer_id = ?, principal = ?, total_interest = ?, total_amount = ?, disbursement_date = ?, due_date = ?, status = ?, mpesa_code = ? WHERE id = ?";
  const values = [
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
    req.params.id,
  ];
  connection.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: "error updating loan", err });
    res.status(200).json({
      message: "Loan updated successfully",
      Status: "Success",
    });
  });
});

// Delete loan
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM loans WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "error deleting loan" });
    res
      .status(200)
      .json({ message: "Loan deleted successfully", Status: "Success" });
  });
});

export default router;
