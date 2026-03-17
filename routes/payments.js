import express from "express";
import pool from "../db.js";
import { sendSTKPush } from "../mpesa/stkPush.js";

const router = express.Router();

router.post("/start", async (req, res) => {
  try {
    const { student_id, amount, method, phone } = req.body;

    if (!student_id || !amount || !method || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1️⃣ Insert payment (PENDING)
    const result = await pool.query(
      `INSERT INTO payments (student_id, amount, method, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [student_id, amount, method, "PENDING"]
    );

    const payment = result.rows[0];

    let stkResponse = null;

    // 2️⃣ If Mpesa → trigger STK Push
    if (method === "mpesa") {
      stkResponse = await sendSTKPush(phone, amount);

      // 3️⃣ Save CheckoutRequestID
      await pool.query(
        `UPDATE payments
         SET checkout_request_id = $1
         WHERE id = $2`,
        [stkResponse.CheckoutRequestID, payment.id]
      );
    }

    // 4️⃣ Response
    res.json({
      success: true,
      payment,
      stkResponse,
    });

  } catch (error) {
    console.error("Payment start error:", error);
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

export default router;
