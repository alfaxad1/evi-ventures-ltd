import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connection from "../config/dbConnection.js";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
dotenv.config();

const router = express.Router();
router.use(express.json());

const salt = 10;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars"); // Directory to store uploaded avatars
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpeg, .jpg, and .png files are allowed"));
    }
  },
});

//get all users
router.get("/", (req, res) => {
  const sql = "SELECT * FROM users";
  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "error getting users" });
    res.status(200).json(result);
  });
});

//get all officers
router.get("/officers", async (req, res) => {
  try {
    // Query to get all customers with the role of 'officer'
    const [officers] = await connection
      .promise()
      .query("SELECT * FROM users WHERE role = 'officer'");

    // Count the number of officers
    const count = officers.length;

    res.status(200).json({
      count, // Total number of officers
      data: officers, // List of officers
    });
  } catch (err) {
    console.error("Error getting officers:", err);
    res.status(500).json({ error: "Failed to retrieve officers" });
  }
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
router.post("/register", upload.single("avatar"), (req, res) => {
  const sql =
    "INSERT INTO users (first_name, last_name, email, password, role, is_active, avatar) VALUES (?)";
  bcrypt.hash(req.body.password, salt, (err, hash) => {
    if (err) return res.status(500).json({ error: "Error hashing password" });

    const avatarPath = req.file
      ? `/uploads/avatars/${req.file.filename}`
      : null;

    const values = [
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      hash,
      req.body.role.toLowerCase(),
      1, // is_active is set to 1 by default
      avatarPath,
    ];

    connection.query(sql, [values], (err, result) => {
      if (err) return res.status(500).json({ error: "Error registering user" });
      res.status(200).json({
        message: "User registered successfully",
        Status: "Success",
        avatar: avatarPath,
      });
    });
  });
});

//login a user
router.post("/login", (req, res) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  connection.query(sql, [req.body.email], (err, result) => {
    if (err) return res.status(500).json({ error: "error logging in user" });
    if (result.length > 0) {
      if (!result[0].is_active) {
        return res.status(403).json({ error: "User account is inactive" });
      }
      bcrypt.compare(req.body.password, result[0].password, (err, response) => {
        if (err)
          return res.status(500).json({ error: "error comparing password" });
        if (response) {
          const name = result[0].first_name + " " + result[0].last_name;
          const email = result[0].email;
          const id = result[0].id;
          const role = result[0].role;
          const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
            expiresIn: "1h",
          });

          res.status(200).json({ token, role, name, email, id });
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
