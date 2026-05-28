import axios from "axios";
import { getAccessToken } from "../mpesa/mPesaauth.js";

export const sendSTKPush = async (phone, amount) => {

  const formattedPhone = phone.replace(/^0/, "254");

  const token = await getAccessToken();

  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);

  const password = Buffer.from(
    process.env.MPESA_SHORTCODE +
    process.env.MPESA_PASSKEY +
    timestamp
  ).toString("base64");

   try {
    console.log("Phone sent:",formattedPhone);

  const response = await axios.post(
    "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: "AngilsTech",
      TransactionDesc: "Tech Club Registration",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;

} catch (error) {
  console.log("MPESA ERROR:", error.response?.data);

  throw error;
}

};
