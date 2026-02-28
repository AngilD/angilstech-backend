import express from "express";
import pool from "../db.js";
import authStudent from "../middleware/authStudent.js";

const router = express.Router();

router.get("/", authStudent, async (req, res) => {
   try {
  const result = await pool.query(`
    SELECT
      id,
      title,
      description,
      secure_url AS file_url,
      CASE
        WHEN resource_type LIKE 'video%' THEN 'video'
        WHEN resource_type LIKE 'application/pdf%' THEN 'pdf'
        ELSE 'unknown'
      END AS file_type
    FROM lessons
  `);

    res.json(result.rows);

  } catch (err) {
    console.error("STUDENT LESSON FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to load lessons" });
  }
});

export default router;
