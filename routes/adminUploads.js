import express from "express";
import multer from "multer";
import storage from "../config/storage.js";
import pool from "../db.js";

const router = express.Router();
const upload = multer({ storage });

router.post("/upload-content", upload.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Save lesson to DB
    const result = await pool.query(
      `INSERT INTO lessons 
        (title, description, cloudinary_public_id, resource_type, secure_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        title,
        description,
        file.filename,     // Cloudinary public_id
        file.mimetype,     // video/mp4, application/pdf
        file.path          // secure_url
      ]
    );

    res.json({
      message: "Lesson uploaded & saved successfully",
      lesson: result.rows[0],
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
