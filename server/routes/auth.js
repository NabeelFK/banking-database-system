const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// Simple in-memory rate limiter: max 10 attempts per IP per 15 minutes
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX = 10;

function loginRateLimiter(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (record && now < record.resetAt) {
    if (record.count >= LOGIN_MAX) {
      return res.status(429).json({ error: "Too many login attempts. Please try again later." });
    }
    record.count++;
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  }
  next();
}

// POST /api/auth/login
router.post("/login", loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const [rows] = await pool.execute(
      "SELECT UserID, Name, Email, Password_hash FROM `User` WHERE Email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.Password_hash);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Determine role
    const [customerCheck] = await pool.execute(
      "SELECT UserID FROM Customer WHERE UserID = ?",
      [user.UserID]
    );
    const [employeeCheck] = await pool.execute(
      "SELECT UserID, Role FROM Employee WHERE UserID = ?",
      [user.UserID]
    );

    let role = "customer";
    if (customerCheck.length === 0 && employeeCheck.length > 0) {
      const employeeRole = String(employeeCheck[0].Role ?? "").trim().toLowerCase();
      role = employeeRole === "manager" ? "manager" : "employee";
    } else if (customerCheck.length === 0) {
      return res.status(403).json({ error: "Not a recognized account" });
    }

    const token = jwt.sign({ userId: user.UserID, role }, JWT_SECRET, { expiresIn: "8h" });

    res.json({
      message: "Login successful",
      token,
      user: { userId: user.UserID, name: user.Name, email: user.Email, role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { name, phone, email, password, ssn, account_type } = req.body;

    if (!name || !email || !password || !ssn || !account_type) {
      connection.release();
      return res.status(400).json({ error: "Missing required fields" });
    }

    const validTypes = ["Chequing Account", "Savings Account"];
    if (!validTypes.includes(account_type)) {
      connection.release();
      return res.status(400).json({ error: "Invalid account type" });
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

    const [UserResult] = await connection.execute(
      "INSERT INTO `User` (Name, Phone, Email, Password_hash) VALUES (?, ?, ?, ?)",
      [name, phone ?? null, email, passwordHash]
    );
    const userId = UserResult.insertId;

    await connection.execute(
      "INSERT INTO Customer (UserID, SSN) VALUES (?, ?)",
      [userId, ssn]
    );

    const [AccountResult] = await connection.execute(
      "INSERT INTO Account (Status, Balance, OpenDate) VALUES ('Active', 0.00, CURDATE())"
    );
    const accountId = AccountResult.insertId;

    if (account_type === "Savings Account") {
      await connection.execute(
        "INSERT INTO Savings_acct (AccountID, Interest_rate) VALUES (?, ?)",
        [accountId, 1.25]
      );
    } else {
      await connection.execute(
        "INSERT INTO Checking_acct (AccountID, Overdraft_limit) VALUES (?, ?)",
        [accountId, 500.0]
      );
    }

    await connection.execute(
      "INSERT INTO Owns (UserID, AccountID) VALUES (?, ?)",
      [userId, accountId]
    );

    await connection.commit();
    connection.release();

    const token = jwt.sign({ userId, role: "customer" }, JWT_SECRET, { expiresIn: "8h" });

    res.status(201).json({
      message: "Signup successful",
      token,
      user: { userId, name, email, role: "customer" },
      account: { accountID: accountId, account_type, balance: 0.0 },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Signup failed:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/change-password
router.post("/change-password", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  let userId;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
    userId = payload.userId;
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword and newPassword required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    const [rows] = await pool.execute(
      "SELECT Password_hash FROM `User` WHERE UserID = ?",
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(currentPassword, rows[0].Password_hash);
    if (!match) return res.status(401).json({ error: "Current password is incorrect" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.execute("UPDATE `User` SET Password_hash = ? WHERE UserID = ?", [newHash, userId]);

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

module.exports = router;
