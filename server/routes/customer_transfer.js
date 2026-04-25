const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/customer/transfer
router.post("/", requireAuth, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.userId;
    const { fromAccountId, toAccountId, amount } = req.body;

    const parsedAmount = Number(amount);
    if (!fromAccountId || !toAccountId || !amount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      connection.release();
      return res.status(400).json({ error: "fromAccountId, toAccountId, and positive amount required" });
    }
    if (fromAccountId === toAccountId) {
      connection.release();
      return res.status(400).json({ error: "Source and destination accounts must differ" });
    }

    // Verify source account belongs to user and is active
    const [srcRows] = await connection.execute(
      `SELECT a.AccountID, a.Balance, a.Status FROM Owns o
       JOIN Account a ON o.AccountID = a.AccountID
       WHERE o.UserID = ? AND o.AccountID = ? LIMIT 1`,
      [userId, fromAccountId]
    );
    if (srcRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Source account not found" });
    }
    if (srcRows[0].Status !== "Active") {
      connection.release();
      return res.status(400).json({ error: "Source account is not active" });
    }
    if (Number(srcRows[0].Balance) < parsedAmount) {
      connection.release();
      return res.status(400).json({ error: "Insufficient funds" });
    }

    // Verify destination account exists and is active
    const [dstRows] = await connection.execute(
      `SELECT AccountID, Status FROM Account WHERE AccountID = ? LIMIT 1`,
      [toAccountId]
    );
    if (dstRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Destination account not found" });
    }
    if (dstRows[0].Status !== "Active") {
      connection.release();
      return res.status(400).json({ error: "Destination account is not active" });
    }

    await connection.beginTransaction();

    const [[{ nextId }]] = await connection.query(
      "SELECT COALESCE(MAX(TransactionID), 0) + 1 AS nextId FROM `Transaction` FOR UPDATE"
    );

    await connection.execute(
      "INSERT INTO `Transaction` (TransactionID, `Timestamp`, Amount, UserID) VALUES (?, NOW(), ?, ?)",
      [nextId, parsedAmount, userId]
    );
    await connection.execute("INSERT INTO Transfer (TransactionID, ToAccountID) VALUES (?, ?)", [nextId, toAccountId]);
    await connection.execute("INSERT INTO Logs (TransactionID, AccountID) VALUES (?, ?)", [nextId, fromAccountId]);
    await connection.execute("INSERT INTO Logs (TransactionID, AccountID) VALUES (?, ?)", [nextId, toAccountId]);

    await connection.execute(
      "UPDATE Account SET Balance = Balance - ? WHERE AccountID = ?",
      [parsedAmount, fromAccountId]
    );
    await connection.execute(
      "UPDATE Account SET Balance = Balance + ? WHERE AccountID = ?",
      [parsedAmount, toAccountId]
    );

    await connection.commit();
    connection.release();

    const [[src]] = await pool.execute("SELECT Balance FROM Account WHERE AccountID = ?", [fromAccountId]);
    res.json({
      message: "Transfer successful",
      transactionId: nextId,
      fromAccountId,
      toAccountId,
      amount,
      newSourceBalance: src.Balance,
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    res.status(500).json({ error: "Transfer failed" });
  }
});

module.exports = router;
