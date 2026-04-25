const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

async function requireManager(req, res, next) {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userId = req.user.userId;
        const [rows] = await pool.execute(
            'SELECT Role FROM Employee WHERE UserID = ?',
            [userId]
        );
        const role = rows[0]?.Role;

        if (!rows || rows.length === 0){
            return res.status(403).json({ error: 'Employee access required' });
        }
        
        if (String(role).toLowerCase() !== 'manager') {
            return res.status(403).json({ error: 'Manager access required' });
        }

        next();
    } catch (err) {
        console.error('Manager Auth Failed:', err);
        return res.status(500).json({ error: 'Failed to verify authentication' });
    }
}

// GET /api/manager/assignments — all employee assignments with details
router.get('/assignments', requireAuth, requireManager, async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [assignmentTable] = await connection.execute("SHOW TABLES LIKE 'Assignment'");
        const hasAssignments = assignmentTable.length > 0;
        let employees;
        let unassignedAssignments;

        if (hasAssignments) {
            [employees] = await connection.execute(
                `
                SELECT
                    e.UserID As EmployeeID,
                    u.Name AS EmployeeName,
                    e.Role,
                    d.DepartmentID,
                    d.Name AS DepartmentName,
                    a.AssignmentID,
                    a.Name AS AssignmentTitle,
                    a.Description AS AssignmentDescription,
                    a.Status AS AssignmentStatus,
                    a.Start_Date AS StartDate
                FROM Employee e
                LEFT JOIN \`User\` u ON e.UserID = u.UserID
                LEFT JOIN Assignment a ON e.UserID = a.Employee_UserID
                LEFT JOIN Department d ON a.DepartmentID = d.DepartmentID
                ORDER BY a.Start_Date DESC, e.UserID ASC
                `
            );

            [unassignedAssignments] = await connection.execute(
                `
                SELECT
                    a.AssignmentID,
                    a.Name AS AssignmentTitle,
                    a.Description AS AssignmentDescription,
                    a.Status AS AssignmentStatus,
                    a.Start_Date AS StartDate,
                    d.DepartmentID,
                    d.Name AS DepartmentName
                FROM Assignment a
                LEFT JOIN Department d ON a.DepartmentID = d.DepartmentID
                WHERE a.Employee_UserID IS NULL
                ORDER BY a.Start_Date DESC
                `
            );
        } else {
            [employees] = await connection.execute(
                `
                SELECT
                    e.UserID AS EmployeeID,
                    u.Name AS EmployeeName,
                    e.Role,
                    NULL AS AssignmentID,
                    NULL AS AssignmentTitle,
                    NULL AS AssignmentDescription,
                    NULL AS AssignmentStatus,
                    NULL AS StartDate
                FROM Employee e
                LEFT JOIN \`User\` u ON e.UserID = u.UserID
                ORDER BY e.UserID ASC
                `
            );
            unassignedAssignments = [];
        }

        res.json({ employees, unassignedAssignments });
    } catch (err) {
        console.error("Failed to load manager assignments data:", err);
        res.status(500).json({ error: 'Failed to load manager assignments data' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// PATCH /api/manager/assignments/:assignmentId — update assignment details and reassign employee
router.patch("/assignments/:assignmentId", requireAuth, requireManager, async (req, res) => {
  let connection;

  try {
    const assignmentId = Number(req.params.assignmentId);

    if (!assignmentId) {
      return res.status(400).json({ error: "Invalid assignmentId" });
    }

    const {
      name,
      description,
      status,
      employeeUserId,
      departmentId,
      startDate
    } = req.body;

    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push("Name = ?");
      values.push(name);
    }

    if (description !== undefined) {
      fields.push("Description = ?");
      values.push(description);
    }

    if (status !== undefined) {
      fields.push("Status = ?");
      values.push(status);
    }

    if (employeeUserId !== undefined) {
      fields.push("Employee_UserID = ?");
      values.push(employeeUserId);
    }

    if (departmentId !== undefined) {
      fields.push("DepartmentID = ?");
      values.push(departmentId);
    }

    if (startDate !== undefined) {
      fields.push("Start_Date = ?");
      values.push(startDate);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    connection = await pool.getConnection();

    const [existing] = await connection.execute(
      `
      SELECT AssignmentID
      FROM Assignment
      WHERE AssignmentID = ?
      LIMIT 1
      `,
      [assignmentId]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    values.push(assignmentId);

    await connection.execute(
      `
      UPDATE Assignment
      SET ${fields.join(", ")}
      WHERE AssignmentID = ?
      `,
      values
    );

    res.json({
      message: "Assignment updated successfully",
      assignmentId
    });
  } catch (err) {
    console.error("Failed to update assignment:", err);
    res.status(500).json({ error: "Failed to update assignment" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

//GET /api/manager/employees — all employees with their current assignment (if any)
router.get("/employees", requireAuth, requireManager, async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const [rows] = await connection.execute(`
      SELECT
        e.UserID,
        u.Name,
        u.Phone,
        u.Email,
        e.Role,
        e.EmergencyNo,
        e.BranchID,
        e.SupervisorID,
        a.AssignmentID,
        a.Name AS AssignmentName,
        a.Status AS AssignmentStatus
      FROM Employee e
      JOIN \`User\` u ON e.UserID = u.UserID
      LEFT JOIN Assignment a ON e.UserID = a.Employee_UserID
      ORDER BY e.UserID
    `);

    res.json(rows);
  } catch (err) {
    console.error("Failed to load employees:", err);
    res.status(500).json({ error: "Failed to load employees" });
  } finally {
    if (connection) connection.release();
  }
});

// PATCH /api/manager/employees/:userId — update employee details and assignment
router.patch("/employees/:userId", requireAuth, requireManager, async (req, res) => {
  let connection;

  try {
    const userId = Number(req.params.userId);

    const {
      name,
      phone,
      email,
      role,
      emergencyNo,
      branchId,
      supervisorId
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // update User table
    await connection.execute(
      `
      UPDATE \`User\`
      SET Name = ?, Phone = ?, Email = ?
      WHERE UserID = ?
      `,
      [name, phone, email, userId]
    );

    // update Employee table
    await connection.execute(
      `
      UPDATE Employee
      SET
        Role = ?,
        EmergencyNo = ?,
        BranchID = ?,
        SupervisorID = ?
      WHERE UserID = ?
      `,
      [role, emergencyNo, branchId, supervisorId, userId]
    );

    await connection.commit();

    res.json({ message: "Employee updated successfully" });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Failed to update employee:", err);
    res.status(500).json({ error: "Failed to update employee" });
  } finally {
    if (connection) connection.release();
  }
});
