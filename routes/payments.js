// routes/payments.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/start", async (req, res) => {
  try {
    const { student_id, amount, method } = req.body;

    const result = await pool.query(
      `INSERT INTO payments (student_id, amount, method, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [student_id, amount, method, "PENDING"]
    );

    res.json({
      success: true,
      payment: result.rows[0],
    });

  } catch (error) {
    console.error("Payment start error:", error);
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

export default router;
