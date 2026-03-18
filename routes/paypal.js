// API door (route)
import express from "express";
import axios from "axios";
import { getPaypalToken } from "../services/paypal.js";
import pool from "../db.js";

const router = express.Router();

// ✅ CREATE ORDER
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const token = await getPaypalToken();

    const response = await axios.post(
      `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const approvalLink = response.data.links.find(
      link => link.rel === "approve"
    ).href;

    res.json({
      success: true,
      orderID: response.data.id,
      approvalLink,
    });

  } catch (error) {
    console.error("PayPal create error:", error.response?.data || error.message);
    res.status(500).json({ error: "Create order failed" });
  }
});


// ✅ CAPTURE ORDER (ADD THIS — don’t replace)
router.post("/capture-order", async (req, res) => {
  try {
    const { orderID } = req.body;

    const token = await getPaypalToken();

    const response = await axios.post(
      `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const transaction =
      response.data.purchase_units[0].payments.captures[0];

    const transactionId = transaction.id;
    const status = transaction.status;

    if (status === "COMPLETED") {
      await pool.query(
        `UPDATE payments
         SET status = 'SUCCESS',
             transaction_id = $1
         WHERE transaction_id IS NULL
         ORDER BY id DESC
         LIMIT 1`,
        [transactionId]
      );
    }

    res.json({
      success: true,
      status,
      transactionId,
    });

  } catch (error) {
    console.error("PayPal capture error:", error.response?.data || error.message);

    res.status(500).json({
      error: "Payment capture failed",
    });
  }
});

export default router;
