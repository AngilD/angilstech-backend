export const generatePassword = () => {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);
  
    const password = Buffer.from(
      process.env.MPESA_SHORTCODE +
        process.env.MPESA_PASSKEY +
        timestamp
    ).toString("base64");
  
    return { password, timestamp };
  };
//   console.log("MPESACODE",process.env.MPESA_SHORTCODE)  