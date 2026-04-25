const express = require("express");
const pool = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/employee/transactions
router.get("/", requireAuth, requireRole("employee", "manager"), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
         t.TransactionID,
         t.\`Timestamp\`,
         t.Amount,
         u.Name AS CustomerName,
         CASE
           WHEN dep.TransactionID IS NOT NULL THEN 'Deposit'
           WHEN w.TransactionID   IS NOT NULL THEN 'Withdraw'
           WHEN tr.TransactionID  IS NOT NULL THEN 'Transfer'
           ELSE 'Unknown'
         END AS Type,
         a.AccountID
       FROM \`Transaction\` t
       LEFT JOIN \`User\` u ON t.UserID = u.UserID
       LEFT JOIN Deposit  dep ON t.TransactionID = dep.TransactionID
       LEFT JOIN Withdraw w   ON t.TransactionID = w.TransactionID
       LEFT JOIN Transfer tr  ON t.TransactionID = tr.TransactionID
       LEFT JOIN (SELECT TransactionID, MIN(AccountID) AS AccountID FROM Logs GROUP BY TransactionID) lg ON t.TransactionID = lg.TransactionID
       LEFT JOIN Account a    ON lg.AccountID = a.AccountID
       ORDER BY t.\`Timestamp\` DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

module.exports = router;
