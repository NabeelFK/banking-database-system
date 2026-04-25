const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// POST /api/employee/create-account — manager creates a new employee account
router.post("/", requireAuth, requireRole("manager"), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      name, email, password, phone, emergencyNo,
      role, branchId,
      dependentName, dependentRelationship, dependentDob,
    } = req.body;

    if (!name || !email || !password || !role) {
      connection.release();
      return res.status(400).json({ error: "name, email, password, and role are required" });
    }

    const validRoles = ["Teller", "Employee", "Manager"];
    if (!validRoles.includes(role)) {
      connection.release();
      return res.status(400).json({ error: `role must be one of: ${validRoles.join(", ")}` });
    }

    const [existing] = await connection.execute(
      "SELECT UserID FROM `User` WHERE Email = ?",
      [email]
    );
    if (existing.length > 0) {
      connection.release();
      return res.status(409).json({ error: "Email already in use" });
    }

    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash(password, 10);
    const [userResult] = await connection.execute(
      "INSERT INTO `User` (Name, Phone, Email, Password_hash) VALUES (?, ?, ?, ?)",
      [name, phone || null, email, passwordHash]
    );
    const userId = userResult.insertId;

    await connection.execute(
      "INSERT INTO Employee (UserID, EmergencyNo, Role, BranchID, SupervisorID) VALUES (?, ?, ?, ?, ?)",
      [userId, emergencyNo || null, role, branchId || null, req.user.userId]
    );

    if (dependentName && dependentDob) {
      await connection.execute(
        "INSERT INTO Dependent (UserID, Name, Relationship, DOB) VALUES (?, ?, ?, ?)",
        [userId, dependentName, dependentRelationship || null, dependentDob]
      );
    }

    await connection.commit();
    connection.release();

    res.status(201).json({ message: "Employee account created", userId, name, email, role });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    res.status(500).json({ error: "Failed to create employee account" });
  }
});

module.exports = router;
