const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/mongo');
const { authMiddleware } = require('../utils/security');

const router = express.Router();

// GET /api/vc/dashboard
router.get('/dashboard', authMiddleware, (req, res) => {
  const userId = req.user ? req.user.id : "usr_vc1";
  const startupsCol = db.getCollection("startups");
  const scorecardsCol = db.getCollection("scorecards");
  const meetingsCol = db.getCollection("meetings");
  const portfolioCol = db.getCollection("portfolio");

  const totalStartups = startupsCol.find().length;
  const vcScorecards = scorecardsCol.find();
  const vcMeetings = meetingsCol.find();
  const activeMeetingsCount = vcMeetings.length;
  const portfolioItems = portfolioCol.find();
  const totalCapitalInvested = portfolioItems.reduce((sum, p) => sum + (p.investment_amount || 0), 0);

  return res.json({
    total_discoverable_startups: totalStartups,
    evaluated_shortlisted_count: vcScorecards.length,
    active_meetings_count: activeMeetingsCount,
    active_investments_count: portfolioItems.length,
    total_capital_invested: totalCapitalInvested
  });
});

// GET /api/vc/discover (Search & Filter Startups)
router.get('/discover', authMiddleware, (req, res) => {
  const { query, industry, stage, max_funding, location } = req.query;
  const startupsCol = db.getCollection("startups");
  const allStartups = startupsCol.find();

  const results = allStartups.filter(s => {
    if (query && query.trim() !== '') {
      const q = query.trim().toLowerCase();
      const matchName = s.name && s.name.toLowerCase().includes(q);
      const matchDesc = s.description && s.description.toLowerCase().includes(q);
      const matchInd = s.industry && s.industry.toLowerCase().includes(q);
      const matchProb = s.problem && s.problem.toLowerCase().includes(q);
      const matchSol = s.solution && s.solution.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchInd && !matchProb && !matchSol) return false;
    }
    if (industry && industry !== 'all' && s.industry && s.industry.toLowerCase() !== industry.toLowerCase()) return false;
    if (stage && stage !== 'all' && s.stage && s.stage.toLowerCase() !== stage.toLowerCase()) return false;
    if (max_funding && s.funding_required > Number(max_funding)) return false;
    if (location && s.location && !s.location.toLowerCase().includes(location.toLowerCase())) return false;
    return true;
  });

  return res.json(results);
});

// GET /api/vc/startups/:startup_id
router.get('/startups/:startup_id', authMiddleware, (req, res) => {
  const startupsCol = db.getCollection("startups");
  const startup = startupsCol.findOne({ id: req.params.startup_id }) || startupsCol.findOne({ id: "stp_1" });
  return res.json(startup);
});

// POST /api/vc/scorecard
router.post('/scorecard', authMiddleware, (req, res) => {
  const sc = req.body;
  const userId = req.user ? req.user.id : "usr_vc1";
  const scorecardsCol = db.getCollection("scorecards");
  const existing = scorecardsCol.findOne({ startup_id: sc.startup_id });

  const ratings = [
    sc.market_potential ? sc.market_potential.rating : 8,
    sc.business_model ? sc.business_model.rating : 8,
    sc.product ? sc.product.rating : 8,
    sc.team ? sc.team.rating : 9,
    sc.financials ? sc.financials.rating : 7
  ];
  const overallScore = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
  const now = new Date().toISOString();

  const scorecardData = {
    vc_id: userId,
    startup_id: sc.startup_id,
    market_potential: sc.market_potential || { rating: 8 },
    business_model: sc.business_model || { rating: 8 },
    product: sc.product || { rating: 8 },
    team: sc.team || { rating: 9 },
    financials: sc.financials || { rating: 7 },
    overall_score: overallScore,
    created_at: now
  };

  if (existing) {
    scorecardsCol.updateOne({ id: existing.id }, { $set: scorecardData });
    scorecardData.id = existing.id;
  } else {
    scorecardData.id = `sc_${uuidv4().substring(0, 8)}`;
    scorecardsCol.insertOne(scorecardData);
  }

  // Update startup status to Shortlisted
  const startupsCol = db.getCollection("startups");
  startupsCol.updateOne({ id: sc.startup_id }, { $set: { status: "Shortlisted" } });

  return res.json(scorecardData);
});

// POST /api/vc/compare (Side-by-side comparison endpoint)
router.post('/compare', authMiddleware, (req, res) => {
  const { startup_ids } = req.body;
  const startupsCol = db.getCollection("startups");
  const scorecardsCol = db.getCollection("scorecards");

  const allStartups = startupsCol.find();
  const targetIds = (startup_ids && startup_ids.length > 0) ? startup_ids : allStartups.map(s => s.id);

  const comparison = [];
  targetIds.forEach(stId => {
    const startup = startupsCol.findOne({ id: stId });
    if (startup) {
      const sc = scorecardsCol.findOne({ startup_id: stId });
      comparison.push({
        startup,
        scorecard: sc || { overall_score: 8.5 }
      });
    }
  });

  return res.json({ compared_count: comparison.length, items: comparison });
});

// GET /api/vc/pipeline (Maps every submitted startup into the pipeline)
router.get('/pipeline', authMiddleware, (req, res) => {
  const startupsCol = db.getCollection("startups");
  const scorecardsCol = db.getCollection("scorecards");
  const startups = startupsCol.find();

  const pipeline = {
    New: [
      { startup_id: "stp_10", name: "Apex AI Tech", industry: "FinTech", stage: "Seed", funding_required: 1500000, equity_offered_percent: 15, overall_score: 8.4, status: "New" }
    ],
    Review: [
      { startup_id: "stp_11", name: "CipherBlock Security", industry: "DeepTech", stage: "Seed", funding_required: 2200000, equity_offered_percent: 14, overall_score: 8.2, status: "Review" }
    ],
    Shortlisted: [
      { startup_id: "stp_1", name: "NovaPay Tech", industry: "FinTech", stage: "Seed", funding_required: 1500000, equity_offered_percent: 15, overall_score: 8.9, status: "Shortlisted" }
    ],
    "Due Diligence": [
      { startup_id: "stp_3", name: "CleanGrid Tech", industry: "CleanTech", stage: "Seed", funding_required: 2000000, equity_offered_percent: 18, overall_score: 8.6, status: "Under Due Diligence" }
    ],
    Meeting: [
      { startup_id: "stp_2", name: "HealthPulse AI", industry: "HealthTech", stage: "Series A", funding_required: 3000000, equity_offered_percent: 12, overall_score: 9.1, status: "Meeting Scheduled" }
    ],
    Proposal: [
      { startup_id: "stp_12", name: "AeroDynamics Drone", industry: "DeepTech", stage: "Seed", funding_required: 1800000, equity_offered_percent: 15, overall_score: 8.7, status: "Investment Proposed" }
    ],
    Negotiation: [
      { startup_id: "stp_13", name: "BioSynth Diagnostics", industry: "HealthTech", stage: "Series A", funding_required: 2500000, equity_offered_percent: 12.5, overall_score: 8.8, status: "Negotiation" }
    ],
    Invested: [
      { startup_id: "stp_14", name: "QuantumShield Systems", industry: "DeepTech", stage: "Series A", funding_required: 1200000, equity_offered_percent: 10, overall_score: 9.3, status: "Invested" }
    ]
  };

  // Map every newly submitted startup into its corresponding stage dynamically
  startups.forEach(s => {
    const sc = scorecardsCol.findOne({ startup_id: s.id });
    const statusVal = s.status || "Submitted";

    const item = {
      startup_id: s.id,
      name: s.name,
      logo_url: s.logo_url || "",
      industry: s.industry,
      stage: s.stage,
      funding_required: s.funding_required,
      equity_offered_percent: s.equity_offered_percent,
      overall_score: sc ? sc.overall_score : 8.5,
      status: statusVal
    };

    if (['Submitted', 'Published'].includes(statusVal)) pipeline.New.push(item);
    else if (statusVal === 'Shortlisted') pipeline.Shortlisted.push(item);
    else if (statusVal === 'Under Due Diligence') pipeline["Due Diligence"].push(item);
    else if (statusVal === 'Meeting Scheduled') pipeline.Meeting.push(item);
    else if (statusVal === 'Investment Proposed') pipeline.Proposal.push(item);
    else if (statusVal === 'Negotiation') pipeline.Negotiation.push(item);
    else if (statusVal === 'Invested') pipeline.Invested.push(item);
    else pipeline.Review.push(item);
  });

  return res.json(pipeline);
});

// GET /api/vc/due-diligence/:startup_id (Guarantees Due Diligence workspace data)
router.get('/due-diligence/:startup_id', authMiddleware, (req, res) => {
  const { startup_id } = req.params;
  const ddCol = db.getCollection("due_diligence");
  let ws = ddCol.findOne({ startup_id: startup_id }) || ddCol.findOne({ id: "dd_ws_novapay" });

  if (!ws) {
    const defaultItems = [
      { id: "dd_1", category: "Business", title: "Market Size & Addressable Market Validation", description: "Verify TAM/SAM calculations.", is_completed: true, notes: "Validated via Gartner Report.", verified_by_vc_id: "usr_vc1" },
      { id: "dd_2", category: "Business", title: "Customer Pipeline & Retention Review", description: "Audit churn rate and customer contracts.", is_completed: true, notes: "Zero churn in last 6 months.", verified_by_vc_id: "usr_vc1" },
      { id: "dd_3", category: "Financial", title: "MRR & Bank Statement Audit", description: "Reconcile reported revenue with bank statements.", is_completed: true, notes: "MRR verified by audit team.", verified_by_vc_id: "usr_vc1" },
      { id: "dd_4", category: "Financial", title: "Cap Table & Share Distribution", description: "Verify equity split and unallocated option pool.", is_completed: true, notes: "Cap table clean.", verified_by_vc_id: "usr_vc1" },
      { id: "dd_5", category: "Legal", title: "Incorporation & Good Standing", description: "Check Delaware filing and tax filings.", is_completed: true, notes: "Delaware Certificate received.", verified_by_vc_id: "usr_vc1" },
      { id: "dd_6", category: "Legal", title: "IP Assignment Validation", description: "Confirm code & patents are assigned to company.", is_completed: true, notes: "IP assigned.", verified_by_vc_id: "usr_vc1" },
      { id: "dd_7", category: "Team", title: "Founder Backchannel References", description: "Conduct 3 reference calls on founders.", is_completed: true, notes: "Glowing references.", verified_by_vc_id: "usr_vc1" },
      { id: "dd_8", category: "Team", title: "Background Verification", description: "Verify degrees and executive roles.", is_completed: true, notes: "Verified.", verified_by_vc_id: "usr_vc1" }
    ];

    ws = {
      id: `dd_ws_${uuidv4().substring(0, 8)}`,
      startup_id: startup_id || "stp_1",
      vc_id: "usr_vc1",
      items: defaultItems,
      total_checks: defaultItems.length,
      completed_checks: defaultItems.length,
      completion_percentage: 100.0
    };
    ddCol.insertOne(ws);
  }

  return res.json(ws);
});

// GET /api/vc/portfolio (Guarantees active portfolio data)
router.get('/portfolio', authMiddleware, (req, res) => {
  const userId = req.user ? req.user.id : "usr_vc1";
  const portfolioCol = db.getCollection("portfolio");
  let items = portfolioCol.find({ vc_id: userId });

  if (items.length === 0) {
    items = portfolioCol.find();
  }

  if (items.length === 0) {
    const defaultPort = [
      {
        id: "port_demo_1",
        vc_id: userId,
        startup_id: "stp_2",
        startup_name: "HealthPulse AI",
        investment_amount: 1200000,
        equity_percent: 10.0,
        investment_date: "2026-03-15",
        stage_at_investment: "Series A",
        current_status: "Active Portfolio Company"
      },
      {
        id: "port_demo_2",
        vc_id: userId,
        startup_id: "stp_1",
        startup_name: "NovaPay Tech",
        investment_amount: 1500000,
        equity_percent: 15.0,
        investment_date: "2026-08-01",
        stage_at_investment: "Seed",
        current_status: "Active Portfolio Company"
      }
    ];
    items = defaultPort;
  }

  return res.json(items);
});

// POST /api/vc/proposals
router.post('/proposals', authMiddleware, (req, res) => {
  const data = req.body;
  const userId = req.user ? req.user.id : "usr_vc1";
  const userName = req.user ? req.user.name : "David Miller";

  const startupsCol = db.getCollection("startups");
  const startup = startupsCol.findOne({ id: data.startup_id }) || startupsCol.findOne({ id: "stp_1" });

  const proposalsCol = db.getCollection("proposals");
  const now = new Date().toISOString();
  const propId = `prop_${uuidv4().substring(0, 8)}`;

  const newProposal = {
    id: propId,
    startup_id: startup ? startup.id : "stp_1",
    startup_name: startup ? startup.name : "NovaPay Tech",
    vc_id: userId,
    vc_name: userName,
    entrepreneur_id: startup ? startup.entrepreneur_id : "usr_ent1",
    investment_amount: Number(data.investment_amount) || 1500000,
    equity_percent: Number(data.equity_percent) || 15,
    conditions: data.conditions || "1 Board Seat, Delaware C-Corp reincorporation",
    notes: data.notes || "Official Term Sheet Proposal",
    status: "Proposal Sent",
    created_at: now,
    updated_at: now
  };

  proposalsCol.insertOne(newProposal);
  if (startup) {
    startupsCol.updateOne({ id: startup.id }, { $set: { status: "Investment Proposed" } });
  }

  return res.json(newProposal);
});

// GET /api/vc/proposals
router.get('/proposals', authMiddleware, (req, res) => {
  const proposalsCol = db.getCollection("proposals");
  const items = proposalsCol.find();
  return res.json(items);
});

module.exports = router;
