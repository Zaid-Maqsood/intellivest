const { query } = require('../config/db');
const aiService = require('../services/aiService');

const getRecommendations = async (req, res, next) => {
  try {
    const { client_id } = req.params;

    const clientResult = await query('SELECT * FROM clients WHERE id = $1', [client_id]);
    if (!clientResult.rows.length) return res.status(404).json({ error: 'Client not found' });

    const portfolioResult = await query(
      'SELECT * FROM portfolios WHERE client_id = $1',
      [client_id]
    );

    const recommendations = await aiService.generateRecommendations(
      clientResult.rows[0],
      portfolioResult.rows[0] || {}
    );

    // Store AI-generated actions in DB
    for (const rec of recommendations.slice(0, 3)) {
      await query(
        `INSERT INTO advisory_actions (client_id, advisor_id, type, priority, title, description, ai_reasoning, estimated_impact, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
         ON CONFLICT DO NOTHING`,
        [
          client_id, req.user.id, rec.type, rec.priority,
          rec.title, rec.description, rec.ai_reasoning, rec.estimated_impact
        ]
      );
    }

    res.json({ recommendations });
  } catch (err) {
    next(err);
  }
};

const generatePlan = async (req, res, next) => {
  try {
    const { client_id, goals, retirement_age, retirement_income_goal } = req.body;

    if (!client_id) return res.status(400).json({ error: 'client_id is required' });

    const clientResult = await query('SELECT * FROM clients WHERE id = $1', [client_id]);
    if (!clientResult.rows.length) return res.status(404).json({ error: 'Client not found' });

    const portfolioResult = await query(
      'SELECT * FROM portfolios WHERE client_id = $1 ORDER BY total_value DESC LIMIT 1',
      [client_id]
    );

    const planData = await aiService.generateFinancialPlan(
      clientResult.rows[0],
      goals || [],
      portfolioResult.rows[0] || {}
    );

    // Save the plan
    const result = await query(
      `INSERT INTO financial_plans (
        client_id, created_by, title, status, plan_type,
        retirement_age, retirement_income_goal, goals, ai_suggestions, content
      ) VALUES ($1,$2,$3,'draft','comprehensive',$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        client_id, req.user.id,
        `Financial Plan — ${clientResult.rows[0].name} — ${new Date().getFullYear()}`,
        retirement_age || 65,
        retirement_income_goal || 150000,
        JSON.stringify(goals || []),
        JSON.stringify(planData.sections || []),
        planData.executive_summary || '',
      ]
    );

    res.json({ plan: result.rows[0], ai_content: planData });
  } catch (err) {
    next(err);
  }
};

const generateReport = async (req, res, next) => {
  try {
    const { client_id, period = 'Q4 2024' } = req.body;

    if (!client_id) return res.status(400).json({ error: 'client_id is required' });

    const clientResult = await query('SELECT * FROM clients WHERE id = $1', [client_id]);
    const portfolioResult = await query(
      'SELECT * FROM portfolios WHERE client_id = $1',
      [client_id]
    );

    const report = await aiService.generateClientReport(
      clientResult.rows[0],
      portfolioResult.rows[0] || {},
      period
    );

    // Log compliance event
    await query(
      `INSERT INTO compliance_logs (client_id, advisor_id, event_type, severity, title, description)
       VALUES ($1,$2,'report_generated','info','Client Report Generated','AI-generated ${period} report created')`,
      [client_id, req.user.id]
    );

    res.json({ report, period, client: clientResult.rows[0]?.name });
  } catch (err) {
    next(err);
  }
};

const queryDocument = async (req, res, next) => {
  try {
    const { document_id, question } = req.body;

    if (!document_id || !question) {
      return res.status(400).json({ error: 'document_id and question are required' });
    }

    const docResult = await query('SELECT * FROM documents WHERE id = $1', [document_id]);
    if (!docResult.rows.length) return res.status(404).json({ error: 'Document not found' });

    const doc = docResult.rows[0];
    const answer = await aiService.queryDocument(
      doc.extracted_text || doc.summary || doc.name,
      question
    );

    res.json({ answer, document: doc.name, question });
  } catch (err) {
    next(err);
  }
};

const runSimulation = async (req, res, next) => {
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

module.exports = { getRecommendations, generatePlan, generateReport, queryDocument, runSimulation };
