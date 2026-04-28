import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET ALL LESSONS (for admin + UI): Lessons displayed on Admindashboard
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, description, track FROM lessons ORDER BY created_at DESC"
    );

    res.json(result.rows);

  } catch (err) {
    console.error("GET LESSONS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
});

export default router;
