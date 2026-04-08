const { query } = require('../config/db');

const getPlans = async (req, res, next) => {
  try {
    const { client_id, status } = req.query;
    let sql = `SELECT fp.*, u.name as created_by_name, c.name as client_name
               FROM financial_plans fp
               LEFT JOIN users u ON fp.created_by = u.id
               LEFT JOIN clients c ON fp.client_id = c.id
               WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (client_id) { sql += ` AND fp.client_id = $${idx}`; params.push(client_id); idx++; }
    if (status) { sql += ` AND fp.status = $${idx}`; params.push(status); idx++; }

    sql += ' ORDER BY fp.created_at DESC';
    const result = await query(sql, params);
    res.json({ plans: result.rows });
  } catch (err) {
    next(err);
  }
};

const getPlan = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT fp.*, u.name as created_by_name, c.name as client_name
       FROM financial_plans fp
       LEFT JOIN users u ON fp.created_by = u.id
       LEFT JOIN clients c ON fp.client_id = c.id
       WHERE fp.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Plan not found' });
    res.json({ plan: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const { status, next_review_date, goals, content } = req.body;
    const result = await query(
      `UPDATE financial_plans SET
        status = COALESCE($1, status),
        next_review_date = COALESCE($2, next_review_date),
        goals = COALESCE($3, goals),
        content = COALESCE($4, content),
        updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [status, next_review_date, goals ? JSON.stringify(goals) : null, content, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Plan not found' });
    res.json({ plan: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPlans, getPlan, updatePlan };
