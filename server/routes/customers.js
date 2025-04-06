import express from "express";
import connection from "../config/dbConnection.js";

const router = express.Router();
router.use(express.json());

//get all customers
router.get("/", (req, res) => {
  const sql = "SELECT * FROM customers";
  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "error getting customers" });
    res.status(200).json(result);
  });
});

//get a customer
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM customers WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "error getting customer" });
    res.status(200).json(result);
  });
});

//update a customer
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    phone,
    nationalId,
    DOB,
    gender,
    address,
    county,
    occupation,
    monthlyIncome,
    creditScore,
    createdBy,
  } = req.body;
  const sql =
    "UPDATE customers SET first_name = ?, last_name = ?, phone = ?, national_id = ?, date_of_birth = ?, gender = ?, address = ?, county = ?, occupation = ?, monthly_income = ?, credit_score = ?, created_by = ? WHERE id = ?";
  const values = [
    firstName,
    lastName,
    phone,
    nationalId,
    DOB,
    gender,
    address,
    county,
    occupation,
    monthlyIncome,
    creditScore,
    createdBy,
  ];
  connection.query(sql, [...values, id], (err, result) => {
    if (err)
      return res.status(500).json({ error: "error updating customer", err });
    res
      .status(200)
      .json({ message: "Customer updated successfully", Status: "Success" });
  });
});

//delete a customer
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM customers WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "error deleting customer" });
    res
      .status(200)
      .json({ message: "Customer deleted successfully", Status: "Success" });
  });
});

//register a customer
router.post("/", (req, res) => {
  const {
    firstName,
    lastName,
    phone,
    nationalId,
    DOB,
    gender,
    address,
    county,
    occupation,
    monthlyIncome,
    creditScore,
    createdBy,
  } = req.body;
  const sql =
    "INSERT INTO customers (first_name, last_name, phone, national_id, date_of_birth, gender, address, county, occupation, monthly_income, credit_score, created_by) VALUES (?)";
  const values = [
    firstName,
    lastName,
    phone,
    nationalId,
    DOB,
    gender,
    address,
    county,
    occupation,
    monthlyIncome,
    creditScore,
    createdBy,
  ];
  connection.query(sql, [values], (err, result) => {
    if (err)
      return res.status(500).json({ error: "error registering customer", err });
    res
      .status(200)
      .json({ message: "Customer registered successfully", Status: "Success" });
  });
});

export default router;
