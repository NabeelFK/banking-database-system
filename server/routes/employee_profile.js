const express = require("express");
const pool = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/employee/profile
router.get("/", requireAuth, requireRole("employee", "manager"), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.UserID, u.Name, u.Email, u.Phone,
              e.Role, e.EmergencyNo, b.Name AS BranchName
       FROM \`User\` u
       JOIN Employee e ON u.UserID = e.UserID
       LEFT JOIN Branch b ON e.BranchID = b.BranchID
       WHERE u.UserID = ? LIMIT 1`,
      [req.user.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Employee not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PATCH /api/employee/profile
router.patch("/", requireAuth, requireRole("employee", "manager"), async (req, res) => {
  try {
    const { name, email, phone, emergencyNo } = req.body;
    if (!name && !email && !phone && !emergencyNo) {
      return res.status(400).json({ error: "At least one field required" });
    }

    const userFields = [];
    const userValues = [];
    if (name)  { userFields.push("Name = ?");  userValues.push(name); }
    if (email) { userFields.push("Email = ?"); userValues.push(email); }
    if (phone) { userFields.push("Phone = ?"); userValues.push(phone); }

    if (userFields.length > 0) {
      userValues.push(req.user.userId);
      await pool.execute(
        `UPDATE \`User\` SET ${userFields.join(", ")} WHERE UserID = ?`,
        userValues
      );
    }

    if (emergencyNo) {
      await pool.execute(
        "UPDATE Employee SET EmergencyNo = ? WHERE UserID = ?",
        [emergencyNo, req.user.userId]
      );
    }

    const [rows] = await pool.execute(
      `SELECT u.UserID, u.Name, u.Email, u.Phone,
              e.Role, e.EmergencyNo, b.Name AS BranchName
       FROM \`User\` u
       JOIN Employee e ON u.UserID = e.UserID
       LEFT JOIN Branch b ON e.BranchID = b.BranchID
       WHERE u.UserID = ? LIMIT 1`,
      [req.user.userId]
    );
    res.json({ message: "Profile updated", user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
