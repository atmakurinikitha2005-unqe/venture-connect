const express = require('express');
const db = require('../database/mongo');
const { requireRole } = require('../utils/security');

const router = express.Router();

// GET /api/admin/dashboard
router.get('/dashboard', requireRole(['admin']), (req, res) => {
  const usersCol = db.getCollection("users");
  const startupsCol = db.getCollection("startups");
  const proposalsCol = db.getCollection("proposals");

  const users = usersCol.find();
  const totalUsers = users.length;
  const entrepreneursCount = users.filter(u => u.role === 'entrepreneur').length;
  const vcsCount = users.filter(u => u.role === 'vc').length;

  const startups = startupsCol.find();
  const totalStartups = startups.length;
  const pendingStartups = startups.filter(s => ['Submitted', 'Under Review', 'Correction Required'].includes(s.status)).length;
  const approvedStartups = startups.filter(s => ['Approved', 'Published', 'Shortlisted', 'Under Due Diligence', 'Invested'].includes(s.status)).length;

  const proposals = proposalsCol.find();
  const totalInvestmentsCount = proposals.filter(p => ['Invested', 'Completed'].includes(p.status)).length;
  const totalCapitalInvested = proposals
    .filter(p => ['Invested', 'Completed'].includes(p.status))
    .reduce((sum, p) => sum + (p.investment_amount || 0), 0);

  return res.json({
    total_users: totalUsers,
    entrepreneurs_count: entrepreneursCount,
    vcs_count: vcsCount,
    total_startups: totalStartups,
    pending_startups: pendingStartups,
    approved_startups: approvedStartups,
    total_investments_count: totalInvestmentsCount,
    total_capital_invested: totalCapitalInvested,
    complaints_count: 0
  });
});

// GET /api/admin/users
router.get('/users', requireRole(['admin']), (req, res) => {
  const usersCol = db.getCollection("users");
  const users = usersCol.find();
  return res.json(users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    firm_or_company: u.firm_or_company || "",
    bio: u.bio || "",
    is_verified: u.is_verified !== false,
    is_active: u.is_active !== false
  })));
});

// POST /api/admin/users/:user_id/status
router.post('/users/:user_id/status', requireRole(['admin']), (req, res) => {
  const { user_id } = req.params;
  const isActive = req.query.is_active === 'true';

  const usersCol = db.getCollection("users");
  const user = usersCol.findOne({ id: user_id });
  if (!user) {
    return res.status(404).json({ detail: "User not found." });
  }

  usersCol.updateOne({ id: user_id }, { $set: { is_active: isActive } });
  return res.json({ message: `User status updated to ${isActive ? 'active' : 'suspended'}` });
});

// GET /api/admin/startups/pending
router.get('/startups/pending', requireRole(['admin']), (req, res) => {
  const startupsCol = db.getCollection("startups");
  const startups = startupsCol.find();
  const pending = startups.filter(s => ['Submitted', 'Under Review', 'Correction Required', 'Draft'].includes(s.status));
  return res.json(pending);
});

// POST /api/admin/startups/:startup_id/verify
router.post('/startups/:startup_id/verify', requireRole(['admin']), (req, res) => {
  const { startup_id } = req.params;
  const action = req.query.action;
  const notes = req.query.notes || "";

  const startupsCol = db.getCollection("startups");
  const startup = startupsCol.findOne({ id: startup_id });
  if (!startup) {
    return res.status(404).json({ detail: "Startup not found." });
  }

  const statusMap = {
    approve: "Published",
    reject: "Rejected",
    request_correction: "Correction Required"
  };

  if (!statusMap[action]) {
    return res.status(400).json({ detail: "Invalid action. Must be 'approve', 'reject', or 'request_correction'." });
  }

  const newStatus = statusMap[action];
  startupsCol.updateOne(
    { id: startup_id },
    { $set: { status: newStatus, admin_notes: notes } }
  );

  return res.json({ message: `Startup status updated to ${newStatus}`, status: newStatus });
});

// GET /api/admin/categories
router.get('/categories', (req, res) => {
  const categoriesCol = db.getCollection("categories");
  return res.json(categoriesCol.find());
});

module.exports = router;
