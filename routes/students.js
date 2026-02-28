import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import verifyAdmin from "../middleware/auth.js";
import { sendSTKPush } from "../mpesa/stkPush.js";

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

// Register students

// router.post("/register", async (req, res) => {
//   try {
//     const {
//       full_name,
//       email,
//       phone,
//       age,
//       institution,
//       course,
//       track,
//       experience_level,
//       password,
//     } = req.body;

//     if (!full_name || !email || !phone) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // 1️⃣ Save student (PENDING)
//     const result = await pool.query(
//       `INSERT INTO students
//       (full_name,email,phone,age,institution,course,track,experience_level,payment_status)
//       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'PENDING')
//       RETURNING id`,
//       [
//         full_name,
//         email,
//         phone,
//         age,
//         institution,
//         course,
//         track,
//         experience_level,
//       ]
//     );

//     const studentId = result.rows[0].id;

//     // 2️⃣ Trigger STK Push
//     const stkResponse = await sendSTKPush(phone, 1);

//     // 3️⃣ Save CheckoutRequestID
//     await pool.query(
//       `UPDATE students
//        SET checkout_request_id = $1
//        WHERE id = $2`,
//       [stkResponse.CheckoutRequestID, studentId]
//     );

//     res.json({
//       success: true,
//       message: "Registration successful. Check your phone to pay.",
//       studentId,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// });
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
      password, // ✅ NOW RECEIVED
    } = req.body;

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1️⃣ HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2️⃣ SAVE STUDENT (PENDING)
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

    // 3️⃣ TRIGGER STK PUSH
    const stkResponse = await sendSTKPush(phone, 1);

    // 4️⃣ SAVE CHECKOUT REQUEST ID
    await pool.query(
      `UPDATE students
       SET checkout_request_id = $1
       WHERE id = $2`,
      [stkResponse.CheckoutRequestID, studentId]
    );

    res.json({
      success: true,
      message: "Registration successful. Check your phone to pay.",
      studentId,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


export default router;


