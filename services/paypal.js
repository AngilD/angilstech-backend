// Token generator
// this service talks to the outside world paypal
import axios from "axios";

export const getPaypalToken = async () => {
  const response = await axios({
    url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_SECRET
    },
    data: "grant_type=client_credentials"
  });

  return response.data.access_token;
}; 
