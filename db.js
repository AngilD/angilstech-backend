// import pkg from 'pg';
// const { Pool } = pkg;


// import dotenv from 'dotenv';
// dotenv.config();


// const pool = new Pool({
//  host: process.env.DB_HOST,
//  port: process.env.DB_PORT,
//  user: process.env.DB_USER,
//  password: process.env.DB_PASSWORD,
//  database: process.env.DB_NAME,
//  max: 20,
// });
import pkg from "pg";
const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});



//  console.log("DB_PASSWORD",process.env.DB_PASSWORD)

export default pool;