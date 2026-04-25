const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/customer/payees
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [rows] = await pool.execute(
      `SELECT p.Payee_id, p.Company_name
       FROM Pays py
       JOIN Payee p ON py.Payee_id = p.Payee_id
       WHERE py.UserID = ?
       ORDER BY p.Company_name ASC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payees" });
  }
});

// POST /api/customer/payees
router.post("/", requireAuth, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.userId;
    const { company_name } = req.body;
    if (!company_name || !company_name.trim()) {
      connection.release();
      return res.status(400).json({ error: "company_name required" });
    }

    await connection.beginTransaction();

    const [[{ nextId }]] = await connection.query(
      "SELECT COALESCE(MAX(Payee_id), 0) + 1 AS nextId FROM Payee FOR UPDATE"
    );
    await connection.execute(
      "INSERT INTO Payee (Payee_id, Company_name) VALUES (?, ?)",
      [nextId, company_name.trim()]
    );
    await connection.execute(
      "INSERT INTO Pays (UserID, Payee_id) VALUES (?, ?)",
      [userId, nextId]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({ message: "Payee added", payee: { Payee_id: nextId, Company_name: company_name.trim() } });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    res.status(500).json({ error: "Failed to add payee" });
  }
});

// DELETE /api/customer/payees/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const payeeId = Number(req.params.id);
    await pool.execute("DELETE FROM Pays WHERE UserID = ? AND Payee_id = ?", [userId, payeeId]);
    res.json({ message: "Payee removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove payee" });
  }
});

module.exports = router;
