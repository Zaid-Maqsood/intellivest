const { query } = require('../config/db');

const getPortfolios = async (req, res, next) => {
  try {
    const { client_id } = req.query;
    let sql = `SELECT p.*, c.name as client_name FROM portfolios p LEFT JOIN clients c ON p.client_id = c.id`;
    const params = [];

    if (client_id) {
      sql += ' WHERE p.client_id = $1';
      params.push(client_id);
    }

    sql += ' ORDER BY p.total_value DESC';
    const result = await query(sql, params);
    res.json({ portfolios: result.rows });
  } catch (err) {
    next(err);
  }
};

const getPortfolio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const portfolio = await query(
      `SELECT p.*, c.name as client_name, c.risk_tolerance FROM portfolios p
       LEFT JOIN clients c ON p.client_id = c.id WHERE p.id = $1`,
      [id]
    );

    if (!portfolio.rows.length) return res.status(404).json({ error: 'Portfolio not found' });

    const transactions = await query(
      'SELECT * FROM transactions WHERE portfolio_id = $1 ORDER BY executed_at DESC LIMIT 50',
      [id]
    );

    res.json({ portfolio: portfolio.rows[0], transactions: transactions.rows });
  } catch (err) {
    next(err);
  }
};

const createPortfolio = async (req, res, next) => {
  try {
    const { client_id, name, type, total_value, cost_basis, allocation, benchmark } = req.body;

    if (!client_id || !name) {
      return res.status(400).json({ error: 'client_id and name are required' });
    }

    const performanceHistory = generatePerformanceHistory(total_value || 0);

    const result = await query(
      `INSERT INTO portfolios (client_id, name, type, total_value, cost_basis, unrealized_gain, allocation, performance_history, benchmark)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        client_id, name, type || 'investment',
        total_value || 0, cost_basis || 0,
        (total_value || 0) - (cost_basis || 0),
        JSON.stringify(allocation || { stocks: 60, bonds: 25, cash: 10, alternatives: 5 }),
        JSON.stringify(performanceHistory),
        benchmark || 'S&P 500',
      ]
    );

    res.status(201).json({ portfolio: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updatePortfolio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { total_value, allocation, ytd_return, risk_score } = req.body;

    const result = await query(
      `UPDATE portfolios SET
        total_value = COALESCE($1, total_value),
        allocation = COALESCE($2, allocation),
        ytd_return = COALESCE($3, ytd_return),
        risk_score = COALESCE($4, risk_score),
        updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [total_value, allocation ? JSON.stringify(allocation) : null, ytd_return, risk_score, id]
    );

    if (!result.rows.length) return res.status(404).json({ error: 'Portfolio not found' });
    res.json({ portfolio: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generatePerformanceHistory(currentValue) {
  const months = 24;
  const history = [];
  let value = currentValue * 0.78; // start 22% lower 2 years ago
  const now = new Date();

  for (let i = months; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthlyReturn = 0.006 + (Math.random() - 0.4) * 0.04;
    value = value * (1 + monthlyReturn);
    const benchmarkReturn = 0.0055 + (Math.random() - 0.4) * 0.035;
    history.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
      benchmark_value: Math.round(value * (0.92 + Math.random() * 0.1)),
    });
  }

  return history;
}

module.exports = { getPortfolios, getPortfolio, createPortfolio, updatePortfolio };
