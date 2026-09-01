const db = require('./mongo');
const graphDb = require('./graph');
const { hashPassword } = require('../utils/security');

function seedDatabase() {
  const usersCol = db.getCollection("users");
  const startupsCol = db.getCollection("startups");
  const scorecardsCol = db.getCollection("scorecards");
  const ddCol = db.getCollection("due_diligence");
  const meetingsCol = db.getCollection("meetings");
  const proposalsCol = db.getCollection("proposals");
  const portfolioCol = db.getCollection("portfolio");
  const updatesCol = db.getCollection("progress_updates");
  const categoriesCol = db.getCollection("categories");

  if (usersCol.countDocuments() > 0 && startupsCol.countDocuments() > 0) {
    console.log("[SEED DATA] Database already contains data. Skipping re-seed.");
    return;
  }

  // Clear existing data
  usersCol._data = {};
  startupsCol._data = {};
  scorecardsCol._data = {};
  ddCol._data = {};
  meetingsCol._data = {};
  proposalsCol._data = {};
  portfolioCol._data = {};
  updatesCol._data = {};
  categoriesCol._data = {};

  // 1. Categories
  const categories = [
    { id: "cat_1", name: "FinTech", description: "Financial Technology & Payment Solutions" },
    { id: "cat_2", name: "HealthTech", description: "Healthcare, Medical AI & Digital Health" },
    { id: "cat_3", name: "CleanTech", description: "Renewable Energy & Climate Solutions" },
    { id: "cat_4", name: "SaaS / B2B", description: "Enterprise Software & Cloud Infra" },
    { id: "cat_5", name: "DeepTech / AI", description: "Artificial Intelligence & Robotics" }
  ];
  categories.forEach(c => categoriesCol.insertOne(c));

  // 2. Users
  const adminUser = {
    id: "usr_admin",
    email: "admin@ventureconnect.com",
    password: hashPassword("admin123"),
    name: "System Administrator",
    role: "admin",
    firm_or_company: "VentureConnect HQ",
    bio: "Managing platform integrity, startup verification, and user authentication.",
    is_verified: true,
    is_active: true
  };

  const ent1 = {
    id: "usr_ent1",
    email: "sarah@novapay.io",
    password: hashPassword("password123"),
    name: "Sarah Chen",
    role: "entrepreneur",
    firm_or_company: "NovaPay Inc.",
    bio: "Ex-Stripe engineer building next-gen cross-border payments infrastructure.",
    is_verified: true,
    is_active: true
  };

  const ent2 = {
    id: "usr_ent2",
    email: "alex@healthpulse.ai",
    password: hashPassword("password123"),
    name: "Dr. Alex Rivera",
    role: "entrepreneur",
    firm_or_company: "HealthPulse AI",
    bio: "Stanford MD/PhD specializing in automated medical diagnostics.",
    is_verified: true,
    is_active: true
  };

  const ent3 = {
    id: "usr_ent3",
    email: "marcus@cleangrid.tech",
    password: hashPassword("password123"),
    name: "Marcus Vance",
    role: "entrepreneur",
    firm_or_company: "CleanGrid Tech",
    bio: "Clean energy pioneer scaling AI-driven smart grid storage.",
    is_verified: true,
    is_active: true
  };

  const vc1 = {
    id: "usr_vc1",
    email: "david@horizoncap.com",
    password: hashPassword("password123"),
    name: "David Miller",
    role: "vc",
    firm_or_company: "Horizon Capital ($250M AUM)",
    bio: "Managing Partner focused on FinTech and Enterprise SaaS investments.",
    is_verified: true,
    is_active: true
  };

  const vc2 = {
    id: "usr_vc2",
    email: "elena@apexvc.com",
    password: hashPassword("password123"),
    name: "Elena Rostova",
    role: "vc",
    firm_or_company: "Apex Ventures ($180M AUM)",
    bio: "Partner investing in HealthTech, DeepTech, and AI infrastructure.",
    is_verified: true,
    is_active: true
  };

  [adminUser, ent1, ent2, ent3, vc1, vc2].forEach(u => usersCol.insertOne(u));

  // 3. Startups
  const startup1 = {
    id: "stp_1",
    entrepreneur_id: "usr_ent1",
    name: "NovaPay",
    logo_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80",
    industry: "FinTech",
    stage: "Seed",
    location: "San Francisco, CA",
    description: "Unified cross-border payment API for high-growth emerging market marketplaces.",
    problem: "Legacy payment gateways take 3-5 days and charge up to 6% in FX markup.",
    solution: "Sub-second cross-border settlement engine reducing costs by 70%.",
    business_model: "0.45% transaction volume fee + $499 monthly enterprise API tier.",
    target_market: "$1.2 Trillion global cross-border B2B ecommerce market.",
    funding_required: 1500000.0,
    equity_offered_percent: 15.0,
    founder_name: "Sarah Chen",
    team_info: "4 Full-time engineers ex-Stripe, PayPal & Plaid.",
    financials: {
      revenue_mrr: 42000.0,
      arr: 504000.0,
      monthly_burn: 28000.0,
      previous_funding: 350000.0,
      funding_required: 1500000.0,
      equity_offered_percent: 15.0,
      financial_projections_3yr: "Year 1: $1.8M ARR | Year 2: $6.2M ARR | Year 3: $18.5M ARR"
    },
    pitch_deck_url: "/api/uploads/novapay_pitch_deck.pdf",
    status: "Published",
    admin_notes: "All financial documents & business registration verified by Admin.",
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-15T14:30:00Z"
  };

  const startup2 = {
    id: "stp_2",
    entrepreneur_id: "usr_ent2",
    name: "HealthPulse AI",
    logo_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80",
    industry: "HealthTech",
    stage: "Series A",
    location: "Boston, MA",
    description: "Real-time AI diagnostic copilot for radiologists reducing misdiagnosis by 40%.",
    problem: "Radiologist shortage causes 48-hour delays in critical MRI & CT scan evaluations.",
    solution: "FDA-cleared computer vision platform providing instant triage heatmap highlights.",
    business_model: "SaaS per hospital bed ($15k/year/hospital) + volume scan tier.",
    target_market: "6,000+ US acute care hospitals and imaging centers.",
    funding_required: 3000000.0,
    equity_offered_percent: 12.0,
    founder_name: "Dr. Alex Rivera",
    team_info: "8 Team members: 3 Radiologist advisors, 4 ML PhDs.",
    financials: {
      revenue_mrr: 115000.0,
      arr: 1380000.0,
      monthly_burn: 65000.0,
      previous_funding: 1200000.0,
      funding_required: 3000000.0,
      equity_offered_percent: 12.0,
      financial_projections_3yr: "Year 1: $3.5M ARR | Year 2: $11.0M ARR | Year 3: $28.0M ARR"
    },
    pitch_deck_url: "/api/uploads/healthpulse_pitch_deck.pdf",
    status: "Published",
    admin_notes: "FDA clearance documentation uploaded & verified.",
    created_at: "2026-08-05T11:00:00Z",
    updated_at: "2026-08-20T09:15:00Z"
  };

  const startup3 = {
    id: "stp_3",
    entrepreneur_id: "usr_ent3",
    name: "CleanGrid Tech",
    logo_url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=150&auto=format&fit=crop&q=80",
    industry: "CleanTech",
    stage: "Seed",
    location: "Austin, TX",
    description: "Grid-scale battery optimization platform maximizing renewable energy arbitrage.",
    problem: "Solar & wind power producers lose up to 25% energy potential due to grid curtailment.",
    solution: "Autonomous battery dispatch software predicting grid congestion with 96% accuracy.",
    business_model: "Gain-share revenue model (20% of extra energy arbitrage revenue generated).",
    target_market: "Utility scale solar & energy storage operators in ERCOT & CAISO.",
    funding_required: 2000000.0,
    equity_offered_percent: 18.0,
    founder_name: "Marcus Vance",
    team_info: "5 CleanTech engineers ex-Tesla Energy & Enphase.",
    financials: {
      revenue_mrr: 25000.0,
      arr: 300000.0,
      monthly_burn: 20000.0,
      previous_funding: 400000.0,
      funding_required: 2000000.0,
      equity_offered_percent: 18.0,
      financial_projections_3yr: "Year 1: $1.2M ARR | Year 2: $4.8M ARR | Year 3: $14.0M ARR"
    },
    pitch_deck_url: "/api/uploads/cleangrid_pitch_deck.pdf",
    status: "Published",
    admin_notes: "Energy utility pilot contracts validated.",
    created_at: "2026-08-10T14:00:00Z",
    updated_at: "2026-08-22T16:45:00Z"
  };

  [startup1, startup2, startup3].forEach(s => startupsCol.insertOne(s));

  // 4. VC Scorecards
  const scorecard1 = {
    id: "sc_1",
    vc_id: "usr_vc1",
    startup_id: "stp_1",
    market_potential: { rating: 9, notes: "Huge addressable market in LatAm & SE Asia." },
    business_model: { rating: 8, notes: "Strong take-rate economics with API subscriptions." },
    product: { rating: 9, notes: "Sub-second latency benchmark." },
    team: { rating: 9, notes: "Experienced founder with Stripe payments background." },
    financials: { rating: 7, notes: "$42k MRR growing 20% MoM." },
    competition: { rating: 8, notes: "Well differentiated against dLocal and Wise." },
    scalability: { rating: 9, notes: "High gross margin software platform." },
    overall_score: 8.43,
    created_at: "2026-08-16T15:30:00Z"
  };

  scorecardsCol.insertOne(scorecard1);

  // 5. Due Diligence Workspace
  const ddItems = [
    { id: "dd_1", category: "Business", title: "Market Size & SAM Validation", description: "Verify TAM/SAM calculations.", is_completed: true, notes: "Validated via Gartner Report.", verified_by_vc_id: "usr_vc1" },
    { id: "dd_2", category: "Business", title: "Customer Pipeline & Cohorts", description: "Review top 10 customer contracts.", is_completed: true, notes: "Zero churn in last 6 months.", verified_by_vc_id: "usr_vc1" },
    { id: "dd_3", category: "Financial", title: "Bank Statements & MRR Audit", description: "Reconcile Stripe statements with $42k MRR.", is_completed: true, notes: "MRR verified by audit team.", verified_by_vc_id: "usr_vc1" },
    { id: "dd_4", category: "Financial", title: "Cap Table & Option Pool Verification", description: "Verify share distribution.", is_completed: true, notes: "Cap table clean, 10% ESOP reserved.", verified_by_vc_id: "usr_vc1" },
    { id: "dd_5", category: "Legal", title: "Incorporation & Good Standing", description: "Check Delaware filing.", is_completed: true, notes: "Delaware Certificate received.", verified_by_vc_id: "usr_vc1" },
    { id: "dd_6", category: "Legal", title: "IP Assignment Agreements", description: "Confirm IP assignment docs.", is_completed: true, notes: "IP assigned to NovaPay Inc.", verified_by_vc_id: "usr_vc1" },
    { id: "dd_7", category: "Legal", title: "Regulatory Compliance", description: "Review FinCEN MSB registration.", is_completed: true, notes: "MSB registration verified.", verified_by_vc_id: "usr_vc1" },
    { id: "dd_8", category: "Team", title: "Founder Reference Checks", description: "Conduct 3 backchannel calls.", is_completed: true, notes: "Glowing references from former Stripe VP.", verified_by_vc_id: "usr_vc1" },
    { id: "dd_9", category: "Team", title: "Background Checks", description: "Run criminal background checks.", is_completed: false, notes: "Pending report.", verified_by_vc_id: "" },
    { id: "dd_10", category: "Financial", title: "Audited Financial Statements", description: "Review 2025 CPA financial statements.", is_completed: false, notes: "Scheduled for Friday.", verified_by_vc_id: "" }
  ];

  ddCol.insertOne({
    id: "dd_ws_novapay",
    startup_id: "stp_1",
    vc_id: "usr_vc1",
    items: ddItems,
    total_checks: 10,
    completed_checks: 8,
    completion_percentage: 80.0
  });

  // 6. Meetings
  meetingsCol.insertOne({
    id: "mtg_1",
    startup_id: "stp_1",
    startup_name: "NovaPay",
    vc_id: "usr_vc1",
    vc_name: "David Miller (Horizon Capital)",
    entrepreneur_id: "usr_ent1",
    date: "2026-08-28",
    time: "14:00",
    purpose: "Term Sheet & Partner IC Presentation",
    message: "Invite Sarah to present NovaPay to our full investment committee.",
    status: "Accepted",
    created_at: "2026-08-20T10:00:00Z"
  });

  // 7. Proposals & Counter-Offers
  proposalsCol.insertOne({
    id: "prop_1",
    startup_id: "stp_1",
    startup_name: "NovaPay",
    vc_id: "usr_vc1",
    vc_name: "David Miller (Horizon Capital)",
    entrepreneur_id: "usr_ent1",
    investment_amount: 1500000.0,
    equity_percent: 15.0,
    conditions: "1 Board seat, pro-rata rights, 1-year cliff vesting.",
    notes: "Excited to lead your Seed round!",
    status: "Counter Offer",
    counter_offers: [
      {
        sender_role: "vc",
        sender_id: "usr_vc1",
        sender_name: "David Miller",
        investment_amount: 1500000.0,
        equity_percent: 15.0,
        conditions: "1 Board seat, pro-rata rights.",
        notes: "Initial term sheet proposal.",
        timestamp: "2026-08-22T09:30:00Z"
      },
      {
        sender_role: "entrepreneur",
        sender_id: "usr_ent1",
        sender_name: "Sarah Chen",
        investment_amount: 1500000.0,
        equity_percent: 12.5,
        conditions: "1 Board observer seat, pro-rata rights retained.",
        notes: "Given our MRR growth, we propose 12.5% equity.",
        timestamp: "2026-08-23T14:15:00Z"
      }
    ],
    created_at: "2026-08-22T09:30:00Z",
    updated_at: "2026-08-23T14:15:00Z"
  });

  // 8. Portfolio
  portfolioCol.insertOne({
    id: "port_1",
    vc_id: "usr_vc2",
    startup_id: "stp_2",
    startup_name: "HealthPulse AI",
    investment_amount: 1200000.0,
    equity_percent: 10.0,
    investment_date: "2026-03-15",
    stage_at_investment: "Seed",
    current_status: "Active Portfolio Company"
  });

  updatesCol.insertOne({
    id: "upd_1",
    startup_id: "stp_2",
    startup_name: "HealthPulse AI",
    title: "Q2 2026 Progress Update - Hospital Deployments & Revenue Milestone",
    period: "Q2 2026",
    revenue: 115000.0,
    customers_count: 14,
    employees_count: 8,
    milestones_achieved: "Secured 4 new hospital deployment contracts; achieved $115k MRR.",
    product_progress: "Released v2.4 diagnostic heatmap pipeline.",
    new_funding: 0.0,
    business_notes: "On track to hit $1.5M ARR ahead of schedule.",
    created_at: "2026-07-15T10:00:00Z"
  });

  // 9. Graph Database Seed
  graphDb.addNode("usr_vc1", "VC", { id: "usr_vc1", name: "David Miller", firm: "Horizon Capital" });
  graphDb.addNode("usr_vc2", "VC", { id: "usr_vc2", name: "Elena Rostova", firm: "Apex Ventures" });
  graphDb.addNode("usr_vc3", "VC", { id: "usr_vc3", name: "Michael Chang", firm: "Sequoia Next" });

  graphDb.addNode("stp_1", "Startup", { id: "stp_1", name: "NovaPay", industry: "FinTech", stage: "Seed" });
  graphDb.addNode("stp_2", "Startup", { id: "stp_2", name: "HealthPulse AI", industry: "HealthTech", stage: "Series A" });
  graphDb.addNode("stp_3", "Startup", { id: "stp_3", name: "CleanGrid Tech", industry: "CleanTech", stage: "Seed" });

  graphDb.addNode("usr_ent1", "Entrepreneur", { id: "usr_ent1", name: "Sarah Chen" });
  graphDb.addNode("usr_ent2", "Entrepreneur", { id: "usr_ent2", name: "Dr. Alex Rivera" });

  graphDb.addRelationship("usr_vc1", "stp_1", "INVESTED_IN", { amount: 1500000, equity: 15.0, round: "Seed" });
  graphDb.addRelationship("usr_vc2", "stp_2", "INVESTED_IN", { amount: 1200000, equity: 10.0, round: "Seed" });
  graphDb.addRelationship("usr_vc3", "stp_1", "CO_INVESTED_WITH", { syndicate: "NovaPay Seed Round" });
  graphDb.addRelationship("usr_vc1", "usr_vc3", "CO_INVESTED_WITH", { year: 2026 });

  graphDb.addRelationship("usr_vc1", "stp_1", "EVALUATED", { score: 8.43 });
  graphDb.addRelationship("usr_vc2", "stp_2", "EVALUATED", { score: 8.71 });

  graphDb.addRelationship("usr_ent1", "stp_1", "FOUNDED", { role: "CEO & Founder" });
  graphDb.addRelationship("usr_ent2", "stp_2", "FOUNDED", { role: "Founder & MD" });

  console.log("[SEED DATA] Node.js Express seed data successfully populated!");
}

module.exports = seedDatabase;
