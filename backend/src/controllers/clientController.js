const { query } = require('../config/db');

const getClients = async (req, res, next) => {
  try {
    const { search, status, risk_tolerance, advisor_id, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT c.*, u.name as advisor_name, u.email as advisor_email,
        (SELECT COUNT(*) FROM portfolios p WHERE p.client_id = c.id) as portfolio_count,
        (SELECT COUNT(*) FROM documents d WHERE d.client_id = c.id) as document_count,
        (SELECT COUNT(*) FROM advisory_actions aa WHERE aa.client_id = c.id AND aa.status = 'pending') as pending_actions
      FROM clients c
      LEFT JOIN users u ON c.advisor_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (search) {
      sql += ` AND (c.name ILIKE $${paramIdx} OR c.email ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }
    if (status) {
      sql += ` AND c.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }
    if (risk_tolerance) {
      sql += ` AND c.risk_tolerance = $${paramIdx}`;
      params.push(risk_tolerance);
      paramIdx++;
    }
    if (advisor_id) {
      sql += ` AND c.advisor_id = $${paramIdx}`;
      params.push(advisor_id);
      paramIdx++;
    }

    // Advisors see only their clients
    if (req.user.role === 'advisor') {
      sql += ` AND c.advisor_id = $${paramIdx}`;
      params.push(req.user.id);
      paramIdx++;
    }

    sql += ` ORDER BY c.aum DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) FROM clients c WHERE 1=1`;
    const countParams = params.slice(0, -2);
    if (req.user.role === 'advisor') {
      // already filtered above
    }
    const countResult = await query(`SELECT COUNT(*) FROM clients c LEFT JOIN users u ON c.advisor_id = u.id WHERE 1=1${req.user.role === 'advisor' ? ` AND c.advisor_id = '${req.user.id}'` : ''}`, []);

    res.json({
      clients: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
};

const getClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT c.*, u.name as advisor_name, u.email as advisor_email
       FROM clients c
       LEFT JOIN users u ON c.advisor_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const client = result.rows[0];

    // Get portfolios
    const portfolios = await query(
      'SELECT * FROM portfolios WHERE client_id = $1 ORDER BY total_value DESC',
      [id]
    );

    // Get recent actions
    const actions = await query(
      `SELECT * FROM advisory_actions WHERE client_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [id]
    );

    // Get documents
    const documents = await query(
      'SELECT * FROM documents WHERE client_id = $1 ORDER BY created_at DESC LIMIT 10',
      [id]
    );

    // Get plans
    const plans = await query(
      `SELECT fp.*, u.name as created_by_name FROM financial_plans fp
       LEFT JOIN users u ON fp.created_by = u.id
       WHERE fp.client_id = $1 ORDER BY fp.created_at DESC`,
      [id]
    );

    res.json({
      client,
      portfolios: portfolios.rows,
      actions: actions.rows,
      documents: documents.rows,
      plans: plans.rows,
    });
  } catch (err) {
    next(err);
  }
};

const createClient = async (req, res, next) => {
  try {
    const {
      name, email, phone, date_of_birth, address, risk_tolerance,
      investment_goals, annual_income, net_worth, aum, status,
      tax_bracket, estate_size, notes, tags
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    const result = await query(
      `INSERT INTO clients (
        advisor_id, name, email, phone, date_of_birth, address, risk_tolerance,
        investment_goals, annual_income, net_worth, aum, status,
        tax_bracket, estate_size, notes, tags
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *`,
      [
        req.user.id, name, email, phone, date_of_birth, address,
        risk_tolerance || 'moderate', investment_goals, annual_income,
        net_worth, aum || 0, status || 'active', tax_bracket,
        estate_size, notes, tags || []
      ]
    );

    res.status(201).json({ client: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const allowed = [
      'name', 'email', 'phone', 'date_of_birth', 'address', 'risk_tolerance',
      'investment_goals', 'annual_income', 'net_worth', 'aum', 'status',
      'tax_bracket', 'estate_size', 'notes', 'tags', 'advisor_id'
    ];

    const updates = [];
    const values = [];
    let idx = 1;

    for (const [key, val] of Object.entries(fields)) {
      if (allowed.includes(key)) {
        updates.push(`${key} = $${idx}`);
        values.push(val);
        idx++;
      }
    }

    if (!updates.length) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE clients SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ client: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM clients WHERE id = $1 RETURNING id', [id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getClients, getClient, createClient, updateClient, deleteClient };
