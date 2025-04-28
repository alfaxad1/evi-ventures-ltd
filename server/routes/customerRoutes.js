// routes/customerRoutes.js
import express from "express";
import connection from "../config/dbConnection.js";
import multer from "multer";
import path from "path";
const router = express.Router();
router.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/uploads/photos");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Get all customers with pagination and filtering by creator
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, created_by } = req.query;
    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT 
        id, first_name, middle_name, last_name, phone, national_id, 
        date_of_birth, gender, address, county, occupation, 
        business_name, business_location, residence_details, 
        monthly_income, credit_score, created_by, national_id_photo, passport_photo
      FROM customers
    `;

    const whereClauses = [];
    const queryParams = [];

    // Filter by created_by if provided
    if (created_by) {
      whereClauses.push("created_by = ?");
      queryParams.push(created_by);
    }

    if (whereClauses.length > 0) {
      baseQuery += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    // Get total count for pagination
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM (${baseQuery}) as count_query`,
      queryParams
    );
    const total = countResult[0].total;

    // Add pagination
    const finalQuery = `${baseQuery} ORDER BY id DESC LIMIT ? OFFSET ?`;
    const [customers] = await connection.query(finalQuery, [
      ...queryParams,
      parseInt(limit),
      parseInt(offset),
    ]);

    res.status(200).json({
      data: customers,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// Create new customer with photo uploads
router.post(
  "/",
  upload.fields([
    { name: "national_id_photo", maxCount: 1 },
    { name: "passport_photo", maxCount: 1 },
    { name: "guarantor_id_photo_0", maxCount: 1 },
    { name: "guarantor_pass_photo_0", maxCount: 1 },
    // Add more if you expect multiple guarantors
  ]),
  async (req, res) => {
    try {
      const {
        first_name,
        middle_name,
        last_name,
        phone,
        national_id,
        date_of_birth,
        gender,
        address,
        county,
        occupation,
        business_name,
        business_location,
        residence_details,
        monthly_income,
        credit_score,
        created_by,
      } = req.body;

      // Start transaction
      await connection.beginTransaction();

      // Insert customer
      const [customerResult] = await connection.query(
        `INSERT INTO customers (
        first_name, middle_name, last_name, phone, national_id, date_of_birth,
        gender, address, county, occupation, business_name, business_location,
        residence_details, monthly_income, credit_score, created_by,
        national_id_photo, passport_photo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          first_name,
          middle_name,
          last_name,
          phone,
          national_id,
          date_of_birth,
          gender,
          address,
          county,
          occupation,
          business_name,
          business_location,
          residence_details,
          monthly_income,
          credit_score || 0,
          created_by,
          req.files["national_id_photo"]
            ? req.files["national_id_photo"][0].path
            : null,
          req.files["passport_photo"]
            ? req.files["passport_photo"][0].path
            : null,
        ]
      );

      const customerId = customerResult.insertId;

      // Insert collaterals if provided
      if (req.body.collaterals && req.body.collaterals.length > 0) {
        for (const collateral of req.body.collaterals) {
          await connection.query(
            `INSERT INTO customer_collaterals 
          (customer_id, item_name, item_count, additional_details)
          VALUES (?, ?, ?, ?)`,
            [
              customerId,
              collateral.item_name,
              collateral.item_count,
              collateral.additional_details,
            ]
          );
        }
      }

      // Insert referees if provided
      if (req.body.referees && req.body.referees.length > 0) {
        for (const referee of req.body.referees) {
          await connection.query(
            `INSERT INTO referees 
          (customer_id, name, id_number, phone_number, relationship)
          VALUES (?, ?, ?, ?, ?)`,
            [
              customerId,
              referee.name,
              referee.id_number,
              referee.phone_number,
              referee.relationship,
            ]
          );
        }
      }

      // Insert guarantors if provided
      if (req.body.guarantors && req.body.guarantors.length > 0) {
        for (const guarantor of req.body.guarantors) {
          const [guarantorResult] = await connection.query(
            `INSERT INTO guarantors 
          (customer_id, name, id_number, phone_number, relationship, 
           business_location, residence_details, id_photo, pass_photo)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              customerId,
              guarantor.name,
              guarantor.id_number,
              guarantor.phone_number,
              guarantor.relationship,
              guarantor.business_location,
              guarantor.residence_details,
              guarantor.id_photo_path,
              guarantor.pass_photo_path,
            ]
          );

          const guarantorId = guarantorResult.insertId;

          // Insert guarantor collaterals if provided
          if (guarantor.collaterals && guarantor.collaterals.length > 0) {
            for (const collateral of guarantor.collaterals) {
              await connection.query(
                `INSERT INTO guarantor_collaterals 
              (guarantor_id, item_name, item_count, additional_details)
              VALUES (?, ?, ?, ?)`,
                [
                  guarantorId,
                  collateral.item_name,
                  collateral.item_count,
                  collateral.additional_details,
                ]
              );
            }
          }
        }
      }

      await connection.commit();
      res
        .status(201)
        .json({ message: "Customer created successfully", customerId });
    } catch (error) {
      await connection.rollback();
      console.error("Error creating customer:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  }
);

// Get a customer by ID with all related data
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get customer details
    const [customerResult] = await connection.query(
      `SELECT 
        id, first_name, middle_name, last_name, phone, national_id, 
        date_of_birth, gender, address, county, occupation, 
        business_name, business_location, residence_details, 
        monthly_income, credit_score, created_by, national_id_photo, passport_photo
      FROM customers
      WHERE id = ?`,
      [id]
    );

    if (customerResult.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customer = customerResult[0];

    // Get collaterals
    const [collaterals] = await connection.query(
      `SELECT item_name, item_count, additional_details 
      FROM customer_collaterals
      WHERE customer_id = ?`,
      [id]
    );

    // Get referees
    const [referees] = await connection.query(
      `SELECT name, id_number, phone_number, relationship 
      FROM referees
      WHERE customer_id = ?`,
      [id]
    );

    // Get guarantors
    const [guarantors] = await connection.query(
      `SELECT 
        id, name, id_number, phone_number, relationship, 
        business_location, residence_details, id_photo, pass_photo
      FROM guarantors
      WHERE customer_id = ?`,
      [id]
    );

    // Get guarantor collaterals for each guarantor
    for (const guarantor of guarantors) {
      const [guarantorCollaterals] = await connection.query(
        `SELECT item_name, item_count, additional_details 
        FROM guarantor_collaterals
        WHERE guarantor_id = ?`,
        [guarantor.id]
      );
      guarantor.collaterals = guarantorCollaterals;
    }

    res.status(200).json({
      customer,
      collaterals,
      referees,
      guarantors,
    });
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});
export default router;
