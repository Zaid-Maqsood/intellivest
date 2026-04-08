require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { pool, query } = require('../src/config/db');

async function seed() {
  console.log('🌱 Seeding FinCopilot database (grayphite → fincopilot schema)...\n');

  try {
    // ─── Create Schema + Tables ───────────────────────────────────────────────
    // Ensure the fincopilot schema exists first
    await pool.query('CREATE SCHEMA IF NOT EXISTS fincopilot');
    await pool.query('SET search_path TO fincopilot, public');

    const schemaPath = require('path').join(__dirname, '..', 'src', 'models', 'schema.sql');
    const schemaSql = require('fs').readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✅ Schema "fincopilot" created / verified');

    // ─── Users (Advisors) ─────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash('password123', 12);

    const users = await query(`
      INSERT INTO users (email, password_hash, name, role, department, phone) VALUES
        ('advisor@fincopilot.com', $1, 'Sarah Mitchell', 'advisor', 'Wealth Management', '555-0101'),
        ('james.chen@fincopilot.com', $1, 'James Chen', 'advisor', 'Tax Planning', '555-0102'),
        ('emily.ross@fincopilot.com', $1, 'Emily Ross', 'advisor', 'Estate Planning', '555-0103'),
        ('marcus.patel@fincopilot.com', $1, 'Marcus Patel', 'advisor', 'Institutional', '555-0104'),
        ('admin@fincopilot.com', $1, 'Admin User', 'admin', 'Operations', '555-0100')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, email, name
    `, [passwordHash]);

    console.log(`✅ Created ${users.rows.length} users`);
    const [sarah, james, emily, marcus, admin] = users.rows;

    // ─── Clients ──────────────────────────────────────────────────────────────
    const clients = await query(`
      INSERT INTO clients (advisor_id, name, email, phone, date_of_birth, risk_tolerance, investment_goals, annual_income, net_worth, aum, status, tax_bracket, estate_size, notes, tags) VALUES
        ($1, 'Robert & Margaret Chen', 'robert.chen@email.com', '555-1001', '1958-04-15', 'moderate', 'Retirement income, estate transfer to 3 children, charitable giving', 420000, 8500000, 4200000, 'active', 37, 8500000, 'Long-term client, family office candidate', ARRAY['high-net-worth','estate-planning','retirement']),
        ($1, 'Alexandra Thornton', 'alex.thornton@email.com', '555-1002', '1975-08-22', 'aggressive', 'Grow tech portfolio, early retirement at 55, philanthropic legacy', 850000, 12000000, 6800000, 'active', 37, 12000000, 'Tech executive, heavy equity concentration in RSUs', ARRAY['ultra-high-net-worth','tech-equity','early-retirement']),
        ($2, 'David & Susan Kowalski', 'david.kowalski@email.com', '555-1003', '1962-11-30', 'conservative', 'Preserve capital, steady income, fund grandchildren education', 280000, 4200000, 2100000, 'active', 32, 4200000, 'Risk averse, prefers fixed income', ARRAY['conservative','education-planning','income']),
        ($2, 'Michael Torres', 'michael.torres@email.com', '555-1004', '1982-03-18', 'moderate', 'Diversified growth, home purchase in 5 years, business succession', 340000, 2800000, 1400000, 'active', 32, 2800000, 'Business owner, succession planning needed', ARRAY['business-owner','succession','growth']),
        ($3, 'Patricia Worthington', 'patricia.w@email.com', '555-1005', '1950-07-04', 'conservative', 'Capital preservation, estate planning, charitable remainder trust', 180000, 15000000, 7200000, 'active', 37, 15000000, 'Widow, complex estate with multiple trusts', ARRAY['ultra-high-net-worth','trusts','charitable','estate-planning']),
        ($3, 'The Hamilton Family Trust', 'hamilton.trust@email.com', '555-1006', '1945-01-01', 'moderate', 'Multi-generational wealth preservation, family governance', 520000, 28000000, 18000000, 'active', 37, 28000000, 'Multi-generation family with complex trust structure', ARRAY['family-office','trusts','multi-gen','governance']),
        ($4, 'Jennifer & Mark Davis', 'jennifer.davis@email.com', '555-1007', '1980-05-25', 'moderate', 'Balanced growth, college funding for 2 kids, vacation home', 290000, 3500000, 1750000, 'active', 24, 3500000, 'Dual income professional couple', ARRAY['education-planning','real-estate','growth']),
        ($4, 'Carlos Mendoza', 'carlos.mendoza@email.com', '555-1008', '1970-12-10', 'aggressive', 'Maximum growth, international diversification, PE access', 680000, 9500000, 5100000, 'active', 37, 9500000, 'Entrepreneur, comfortable with illiquidity', ARRAY['high-net-worth','alternatives','international']),
        ($1, 'William & Grace Zhang', 'william.zhang@email.com', '555-1009', '1955-09-14', 'moderate', 'Retirement in 5 years, long-term care planning, estate equalization', 380000, 6200000, 3100000, 'active', 35, 6200000, 'Pre-retirement planning phase', ARRAY['pre-retirement','long-term-care','estate']),
        ($2, 'Sophia Nakamura', 'sophia.nakamura@email.com', '555-1010', '1988-02-28', 'aggressive', 'Wealth accumulation, startup equity management, impact investing', 520000, 1800000, 900000, 'active', 32, 1800000, 'Rising professional, heavy RSU & options exposure', ARRAY['accumulation','equity-compensation','esg'])
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, aum
    `, [sarah.id, james.id, emily.id, marcus.id]);

    console.log(`✅ Created ${clients.rows.length} clients`);

    // ─── Portfolios ───────────────────────────────────────────────────────────
    const makeHistory = (baseValue, months = 24) => {
      const history = [];
      let val = baseValue * 0.78;
      const now = new Date();
      for (let i = months; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        val = val * (1 + 0.006 + (Math.random() - 0.4) * 0.04);
        history.push({ date: date.toISOString().split('T')[0], value: Math.round(val), benchmark_value: Math.round(val * (0.91 + Math.random() * 0.1)) });
      }
      return history;
    };

    for (const client of clients.rows) {
      const base = parseFloat(client.aum) * 0.95;
      await query(`
        INSERT INTO portfolios (client_id, name, type, total_value, cost_basis, unrealized_gain, ytd_return, risk_score, allocation, performance_history, benchmark)
        VALUES ($1, $2, 'investment', $3, $4, $5, $6, $7, $8, $9, 'S&P 500')
      `, [
        client.id,
        `${client.name} — Core Portfolio`,
        Math.round(base),
        Math.round(base * 0.72),
        Math.round(base * 0.28),
        (6 + Math.random() * 12).toFixed(2),
        (4 + Math.random() * 5).toFixed(1),
        JSON.stringify({ stocks: 55 + Math.round(Math.random() * 20), bonds: 20 + Math.round(Math.random() * 15), alternatives: 5 + Math.round(Math.random() * 8), cash: 3 + Math.round(Math.random() * 5) }),
        JSON.stringify(makeHistory(base)),
      ]);
    }
    console.log(`✅ Created portfolios for all clients`);

    // ─── Transactions ─────────────────────────────────────────────────────────
    const txTypes = ['buy', 'sell', 'dividend', 'deposit'];
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'BRK.B', 'JPM', 'JNJ', 'TSLA', 'VTI', 'BND', 'AGG', 'QQQ'];
    const portfolioResult = await query('SELECT id, client_id FROM portfolios LIMIT 5');

    for (const portfolio of portfolioResult.rows) {
      for (let i = 0; i < 8; i++) {
        const type = txTypes[Math.floor(Math.random() * txTypes.length)];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const amount = Math.round(5000 + Math.random() * 95000);
        const gainLoss = type === 'sell' ? Math.round((Math.random() - 0.3) * amount * 0.3) : null;
        await query(
          `INSERT INTO transactions (portfolio_id, client_id, type, symbol, description, quantity, price, amount, gain_loss)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [portfolio.id, portfolio.client_id, type, symbol, `${type.charAt(0).toUpperCase() + type.slice(1)} ${symbol}`,
           (Math.random() * 200).toFixed(2), (amount / 100).toFixed(2), amount, gainLoss]
        );
      }
    }
    console.log(`✅ Created transactions`);

    // ─── Advisory Actions ─────────────────────────────────────────────────────
    const actions = [
      { type: 'tax', priority: 'high', title: 'Q4 Tax-Loss Harvesting', description: 'Identify unrealized losses to harvest before year-end', estimated_impact: '$12,400 tax savings' },
      { type: 'portfolio', priority: 'high', title: 'Rebalance to Target Allocation', description: 'Equity drift exceeds 8% threshold — rebalance required', estimated_impact: '0.4% risk-adjusted improvement' },
      { type: 'planning', priority: 'medium', title: 'Update Financial Plan — Life Event', description: 'Client reported marriage — update beneficiaries and insurance needs', estimated_impact: 'Risk mitigation' },
      { type: 'compliance', priority: 'critical', title: 'Annual Suitability Review Overdue', description: 'Suitability assessment has not been updated in 14 months', estimated_impact: 'Regulatory compliance' },
      { type: 'communication', priority: 'low', title: 'Send Q4 Performance Summary', description: 'Generate and send personalized year-end report', estimated_impact: 'Client engagement' },
    ];

    for (const client of clients.rows.slice(0, 5)) {
      for (const action of actions.slice(0, 3)) {
        await query(
          `INSERT INTO advisory_actions (client_id, advisor_id, type, priority, title, description, estimated_impact, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')`,
          [client.id, sarah.id, action.type, action.priority, action.title, action.description, action.estimated_impact]
        );
      }
    }
    console.log(`✅ Created advisory actions`);

    // ─── Documents ────────────────────────────────────────────────────────────
    const docTypes = [
      { name: 'Revocable Living Trust Agreement.pdf', category: 'trust' },
      { name: 'Last Will and Testament.pdf', category: 'estate' },
      { name: '2023 Federal Tax Return.pdf', category: 'tax' },
      { name: 'Investment Policy Statement.pdf', category: 'investment' },
      { name: 'Beneficiary Designation Form.pdf', category: 'estate' },
      { name: 'Q3 2024 Account Statement.pdf', category: 'report' },
    ];

    for (const client of clients.rows.slice(0, 4)) {
      for (const doc of docTypes.slice(0, 3)) {
        await query(
          `INSERT INTO documents (client_id, uploaded_by, name, file_path, file_type, file_size, category, summary, is_processed)
           VALUES ($1,$2,$3,$4,'application/pdf',$5,$6,$7,true)`,
          [client.id, sarah.id, doc.name, `/uploads/mock-${doc.name.replace(/\s/g, '-')}`,
           Math.round(100000 + Math.random() * 500000), doc.category,
           `AI summary: This ${doc.category} document for ${client.name} contains important financial information reviewed and processed on ${new Date().toLocaleDateString()}.`]
        );
      }
    }
    console.log(`✅ Created documents`);

    // ─── Financial Plans ──────────────────────────────────────────────────────
    for (const client of clients.rows.slice(0, 3)) {
      await query(
        `INSERT INTO financial_plans (client_id, created_by, title, status, retirement_age, retirement_income_goal, current_savings_rate, projected_retirement_value, content, next_review_date)
         VALUES ($1,$2,$3,'active',$4,$5,$6,$7,$8,$9)`,
        [
          client.id, sarah.id,
          `Comprehensive Financial Plan — ${new Date().getFullYear()}`,
          65, 180000, 18.5,
          parseFloat(client.aum) * 2.1,
          `This comprehensive financial plan outlines the wealth management strategy for ${client.name}. The plan encompasses retirement planning, tax optimization, estate planning, and investment management across all accounts.`,
          new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        ]
      );
    }
    console.log(`✅ Created financial plans`);

    // ─── Compliance Logs ─────────────────────────────────────────────────────
    const complianceLogs = [
      { event_type: 'suitability_review', severity: 'warning', title: 'Annual Suitability Review Due', description: 'Client annual review overdue by 2 months' },
      { event_type: 'large_transaction', severity: 'info', title: 'Large Transaction Flagged', description: 'Transaction > $500K requires additional documentation' },
      { event_type: 'concentration_risk', severity: 'warning', title: 'Portfolio Concentration Risk', description: 'Single position exceeds 25% of total portfolio value' },
      { event_type: 'document_expiry', severity: 'warning', title: 'Investment Policy Statement Expired', description: 'IPS has not been reviewed in 24 months' },
      { event_type: 'beneficiary_update', severity: 'info', title: 'Beneficiary Update Required', description: 'Client life event requires beneficiary review' },
      { event_type: 'compliance_breach', severity: 'critical', title: 'Fee Disclosure Not Sent', description: 'Annual fee disclosure not provided to client within required timeframe' },
    ];

    for (const log of complianceLogs) {
      const client = clients.rows[Math.floor(Math.random() * clients.rows.length)];
      await query(
        `INSERT INTO compliance_logs (client_id, advisor_id, event_type, severity, title, description, resolved)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [client.id, sarah.id, log.event_type, log.severity, log.title, log.description, Math.random() > 0.6]
      );
    }
    console.log(`✅ Created compliance logs`);

    console.log('\n✨ Seeding complete!\n');
    console.log('─────────────────────────────────────────');
    console.log('Login credentials:');
    console.log('  Email:    advisor@fincopilot.com');
    console.log('  Password: password123');
    console.log('─────────────────────────────────────────\n');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
