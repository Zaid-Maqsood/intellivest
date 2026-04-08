const { query } = require('../config/db');
const aiService = require('../services/aiService');

const getTaxOpportunities = async (req, res, next) => {
  try {
    const { client_id } = req.params;

    const clientResult = await query('SELECT * FROM clients WHERE id = $1', [client_id]);
    if (!clientResult.rows.length) return res.status(404).json({ error: 'Client not found' });

    const portfolioResult = await query(
      'SELECT * FROM portfolios WHERE client_id = $1',
      [client_id]
    );

    const transactionResult = await query(
      'SELECT * FROM transactions WHERE client_id = $1 ORDER BY executed_at DESC LIMIT 20',
      [client_id]
    );

    const opportunities = await aiService.generateTaxOpportunities(
      clientResult.rows[0],
      portfolioResult.rows[0] || {},
      transactionResult.rows
    );

    const safeOpportunities = Array.isArray(opportunities) ? opportunities : [];
    const totalSavings = safeOpportunities.reduce(
      (sum, o) => sum + (parseFloat(o.estimated_tax_savings) || parseFloat(o.annual_tax_drag) || 0), 0
    );

    res.json({
      opportunities: safeOpportunities,
      total_estimated_savings: totalSavings,
      client: clientResult.rows[0].name,
    });
  } catch (err) {
    next(err);
  }
};

const getTaxSummary = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    // Aggregate tax data across all clients
    const result = await query(
      `SELECT
        COUNT(DISTINCT client_id) as clients_analyzed,
        SUM(CASE WHEN type = 'sell' AND gain_loss < 0 THEN ABS(gain_loss) ELSE 0 END) as total_losses_harvested,
        SUM(CASE WHEN type = 'sell' AND gain_loss > 0 THEN gain_loss ELSE 0 END) as total_gains_realized
       FROM transactions
       WHERE EXTRACT(YEAR FROM executed_at) = $1`,
      [year]
    );

    res.json({
      year,
      summary: result.rows[0],
      tax_alpha_generated: Math.round(parseFloat(result.rows[0]?.total_losses_harvested || 0) * 0.25),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTaxOpportunities, getTaxSummary };
