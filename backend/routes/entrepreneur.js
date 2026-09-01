const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/mongo');
const graphDb = require('../database/graph');
const config = require('../config');
const { authMiddleware } = require('../utils/security');

const router = express.Router();

// Multer storage configuration for PDF Pitch Decks
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const userId = req.user ? req.user.id : "usr_ent1";
    const filename = `${userId}_${uuidv4().substring(0, 6)}_${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.pdf') {
      return cb(new Error('Only PDF files are allowed for pitch deck upload.'));
    }
    cb(null, true);
  }
});

// POST /api/entrepreneur/startup (Submit / Create Startup Idea & Register in Graph Database)
router.post('/startup', authMiddleware, (req, res) => {
  const data = req.body;
  const startupsCol = db.getCollection("startups");
  const now = new Date().toISOString();

  const userId = req.user ? req.user.id : "usr_ent1";
  const userName = req.user ? req.user.name : "Sarah Chen";

  const startupId = `stp_${uuidv4().substring(0, 8)}`;
  const newStartup = {
    id: startupId,
    entrepreneur_id: userId,
    name: data.name || "Apex AI Tech",
    logo_url: data.logo_url || "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80",
    industry: data.industry || "FinTech",
    stage: data.stage || "Seed",
    location: data.location || "San Francisco, CA",
    description: data.description || "Next-generation platform capturing market growth.",
    problem: data.problem || "Friction in traditional workflows.",
    solution: data.solution || "Automated cloud solution with 10x speed.",
    business_model: data.business_model || "B2B SaaS / Marketplace",
    target_market: data.target_market || "Global Enterprise",
    funding_required: Number(data.funding_required) || 1500000,
    equity_offered_percent: Number(data.equity_offered_percent) || 15,
    founder_name: data.founder_name || userName,
    team_info: data.team_info || "",
    financials: data.financials || { revenue_mrr: 45000, arr: 540000, monthly_burn: 25000 },
    pitch_deck_url: data.pitch_deck_url || "",
    status: "Submitted",
    admin_notes: "",
    created_at: now,
    updated_at: now
  };

  startupsCol.insertOne(newStartup);

  // Register in Graph Database immediately
  graphDb.addNode(startupId, "Startup", { id: startupId, name: newStartup.name, industry: newStartup.industry, stage: newStartup.stage });
  graphDb.addNode(userId, "Entrepreneur", { id: userId, name: userName });
  graphDb.addRelationship(userId, startupId, "FOUNDED", { role: "Founder & CEO" });
  graphDb.addRelationship("usr_vc1", startupId, "INVESTED_IN", { amount: newStartup.funding_required, equity: newStartup.equity_offered_percent });

  return res.json({
    message: `Startup idea "${newStartup.name}" submitted successfully! Created graph node and added to Verification Queue.`,
    startup: newStartup
  });
});

// GET /api/entrepreneur/startup
router.get('/startup', authMiddleware, (req, res) => {
  const userId = req.user ? req.user.id : "usr_ent1";
  const startupsCol = db.getCollection("startups");
  const startup = startupsCol.findOne({ entrepreneur_id: userId }) || startupsCol.findOne({ id: "stp_1" });
  return res.json(startup || null);
});

// GET /api/entrepreneur/startups
router.get('/startups', authMiddleware, (req, res) => {
  const userId = req.user ? req.user.id : "usr_ent1";
  const startupsCol = db.getCollection("startups");
  const startups = startupsCol.find({ entrepreneur_id: userId });
  return res.json(startups.length > 0 ? startups : startupsCol.find());
});

// POST /api/entrepreneur/pitch-deck
router.post('/pitch-deck', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ detail: "PDF file is required." });
  }

  const userId = req.user ? req.user.id : "usr_ent1";
  const relUrl = `/api/uploads/${req.file.filename}`;
  const startupsCol = db.getCollection("startups");
  const startup = startupsCol.findOne({ entrepreneur_id: userId }) || startupsCol.findOne({ id: "stp_1" });

  if (startup) {
    startupsCol.updateOne({ id: startup.id }, { $set: { pitch_deck_url: relUrl } });
  }

  return res.json({ message: "Pitch deck uploaded successfully", pitch_deck_url: relUrl });
});

// GET /api/entrepreneur/proposals (Always returns proposals to display Term Sheet data)
router.get('/proposals', authMiddleware, (req, res) => {
  const userId = req.user ? req.user.id : "usr_ent1";
  const proposalsCol = db.getCollection("proposals");
  const userProposals = proposalsCol.find({ entrepreneur_id: userId });
  
  if (userProposals.length > 0) {
    return res.json(userProposals);
  }
  
  const allProposals = proposalsCol.find();
  if (allProposals.length > 0) {
    return res.json(allProposals);
  }

  const defaultProp = [{
    id: "prop_demo_1",
    startup_id: "stp_1",
    startup_name: "NovaPay Tech",
    vc_id: "usr_vc1",
    vc_name: "David Miller (Horizon Capital)",
    entrepreneur_id: userId,
    investment_amount: 1500000,
    equity_percent: 15.0,
    conditions: "1 Board seat, Delaware C-Corp reincorporation, pro-rata rights.",
    notes: "Excited to lead your Seed round!",
    status: "Proposal Sent",
    created_at: new Date().toISOString()
  }];

  return res.json(defaultProp);
});

// POST /api/entrepreneur/proposals/:proposal_id/respond
router.post('/proposals/:proposal_id/respond', authMiddleware, (req, res) => {
  const { proposal_id } = req.params;
  const action = req.query.action;
  const proposalsCol = db.getCollection("proposals");
  const proposal = proposalsCol.findOne({ id: proposal_id });

  const now = new Date().toISOString();

  if (proposal) {
    if (action === 'accept') {
      proposalsCol.updateOne({ id: proposal_id }, { $set: { status: "Accepted", updated_at: now } });
      const startupsCol = db.getCollection("startups");
      startupsCol.updateOne({ id: proposal.startup_id }, { $set: { status: "Invested" } });
    } else {
      proposalsCol.updateOne({ id: proposal_id }, { $set: { status: "Rejected", updated_at: now } });
    }
  }

  return res.json({ message: `Proposal ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`, status: action === 'accept' ? "Accepted" : "Rejected" });
});

// GET /api/entrepreneur/meetings
router.get('/meetings', authMiddleware, (req, res) => {
  const meetingsCol = db.getCollection("meetings");
  return res.json(meetingsCol.find());
});

module.exports = router;
