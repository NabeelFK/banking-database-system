const express = require("express");
const pool = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/employee/accounts — all customer accounts with owner name
router.get("/", requireAuth, requireRole("employee", "manager"), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
         a.AccountID,
         a.Status,
         a.Balance,
         a.OpenDate,
         u.Name AS OwnerName,
         u.UserID AS OwnerID,
         CASE
           WHEN c.AccountID IS NOT NULL THEN 'Chequing Account'
           WHEN s.AccountID IS NOT NULL THEN 'Savings Account'
           ELSE 'Unknown'
         END AS AccountType,
         c.Overdraft_limit,
         s.Interest_rate
       FROM Account a
       JOIN Owns o       ON a.AccountID = o.AccountID
       JOIN Customer cu  ON o.UserID = cu.UserID
       JOIN \`User\` u   ON cu.UserID = u.UserID
       LEFT JOIN Checking_acct c ON a.AccountID = c.AccountID
       LEFT JOIN Savings_acct  s ON a.AccountID = s.AccountID
       ORDER BY a.AccountID ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// PATCH /api/employee/accounts/:id — update account status (freeze/unfreeze)
router.patch("/:id", requireAuth, requireRole("employee", "manager"), async (req, res) => {
  try {
    const accountId = Number(req.params.id);
    const { status } = req.body;
    const allowed = ["Active", "Frozen", "Closed"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(", ")}` });
    }
    const [result] = await pool.execute(
      "UPDATE Account SET Status = ? WHERE AccountID = ?",
      [status, accountId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.json({ message: "Account updated", accountId, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update account" });
  }
});

module.exports = router;
