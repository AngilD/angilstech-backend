import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.js";
import pool from "../db.js";
// import verifyAdmin from "../middleware/verifyAdmin.js"; // if you have it

const router = express.Router();

// ========================
// ADMIN LOGIN
// ========================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const ADMIN_EMAIL = "admin@smartlearn.com";
  const ADMIN_PASSWORD = "admin123"; 

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { role: "admin", email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token });
});

// ========================
// DELETE LESSON (ADMIN ONLY)
// ========================
router.delete("/delete-content/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Get lesson
    const result = await pool.query(
      "SELECT cloudinary_public_id FROM lessons WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const publicId = result.rows[0].cloudinary_public_id;
    console.log("Deleting Cloudinary public_id:", publicId);

    // 2️⃣ Delete from Cloudinary
    const cloudRes = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });

    console.log("Cloudinary delete response:", cloudRes);

    if (cloudRes.result !== "ok" && cloudRes.result !== "not found") {
      return res.status(500).json({
        error: "Failed to delete file from Cloudinary",
      });
    }

    // 3️⃣ Delete from DB
    await pool.query(
      "DELETE FROM lessons WHERE id = $1",
      [id]
    );

    res.json({ message: "Lesson deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
