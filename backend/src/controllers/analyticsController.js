const { query } = require('../config/db');
const aiService = require('../services/aiService');

const getInstitutionalSummary = async (req, res, next) => {
  try {
    const summary = await query(`
      SELECT
        COUNT(DISTINCT c.id) as total_clients,
        COUNT(DISTINCT p.id) as total_portfolios,
        COALESCE(SUM(c.aum), 0) as total_aum,
        COALESCE(AVG(p.ytd_return), 0) as avg_ytd_return,
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active') as active_clients,
        COUNT(DISTINCT aa.id) FILTER (WHERE aa.status = 'pending') as pending_actions
      FROM clients c
      LEFT JOIN portfolios p ON p.client_id = c.id
      LEFT JOIN advisory_actions aa ON aa.client_id = c.id
    `);

    const byRisk = await query(`
      SELECT risk_tolerance, COUNT(*) as count, SUM(aum) as total_aum
      FROM clients GROUP BY risk_tolerance ORDER BY total_aum DESC
    `);

    const byAdvisor = await query(`
      SELECT u.name, u.id, COUNT(c.id) as client_count, SUM(c.aum) as total_aum
      FROM users u LEFT JOIN clients c ON c.advisor_id = u.id
      WHERE u.role = 'advisor'
      GROUP BY u.id, u.name ORDER BY total_aum DESC
    `);

    const monthlyAum = await query(`
      SELECT DATE_TRUNC('month', created_at) as month, SUM(aum) as aum
      FROM clients WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month ORDER BY month
    `);

    res.json({
      summary: summary.rows[0],
      by_risk: byRisk.rows,
      by_advisor: byAdvisor.rows,
      monthly_aum: monthlyAum.rows,
    });
  } catch (err) {
    next(err);
  }
};

const getRiskModel = async (req, res, next) => {
  try {
    // Risk distribution across portfolios
    const riskDist = await query(`
      SELECT
        CASE
          WHEN risk_score < 3 THEN 'Conservative'
          WHEN risk_score < 6 THEN 'Moderate'
          WHEN risk_score < 8 THEN 'Aggressive'
          ELSE 'Very Aggressive'
        END as risk_category,
        COUNT(*) as count,
        AVG(ytd_return) as avg_return,
        SUM(total_value) as total_value
      FROM portfolios WHERE risk_score IS NOT NULL
      GROUP BY risk_category
    `);

    // Aggregate allocation
    const allocationData = [
      { name: 'US Equities', value: 42 },
      { name: 'International', value: 18 },
      { name: 'Fixed Income', value: 25 },
      { name: 'Alternatives', value: 8 },
      { name: 'Cash', value: 7 },
    ];

    res.json({
      risk_distribution: riskDist.rows,
      aggregate_allocation: allocationData,
      var_95: -0.0842, // 95% VaR
      sharpe_ratio: 1.24,
      beta: 0.87,
      alpha: 0.034,
    });
  } catch (err) {
    next(err);
  }
};

const getPortfolioSimulation = async (req, res, next) => {
  try {
    const { client_id } = req.params;

    const portfolioResult = await query(
      'SELECT * FROM portfolios WHERE client_id = $1 ORDER BY total_value DESC LIMIT 1',
      [client_id]
    );

    const planResult = await query(
      'SELECT * FROM financial_plans WHERE client_id = $1 ORDER BY created_at DESC LIMIT 1',
      [client_id]
    );

    const simulation = await aiService.runMonteCarloSimulation(
      portfolioResult.rows[0] || { total_value: 2000000 },
      planResult.rows[0] || { retirement_income_goal: 150000 }
    );

    res.json({ simulation });
  } catch (err) {
    next(err);
  }
};

module.exports = { getInstitutionalSummary, getRiskModel, getPortfolioSimulation };
