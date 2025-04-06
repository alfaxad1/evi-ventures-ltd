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



export default router;
