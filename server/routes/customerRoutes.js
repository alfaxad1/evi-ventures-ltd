// routes/customerRoutes.js
import express from "express";
import db from "../config/dbConnection.js";
const router = express.Router();
import multer from "multer";
import path from "path";
router.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
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

// Create new customer with photo uploads
router.post(
  "/",
  upload.fields([
    { name: "national_id_photo", maxCount: 1 },
    { name: "passport_photo", maxCount: 1 },
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
      await db.beginTransaction();

      // Insert customer
      const [customerResult] = await db.query(
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
          await db.query(
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
          await db.query(
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
          const [guarantorResult] = await db.query(
            `INSERT INTO guarantors 
          (customer_id, name, id_number, phone_number, relationship, 
           business_location, residence_details, national_id_photo, passport_photo)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              customerId,
              guarantor.name,
              guarantor.id_number,
              guarantor.phone_number,
              guarantor.relationship,
              guarantor.business_location,
              guarantor.residence_details,
              guarantor.national_id_photo_path,
              guarantor.passport_photo_path,
            ]
          );

          const guarantorId = guarantorResult.insertId;

          // Insert guarantor collaterals if provided
          if (guarantor.collaterals && guarantor.collaterals.length > 0) {
            for (const collateral of guarantor.collaterals) {
              await db.query(
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

      await db.commit();
      res
        .status(201)
        .json({ message: "Customer created successfully", customerId });
    } catch (error) {
      await db.rollback();
      console.error("Error creating customer:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  }
);

export default router;
