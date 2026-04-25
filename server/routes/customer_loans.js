const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/customer/loans — loans for the authenticated customer
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [rows] = await pool.execute(
      `SELECT l.Loan_No, l.Amount, l.Status, b.Name AS BranchName
       FROM Loan l
       JOIN Obtains o ON l.Loan_No = o.Loan_No
       LEFT JOIN Branch b ON l.BranchID = b.BranchID
       WHERE o.Customer_UserID = ?
       ORDER BY l.Loan_No DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch loans" });
  }
});

// POST /api/customer/loans — request a new loan
router.post("/", requireAuth, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.userId;
    const { amount, branchId } = req.body;

    const parsedAmount = Number(amount);
    if (!amount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      connection.release();
      return res.status(400).json({ error: "Valid positive amount required" });
    }

    await connection.beginTransaction();

    const [[{ nextLoanNo }]] = await connection.query(
      "SELECT COALESCE(MAX(Loan_No), 0) + 1 AS nextLoanNo FROM Loan FOR UPDATE"
    );

    await connection.execute(
      "INSERT INTO Loan (Loan_No, Amount, BranchID, Status) VALUES (?, ?, ?, 'Pending')",
      [nextLoanNo, parsedAmount, branchId || 1]
    );
    await connection.execute(
      "INSERT INTO Obtains (Customer_UserID, Loan_No) VALUES (?, ?)",
      [userId, nextLoanNo]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({ message: "Loan requested", loanNo: nextLoanNo, amount: parsedAmount, status: "Pending" });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    res.status(500).json({ error: "Failed to request loan" });
  }
});

module.exports = router;
