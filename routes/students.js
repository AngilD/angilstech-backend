import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import verifyAdmin from "../middleware/auth.js";
// import { sendSTKPush } from "../mpesa/stkPush.js";

const router = express.Router();

router.get("/", verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email, phone, age, institution, course, track, experience_level, payment_status FROM students"
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Fetch students error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      age,
      institution,
      course,
      track,
      experience_level,
      password,
    } = req.body;

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO students
      (full_name, email, phone, age, institution, course, track, experience_level, password_hash, payment_status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'PENDING')
      RETURNING id`,
      [
        full_name,
        email,
        phone,
        age,
        institution,
        course,
        track,
        experience_level,
        hashedPassword,
      ]
    );

    const studentId = result.rows[0].id;

    res.json({
      success: true,
      message: "Registration successful. Please proceed to payment.",
      studentId,
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;


