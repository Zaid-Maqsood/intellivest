const { query } = require('../config/db');

const getLogs = async (req, res, next) => {
  try {
    const { client_id, severity, resolved, limit = 50 } = req.query;

    let sql = `SELECT cl.*, c.name as client_name, u.name as advisor_name
               FROM compliance_logs cl
               LEFT JOIN clients c ON cl.client_id = c.id
               LEFT JOIN users u ON cl.advisor_id = u.id
               WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (client_id) { sql += ` AND cl.client_id = $${idx}`; params.push(client_id); idx++; }
    if (severity) { sql += ` AND cl.severity = $${idx}`; params.push(severity); idx++; }
    if (resolved !== undefined) { sql += ` AND cl.resolved = $${idx}`; params.push(resolved === 'true'); idx++; }

    sql += ` ORDER BY cl.created_at DESC LIMIT $${idx}`;
    params.push(parseInt(limit));

    const result = await query(sql, params);

    const stats = await query(
      `SELECT
        COUNT(*) FILTER (WHERE resolved = false) as open_count,
        COUNT(*) FILTER (WHERE severity = 'critical' AND resolved = false) as critical_count,
        COUNT(*) FILTER (WHERE severity = 'warning' AND resolved = false) as warning_count
       FROM compliance_logs`
    );

    res.json({ logs: result.rows, stats: stats.rows[0] });
  } catch (err) {
    next(err);
  }
};

const resolveLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE compliance_logs SET resolved = true, resolved_at = NOW(), resolved_by = $1
       WHERE id = $2 RETURNING *`,
      [req.user.id, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Log not found' });
    res.json({ log: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const createLog = async (req, res, next) => {
  try {
    const { client_id, event_type, severity, title, description, entity_type, entity_id } = req.body;

    const result = await query(
      `INSERT INTO compliance_logs (client_id, advisor_id, event_type, severity, title, description, entity_type, entity_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [client_id, req.user.id, event_type, severity || 'info', title, description, entity_type, entity_id]
    );

    res.status(201).json({ log: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLogs, resolveLog, createLog };
