const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/customer/profile
router.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT UserID, Name, Email, Phone FROM `User` WHERE UserID = ? LIMIT 1",
      [req.user.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PATCH /api/customer/profile
router.patch("/", requireAuth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name && !email && !phone) {
      return res.status(400).json({ error: "At least one field required" });
    }
    const fields = [];
    const values = [];
    if (name)  { fields.push("Name = ?");  values.push(name); }
    if (email) { fields.push("Email = ?"); values.push(email); }
    if (phone) { fields.push("Phone = ?"); values.push(phone); }
    values.push(req.user.userId);
    await pool.execute(
      `UPDATE \`User\` SET ${fields.join(", ")} WHERE UserID = ?`,
      values
    );
    const [rows] = await pool.execute(
      "SELECT UserID, Name, Email, Phone FROM `User` WHERE UserID = ? LIMIT 1",
      [req.user.userId]
    );
    res.json({ message: "Profile updated", user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
