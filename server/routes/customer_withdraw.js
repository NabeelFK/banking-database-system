const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/customer/withdraw
router.post("/", requireAuth, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.userId;
    const { accountId, amount } = req.body;

    const parsedAmount = Number(amount);
    if (!accountId || !amount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      connection.release();
      return res.status(400).json({ error: "accountId and positive amount required" });
    }

    // Verify account belongs to user and is active
    const [owns] = await connection.execute(
      `SELECT a.AccountID, a.Balance, a.Status, c.Overdraft_limit
       FROM Owns o
       JOIN Account a ON o.AccountID = a.AccountID
       LEFT JOIN Checking_acct c ON a.AccountID = c.AccountID
       WHERE o.UserID = ? AND o.AccountID = ? LIMIT 1`,
      [userId, accountId]
    );
    if (owns.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Account not found" });
    }
    if (owns[0].Status !== "Active") {
      connection.release();
      return res.status(400).json({ error: "Account is not active" });
    }

    const balance = Number(owns[0].Balance);
    const overdraft = Number(owns[0].Overdraft_limit ?? 0);
    const withdrawAmt = parsedAmount;

    if (balance + overdraft < withdrawAmt) {
      connection.release();
      return res.status(400).json({ error: "Insufficient funds" });
    }

    await connection.beginTransaction();

    const [[{ nextId }]] = await connection.query(
      "SELECT COALESCE(MAX(TransactionID), 0) + 1 AS nextId FROM `Transaction` FOR UPDATE"
    );

    await connection.execute(
      "INSERT INTO `Transaction` (TransactionID, `Timestamp`, Amount, UserID) VALUES (?, NOW(), ?, ?)",
      [nextId, withdrawAmt, userId]
    );
    await connection.execute("INSERT INTO Withdraw (TransactionID) VALUES (?)", [nextId]);
    await connection.execute(
      "INSERT INTO Logs (TransactionID, AccountID) VALUES (?, ?)",
      [nextId, accountId]
    );
    await connection.execute(
      "UPDATE Account SET Balance = Balance - ? WHERE AccountID = ?",
      [withdrawAmt, accountId]
    );

    await connection.commit();
    connection.release();

    const [[account]] = await pool.execute(
      "SELECT Balance FROM Account WHERE AccountID = ?",
      [accountId]
    );

    res.json({ message: "Withdrawal successful", transactionId: nextId, newBalance: account.Balance });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    res.status(500).json({ error: "Withdrawal failed" });
  }
});

module.exports = router;
