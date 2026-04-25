const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/customer/accounts
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await pool.execute(
      `
      SELECT
        a.AccountID,
        a.Status,
        a.Balance,
        a.OpenDate,
        CASE
          WHEN c.AccountID IS NOT NULL THEN 'Chequing Account'
          WHEN s.AccountID IS NOT NULL THEN 'Savings Account'
          ELSE 'Unknown'
        END AS AccountType,
        c.Overdraft_limit,
        s.Interest_rate
      FROM Owns o
      JOIN Account a ON o.AccountID = a.AccountID
      LEFT JOIN Checking_acct c ON a.AccountID = c.AccountID
      LEFT JOIN Savings_acct s ON a.AccountID = s.AccountID
      WHERE o.UserID = ?
      ORDER BY a.AccountID ASC
      `,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Failed to fetch accounts:", error.message);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// GET /api/customer/accounts/:accountId
router.get("/:accountId", requireAuth, async (req, res) => {
  try {
    const accountId = Number(req.params.accountId);
    const userId = req.user.userId;

    if (!accountId) {
      return res.status(400).json({ error: "accountId is required" });
    }

    const [rows] = await pool.execute(
      `
      SELECT
        a.AccountID,
        a.Status,
        a.Balance,
        a.OpenDate,
        CASE
          WHEN c.AccountID IS NOT NULL THEN 'Chequing Account'
          WHEN s.AccountID IS NOT NULL THEN 'Savings Account'
          ELSE 'Unknown'
        END AS AccountType,
        c.Overdraft_limit,
        s.Interest_rate
      FROM Owns o
      JOIN Account a ON o.AccountID = a.AccountID
      LEFT JOIN Checking_acct c ON a.AccountID = c.AccountID
      LEFT JOIN Savings_acct s ON a.AccountID = s.AccountID
      WHERE o.UserID = ? AND a.AccountID = ?
      LIMIT 1
      `,
      [userId, accountId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Failed to fetch account:", error.message);
    res.status(500).json({ error: "Failed to fetch account" });
  }
});

// POST /api/customer/accounts
router.post("/", requireAuth, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.userId;
    const { accountType } = req.body;

    if (!accountType) {
      connection.release();
      return res.status(400).json({ error: "accountType is required" });
    }

    const validTypes = ["Chequing Account", "Savings Account"];
    if (!validTypes.includes(accountType)) {
      connection.release();
      return res.status(400).json({ error: "Invalid account type" });
    }

    // Verify the caller is actually a customer
    const [userRows] = await connection.execute(
      "SELECT UserID FROM Customer WHERE UserID = ? LIMIT 1",
      [userId]
    );
    if (userRows.length === 0) {
      connection.release();
      return res.status(403).json({ error: "Only customers can open accounts" });
    }

    await connection.beginTransaction();

    // Lock the table row to prevent race condition on ID generation
    const [nextIdRows] = await connection.query(
      "SELECT COALESCE(MAX(AccountID), 0) + 1 AS nextId FROM Account FOR UPDATE"
    );
    const nextAccountId = nextIdRows[0].nextId;

    await connection.execute(
      "INSERT INTO Account (AccountID, Status, Balance, OpenDate) VALUES (?, 'Active', 0.00, CURDATE())",
      [nextAccountId]
    );

    if (accountType === "Savings Account") {
      await connection.execute(
        "INSERT INTO Savings_acct (AccountID, Interest_rate) VALUES (?, ?)",
        [nextAccountId, 1.25]
      );
    } else {
      await connection.execute(
        "INSERT INTO Checking_acct (AccountID, Overdraft_limit) VALUES (?, ?)",
        [nextAccountId, 500.0]
      );
    }

    await connection.execute(
      "INSERT INTO Owns (UserID, AccountID) VALUES (?, ?)",
      [userId, nextAccountId]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: "Account created successfully",
      account: {
        accountId: nextAccountId,
        accountType,
        balance: 0,
        status: "Active",
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Failed to create account:", error.message);
    res.status(500).json({ error: "Failed to create account" });
  }
});

module.exports = router;
