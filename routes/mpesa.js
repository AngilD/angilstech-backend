// export default router;
import express from "express";
import axios from "axios";
import { getAccessToken } from "../mpesa/mPesaauth.js";
import { generatePassword } from "../mpesa/utils.js";
import pool from "../db.js";


const router = express.Router();

// Ask mpesa to request money
router.post("/stk-push", async (req, res) => {
  const { phone, amount } = req.body;

  try {
    const token = await getAccessToken();
    const { password, timestamp } = generatePassword();

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: "AngilsTech",
        TransactionDesc: "Payment",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "STK ERROR:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "STK Push Failed" });
  }
});
 
router.post("/callback", async (req, res) => {
  try {
    const callback = req.body?.Body?.stkCallback;

    if (!callback) {
      return res.status(400).json({ error: "Invalid callback format" });
    }

    const {
      CheckoutRequestID,
      ResultCode,
      ResultDesc
    } = callback;

    console.log("📩 MPESA CALLBACK:", callback);

    if (ResultCode === 0) {
      
      const metadata = callback.CallbackMetadata?.Item || [];

      const mpesaReceipt = metadata.find(
        item => item.Name === "MpesaReceiptNumber"
      )?.Value;

      // ✅ Update payments table
      await pool.query(
        `UPDATE payments
        SET status = 'SUCCESS',
            transaction_id = $1
        WHERE checkout_request_id = $2`,
        [mpesaReceipt, CheckoutRequestID]
      );

      console.log("✅ Payment SUCCESS:", mpesaReceipt);

    } else {
      // ❌ Payment failed or cancelled
      await pool.query(
        `UPDATE payments
         SET status = 'FAILED'
         WHERE checkout_request_id = $1`,
        [CheckoutRequestID]
      );
    }

    res.json({
      ResultCode: 0,
      ResultDesc: "Accepted"
    });
  } catch (error) {
    console.error("❌ CALLBACK ERROR:", error);
    res.status(500).json({ error: "Callback processing failed" });
  }
});

export default router;



