import dotenv from "dotenv"
dotenv.config();

import express from "express";
import cors from "cors";
import pool from "./db.js";

import { getAccessToken } from "./mpesa/mPesaauth.js";


const app = express();
const PORT = process.env.PORT || 5000;

// const studentsRoutes = require("./routes/students");
// const adminRoutes = require("./routes/admin");
// const mpesaRoutes = require("./routes/mpesa");
import mpesaRoutes from "./routes/mpesa.js";
import adminRoutes from "./routes/admin.js";
import studentsRoutes from "./routes/students.js";
import adminUploads from "./routes/adminUploads.js";
import lessonsRoutes from "./routes/lessons.js";
import studentAuth from "./routes/studentAuth.js";
import studentLessons from "./routes/studentLessons.js";
import paymentsRoutes from "./routes/payments.js";
import paypalRoutes from "./routes/paypal.js";



app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://angilstech-frontend.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// app.use(express.json);
app.use(express.json())

// register routes
app.use("/api/admin", adminRoutes);
app.use("/api/mpesa", mpesaRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/admin", adminUploads);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/studentAuth", studentAuth);
app.use("/api/studentLessons", studentLessons);
app.use("/api/payments", paymentsRoutes);
app.use("/api/payments/paypal", paypalRoutes);


// import studentAuthRoutes from "./routes/studentAuth.js";

// app.use("/api/studentAuth", studentAuth);

// 
/* Test DB connection */
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/users', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT full_name, email FROM students');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/* Test route */
app.get("/", (req, res) => {
  res.send("AngilsTech Backend Running 🚀");
});

app.get("/ping", (req, res) => {
  res.json({message:"Hello Mr.Angil"});
});

// console.log("ENV CHECK",process.env.DB_PASSWORD);


app.get("/api/mpesa/token", async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

