try { require('process').loadEnvFile(); } catch {}

const express = require('express');
const pool = require('./db');

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '100kb' }));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: true, db: rows[0].ok === 1 });
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Auth
app.use('/api/auth', require('./routes/auth'));

// Customer routes
app.use('/api/customer/accounts', require('./routes/customer_account'));
app.use('/api/customer/loans',    require('./routes/customer_loans'));
app.use('/api/customer/deposit',  require('./routes/customer_deposit'));
app.use('/api/customer/transfer', require('./routes/customer_transfer'));
app.use('/api/customer/profile',  require('./routes/customer_profile'));
app.use('/api/customer/payees',   require('./routes/customer_payees'));

// Customer extra routes
app.use('/api/customer/transactions', require('./routes/customer_transactions'));
app.use('/api/customer/withdraw',     require('./routes/customer_withdraw'));

// Employee routes
app.use('/api/employee/transactions', require('./routes/employee_transactions'));
app.use('/api/employee/accounts',     require('./routes/employee_accounts'));
app.use('/api/employee/loans',        require('./routes/employee_loans'));
app.use('/api/employee/profile',      require('./routes/employee_profile'));
app.use('/api/employee/create-account', require('./routes/employee_create_account'));

// Manager routes
app.use('/api/manager', require('./routes/manager_assignment'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
