const OpenAI = require('openai');

// Initialize OpenAI client (or use mock if no key provided)
let openaiClient = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-key-here') {
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── Mock responses for development ──────────────────────────────────────────

const MOCK_RECOMMENDATIONS = [
  {
    type: 'tax',
    priority: 'high',
    title: 'Tax-Loss Harvesting Opportunity',
    description: 'TSLA position shows $18,400 unrealized loss. Harvesting now could offset capital gains and save approximately $4,600 in taxes.',
    estimated_impact: '$4,600 tax savings',
    ai_reasoning: 'Based on current portfolio analysis, this position has depreciated significantly from cost basis. With year-end approaching, harvesting this loss against realized gains is optimal.',
  },
  {
    type: 'portfolio',
    priority: 'high',
    title: 'Rebalance to Target Allocation',
    description: 'Equity allocation has drifted to 78% vs. target 65%. Recommend trimming large-cap positions and increasing fixed income.',
    estimated_impact: '0.4% risk-adjusted return improvement',
    ai_reasoning: 'Portfolio drift of 13% exceeds threshold. Historical data suggests rebalancing at this level improves long-term Sharpe ratio.',
  },
  {
    type: 'planning',
    priority: 'medium',
    title: 'Roth Conversion Window Open',
    description: 'Client is in 22% bracket this year. Converting $45,000 to Roth IRA before income increases would save an estimated $9,000 in lifetime taxes.',
    estimated_impact: '$9,000 lifetime tax savings',
    ai_reasoning: 'Income projection shows bracket increase next year. Roth conversion in current year locks in lower rate on converted amount.',
  },
  {
    type: 'compliance',
    priority: 'medium',
    title: 'Annual Suitability Review Due',
    description: 'Client annual review and suitability assessment is due within 30 days. Schedule meeting to update risk tolerance and investment objectives.',
    estimated_impact: 'Regulatory compliance',
    ai_reasoning: 'FINRA Rule 4512 requires annual account updates. Current last review was 11 months ago.',
  },
  {
    type: 'communication',
    priority: 'low',
    title: 'Q4 Portfolio Review Email',
    description: 'Generate personalized year-end performance summary for client including highlights, tax summary, and 2025 outlook.',
    estimated_impact: 'Client retention & engagement',
    ai_reasoning: 'Proactive communication correlates with 34% higher client retention. Year-end is optimal timing.',
  },
];

const MOCK_TAX_OPPORTUNITIES = [
  {
    type: 'loss_harvesting',
    title: 'Tesla (TSLA) Loss Harvesting',
    symbol: 'TSLA',
    unrealized_loss: -18400,
    estimated_tax_savings: 4600,
    holding_period: 'long_term',
    recommendation: 'Sell TSLA position and replace with similar ETF (e.g., ARKK or IUSG) to maintain market exposure while realizing the loss.',
    urgency: 'high',
    deadline: 'December 31',
  },
  {
    type: 'asset_location',
    title: 'Move REITs to Tax-Deferred Account',
    asset_class: 'Real Estate',
    current_account: 'Taxable',
    recommended_account: 'IRA',
    annual_tax_drag: 2800,
    recommendation: 'REITs generate high ordinary income distributions (4.2% yield). Moving to IRA eliminates $2,800/yr in tax drag.',
    urgency: 'medium',
  },
  {
    type: 'roth_conversion',
    title: 'Strategic Roth Conversion',
    conversion_amount: 45000,
    current_bracket: '22%',
    next_year_projected_bracket: '24%',
    estimated_lifetime_savings: 9000,
    recommendation: 'Convert $45,000 of traditional IRA to Roth before December 31 to lock in the 22% rate.',
    urgency: 'high',
    deadline: 'December 31',
  },
  {
    type: 'municipal_bonds',
    title: 'Municipal Bond Allocation',
    tax_equivalent_yield: 5.2,
    after_tax_yield_improvement: 1.4,
    recommendation: 'Client in 32% bracket would benefit from allocating $120,000 to muni bonds. Tax-equivalent yield of 5.2% vs 3.8% on comparable corporates.',
    urgency: 'low',
  },
];

const MOCK_FINANCIAL_PLAN = {
  executive_summary: 'Based on your current financial position and goals, you are on track to meet your retirement objectives with a 78% probability of success under Monte Carlo simulations. Key areas of focus include maximizing tax-advantaged contributions, optimizing asset allocation, and implementing strategic Roth conversions over the next 5 years.',
  sections: [
    {
      title: 'Retirement Planning',
      content: 'At your current savings rate of 18% and projected portfolio growth of 7.2% annually, you are projected to accumulate $3.8M by age 65. Your target retirement income of $180,000/year (in today\'s dollars) requires approximately $4.5M, suggesting a modest savings gap that can be addressed through optimization strategies outlined below.',
    },
    {
      title: 'Investment Strategy',
      content: 'Recommended allocation: 65% equities (split between domestic and international), 25% fixed income, 7% alternatives, 3% cash. This allocation targets a 7-8% long-term return with a standard deviation of 12%, appropriate for your moderate-aggressive risk tolerance.',
    },
    {
      title: 'Tax Optimization',
      content: 'Implement a systematic Roth conversion strategy over 5 years, converting $40,000-$60,000 annually to minimize lifetime tax burden. Prioritize maxing out HSA ($7,750/year) as triple tax-advantaged vehicle.',
    },
    {
      title: 'Estate Planning',
      content: 'Current estate value of $4.2M approaches federal exemption. Recommend reviewing beneficiary designations, establishing irrevocable life insurance trust (ILIT), and annual gifting strategy ($18,000/year per recipient) to reduce taxable estate.',
    },
  ],
  action_items: [
    'Increase 401(k) contribution to IRS maximum ($23,000)',
    'Open and fund HSA account ($7,750)',
    'Execute Roth conversion of $45,000 before year-end',
    'Review and update estate plan documents',
    'Rebalance portfolio to target allocation',
  ],
};

const MOCK_REPORT = `
CONFIDENTIAL — CLIENT PORTFOLIO REPORT
Generated by FinCopilot AI Advisory System

═══════════════════════════════════════════════════════════
QUARTERLY PERFORMANCE SUMMARY | Q4 2024
═══════════════════════════════════════════════════════════

Dear Client,

This report provides a comprehensive overview of your portfolio performance,
tax position, and financial plan progress for Q4 2024.

PORTFOLIO PERFORMANCE
─────────────────────
• Total Portfolio Value: $2,847,392
• Quarter Return: +4.2% (Benchmark: +3.8%)
• YTD Return: +18.4% (Benchmark: +15.2%)
• Outperformance: +3.2% vs. S&P 500

ASSET ALLOCATION
─────────────────
• US Equities: 48% ($1,366,748)
• International: 17% ($483,857)
• Fixed Income: 25% ($711,848)
• Alternatives: 7% ($199,317)
• Cash: 3% ($85,422)

KEY HIGHLIGHTS
─────────────
✓ Portfolio outperformed benchmark by 3.2% YTD
✓ Successfully harvested $18,400 in tax losses (saving ~$4,600)
✓ Rebalanced to target allocation in October
✓ Roth conversion of $45,000 completed

OUTLOOK & NEXT STEPS
────────────────────
We recommend scheduling your annual review in January to discuss
2025 planning priorities, including potential Roth conversion strategy
and estate planning updates.

Please contact your advisor to schedule your review.

Sincerely,
FinCopilot AI Advisory Team
`;

// ─── AI Service Functions ─────────────────────────────────────────────────────

const generateRecommendations = async (clientData, portfolioData) => {
  if (!openaiClient) {
    // Return mock data in development
    await new Promise((r) => setTimeout(r, 800)); // simulate latency
    return MOCK_RECOMMENDATIONS;
  }

  const prompt = `You are an AI financial advisor for a wealth management firm.
  Analyze the following client data and provide next-best-action recommendations in JSON format.

  Client: ${JSON.stringify(clientData)}
  Portfolio: ${JSON.stringify(portfolioData)}

  Return an array of recommendations with fields: type, priority, title, description, estimated_impact, ai_reasoning.
  Types: portfolio, tax, planning, compliance, communication.
  Priorities: critical, high, medium, low.`;

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  // OpenAI may use different top-level keys — find the array
  return parsed.recommendations || parsed.actions || Object.values(parsed).find(Array.isArray) || [];
};

const generateTaxOpportunities = async (clientData, portfolioData, transactions) => {
  if (!openaiClient) {
    await new Promise((r) => setTimeout(r, 600));
    return MOCK_TAX_OPPORTUNITIES;
  }

  const prompt = `Analyze this client's tax situation and identify optimization opportunities.
  Client: ${JSON.stringify(clientData)}
  Portfolio: ${JSON.stringify(portfolioData)}
  Recent Transactions: ${JSON.stringify(transactions)}

  Return JSON array of tax opportunities with: type, title, estimated_tax_savings, recommendation, urgency.`;

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  return parsed.opportunities || parsed.tax_opportunities || Object.values(parsed).find(Array.isArray) || [];
};

const generateFinancialPlan = async (clientData, goals, portfolioData) => {
  if (!openaiClient) {
    await new Promise((r) => setTimeout(r, 1200));
    return MOCK_FINANCIAL_PLAN;
  }

  const prompt = `Generate a comprehensive financial plan for this client.
  Client: ${JSON.stringify(clientData)}
  Goals: ${JSON.stringify(goals)}
  Portfolio: ${JSON.stringify(portfolioData)}

  Return JSON with: executive_summary, sections (array of {title, content}), action_items array.`;

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 3000,
  });

  return JSON.parse(response.choices[0].message.content);
};

const generateClientReport = async (clientData, portfolioData, period) => {
  if (!openaiClient) {
    await new Promise((r) => setTimeout(r, 1000));
    return MOCK_REPORT;
  }

  const prompt = `Generate a professional client portfolio report for ${period}.
  Client: ${JSON.stringify(clientData)}
  Portfolio: ${JSON.stringify(portfolioData)}

  Write a formal, professional report with performance summary, key highlights, and outlook.`;

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2000,
  });

  return response.choices[0].message.content;
};

const queryDocument = async (documentText, userQuestion) => {
  if (!openaiClient) {
    await new Promise((r) => setTimeout(r, 700));
    return `Based on the document, here is the relevant information regarding "${userQuestion}":

The trust document establishes a revocable living trust with the grantor maintaining full control during lifetime. The successor trustee (FirstBank Trust Company) assumes management upon incapacity or death. The trust includes real estate holdings valued at approximately $1.2M, investment accounts, and personal property. Distribution instructions specify equal division among three named beneficiaries upon grantor's passing, with special provisions for any minor beneficiaries including professional trustee management until age 25.

Key dates: Trust established March 15, 2019. Last amended January 8, 2023.`;
  }

  const prompt = `You are analyzing a financial document. Answer the user's question based on the document content.

  Document: ${documentText}

  Question: ${userQuestion}

  Provide a clear, accurate answer based only on the document content.`;

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
  });

  return response.choices[0].message.content;
};

const runMonteCarloSimulation = async (portfolioData, goals) => {
  // Monte Carlo simulation (always computed locally for speed)
  const simulations = 1000;
  const years = 30;
  const annualReturn = 0.072;
  const annualStdDev = 0.15;
  const initialValue = portfolioData?.total_value || 2000000;
  const annualWithdrawal = goals?.retirement_income_goal || 150000;

  const results = [];
  for (let i = 0; i < simulations; i++) {
    let value = initialValue;
    let success = true;
    const path = [value];

    for (let year = 0; year < years; year++) {
      const randomReturn = annualReturn + annualStdDev * (Math.random() * 2 - 1) * Math.sqrt(1);
      value = value * (1 + randomReturn) - annualWithdrawal;
      if (value <= 0) {
        success = false;
        break;
      }
      path.push(Math.max(0, value));
    }
    results.push({ success, finalValue: Math.max(0, value), path });
  }

  const successCount = results.filter((r) => r.success).length;
  const successRate = (successCount / simulations) * 100;

  // Percentile paths
  const sorted = results.sort((a, b) => a.finalValue - b.finalValue);
  const p10Path = sorted[Math.floor(simulations * 0.1)].path;
  const p50Path = sorted[Math.floor(simulations * 0.5)].path;
  const p90Path = sorted[Math.floor(simulations * 0.9)].path;

  const chartData = Array.from({ length: Math.min(years + 1, p50Path.length) }, (_, i) => ({
    year: new Date().getFullYear() + i,
    pessimistic: Math.round(p10Path[i] || 0),
    expected: Math.round(p50Path[i] || 0),
    optimistic: Math.round(p90Path[i] || 0),
  }));

  return {
    success_rate: Math.round(successRate),
    median_final_value: Math.round(sorted[Math.floor(simulations * 0.5)].finalValue),
    p10_final_value: Math.round(sorted[Math.floor(simulations * 0.1)].finalValue),
    p90_final_value: Math.round(sorted[Math.floor(simulations * 0.9)].finalValue),
    chart_data: chartData,
    simulations_run: simulations,
  };
};

module.exports = {
  generateRecommendations,
  generateTaxOpportunities,
  generateFinancialPlan,
  generateClientReport,
  queryDocument,
  runMonteCarloSimulation,
};
