import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connection from "../config/dbConnection.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
router.use(express.json());

const salt = 10;

//get all users
router.get("/", (req, res) => {
  const sql = "SELECT * FROM users";
  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "error getting users" });
    res.status(200).json(result);
  });
});

//get a user
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM users WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "error getting user" });
    res.status(200).json(result);
  });
});

//update a user
router.put("/:id", (req, res) => {
  const sql = "UPDATE users SET ? WHERE id = ?";
  connection.query(sql, [req.body, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "error updating user" });
    res
      .status(200)
      .json({ message: "User updated successfully", Status: "Success" });
  });
});

//delete a user
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM users WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "error deleting user" });
    res
      .status(200)
      .json({ message: "User deleted successfully", Status: "Success" });
  });
});

//register a user
router.post("/register", (req, res) => {
  const sql =
    "INSERT INTO users (first_name, last_name, email, password, role, is_active) VALUES (?)";
  bcrypt.hash(req.body.password, salt, (err, hash) => {
    if (err) return res.status(500).json({ error: "error hashing password" });
    const values = [
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      hash,
      req.body.role.toLowerCase(),
      req.body.isActive,
    ];
    connection.query(sql, [values], (err, result) => {
      if (err) return res.status(500).json({ error: "error registering user" });
      res
        .status(200)
        .json({ message: "User registered successfully", Status: "Success" });
    });
  });
});

//login a user
router.post("/login", (req, res) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  connection.query(sql, [req.body.email], (err, result) => {
    if (err) return res.status(500).json({ error: "error logging in user" });
    if (result.length > 0) {
      bcrypt.compare(req.body.password, result[0].password, (err, response) => {
        if (err)
          return res.status(500).json({ error: "error comparing password" });
        if (response) {
          const token = jwt.sign({ id: result[0].id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
          });
          res.status(200).json({ token });
        } else {
          res.status(401).json({ error: "Invalid email or password" });
        }
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  });
});

export default router;
