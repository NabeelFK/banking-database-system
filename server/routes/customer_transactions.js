const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/customer/transactions — transaction history for the authenticated customer
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [rows] = await pool.execute(
      `SELECT
         t.TransactionID,
         t.\`Timestamp\`,
         t.Amount,
         CASE
           WHEN dep.TransactionID IS NOT NULL THEN 'Deposit'
           WHEN w.TransactionID   IS NOT NULL THEN 'Withdraw'
           WHEN tr.TransactionID  IS NOT NULL THEN 'Transfer'
           ELSE 'Unknown'
         END AS Type,
         a.AccountID
       FROM \`Transaction\` t
       LEFT JOIN Deposit  dep ON t.TransactionID = dep.TransactionID
       LEFT JOIN Withdraw w   ON t.TransactionID = w.TransactionID
       LEFT JOIN Transfer tr  ON t.TransactionID = tr.TransactionID
       LEFT JOIN Logs lg      ON t.TransactionID = lg.TransactionID
       LEFT JOIN Account a    ON lg.AccountID = a.AccountID
       WHERE t.UserID = ?
       GROUP BY t.TransactionID, t.\`Timestamp\`, t.Amount, dep.TransactionID, w.TransactionID, tr.TransactionID, a.AccountID
       ORDER BY t.\`Timestamp\` DESC
       LIMIT 100`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

module.exports = router;
