// import express from "express";
// import pool from "../db.js";
// import authStudent from "../middleware/authStudent.js";

// const router = express.Router();

// router.get("/", authStudent, async (req, res) => {
//   try {
//     const studentId = req.student.id;

//     // 1️⃣ Check if student has SUCCESS payment
//     const paymentCheck = await pool.query(
//       `SELECT * FROM payments 
//        WHERE student_id = $1 
//        AND status = 'SUCCESS'
//        ORDER BY created_at DESC
//        LIMIT 1`,
//       [studentId]
//     );

//     if (paymentCheck.rows.length === 0) {
//       return res.status(403).json({
//         error: "Complete payment to access lessons"
//       });
//     }

//     // 2️⃣ Get student track
//     const student = await pool.query(
//       "SELECT track FROM students WHERE id = $1",
//       [studentId]
//     );

//     if (student.rows.length === 0) {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     const track = student.rows[0].track;

//     // 3️⃣ Fetch lessons ONLY for that track
//     const lessons = await pool.query(
//       `SELECT
//         id,
//         title,
//         description,
//         secure_url AS file_url,
//         CASE
//           WHEN resource_type LIKE 'video%' THEN 'video'
//           WHEN resource_type LIKE 'application/pdf%' THEN 'pdf'
//           ELSE 'unknown'
//         END AS file_type
//        FROM lessons
//        WHERE track = $1
//        ORDER BY id DESC`,
//       [track]
//     );

//     res.json(lessons.rows);

//   } catch (err) {
//     console.error("LESSON ACCESS ERROR:", err);
//     res.status(500).json({ error: "Failed to load lessons" });
//   }
// });

// export default router;

import express from "express";
import pool from "../db.js";
import authStudent from "../middleware/authStudent.js";

const router = express.Router();

router.get("/", authStudent, async (req, res) => {
  try {
    const studentId = req.student.id;

    // Check payment
    const pay = await pool.query(
      `SELECT * FROM payments
       WHERE student_id = $1 AND status = 'SUCCESS'
       ORDER BY id DESC LIMIT 1`,
      [studentId]
    );

    if (pay.rows.length === 0) {
      return res.status(403).json({ error: "Payment required" });
    }

    // Get student track
    const student = await pool.query(
      "SELECT track FROM students WHERE id=$1",
      [studentId]
    );

    const track = student.rows[0].track;

    // Fetch lessons for track
    const lessons = await pool.query(
      "SELECT * FROM lessons WHERE track=$1 ORDER BY id DESC",
      [track]
    );

    res.json(lessons.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load lessons" });
  }
});

export default router;
