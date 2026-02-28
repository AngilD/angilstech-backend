// import axios from "axios";

// const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
// const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;

// const AUTH_URL =
//   "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

// export const getAccessToken = async () => {
//   const auth = Buffer.from(
//     `${CONSUMER_KEY}:${CONSUMER_SECRET}`
//   ).toString("base64");

//   const response = await axios.get(AUTH_URL, {
//     headers: {
//       Authorization: `Basic ${auth}`,
//     },
//   });

//   return response.data.access_token;
// };


import axios from "axios";

export const getAccessToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  return response.data.access_token;
};
