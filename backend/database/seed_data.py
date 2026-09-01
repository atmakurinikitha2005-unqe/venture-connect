import os
from database.mongo import db
from database.graph import graph_db
from utils.security import hash_password
from datetime import datetime

def seed_database():
    """Seeds realistic data for VentureConnect covering all PRD roles, startups, scorecards, proposals, due diligence, and graph relationships."""
    users_col = db.get_collection("users")
    startups_col = db.get_collection("startups")
    scorecards_col = db.get_collection("scorecards")
    dd_col = db.get_collection("due_diligence")
    meetings_col = db.get_collection("meetings")
    proposals_col = db.get_collection("proposals")
    portfolio_col = db.get_collection("portfolio")
    updates_col = db.get_collection("progress_updates")
    categories_col = db.get_collection("categories")

    # Clear existing
    users_col._data.clear()
    startups_col._data.clear()
    scorecards_col._data.clear()
    dd_col._data.clear()
    meetings_col._data.clear()
    proposals_col._data.clear()
    portfolio_col._data.clear()
    updates_col._data.clear()
    categories_col._data.clear()

    # --- 1. Categories ---
    categories = [
        {"id": "cat_1", "name": "FinTech", "description": "Financial Technology & Payment Solutions"},
        {"id": "cat_2", "name": "HealthTech", "description": "Healthcare, Medical AI & Digital Health"},
        {"id": "cat_3", "name": "CleanTech", "description": "Renewable Energy & Climate Solutions"},
        {"id": "cat_4", "name": "SaaS / B2B", "description": "Enterprise Software & Cloud Infra"},
        {"id": "cat_5", "name": "DeepTech / AI", "description": "Artificial Intelligence & Robotics"}
    ]
    for c in categories:
        categories_col.insert_one(c)

    # --- 2. Users ---
    admin_user = {
        "id": "usr_admin",
        "email": "admin@ventureconnect.com",
        "password": hash_password("admin123"),
        "name": "System Administrator",
        "role": "admin",
        "firm_or_company": "VentureConnect HQ",
        "bio": "Managing platform integrity, startup verification, and user authentication.",
        "is_verified": True,
        "is_active": True
    }
    
    ent_1 = {
        "id": "usr_ent1",
        "email": "sarah@novapay.io",
        "password": hash_password("password123"),
        "name": "Sarah Chen",
        "role": "entrepreneur",
        "firm_or_company": "NovaPay Inc.",
        "bio": "Ex-Stripe engineer building next-gen cross-border payments infrastructure.",
        "is_verified": True,
        "is_active": True
    }

    ent_2 = {
        "id": "usr_ent2",
        "email": "alex@healthpulse.ai",
        "password": hash_password("password123"),
        "name": "Dr. Alex Rivera",
        "role": "entrepreneur",
        "firm_or_company": "HealthPulse AI",
        "bio": "Stanford MD/PhD specializing in automated medical diagnostics.",
        "is_verified": True,
        "is_active": True
    }

    ent_3 = {
        "id": "usr_ent3",
        "email": "marcus@cleangrid.tech",
        "password": hash_password("password123"),
        "name": "Marcus Vance",
        "role": "entrepreneur",
        "firm_or_company": "CleanGrid Tech",
        "bio": "Clean energy pioneer scaling AI-driven smart grid storage.",
        "is_verified": True,
        "is_active": True
    }

    vc_1 = {
        "id": "usr_vc1",
        "email": "david@horizoncap.com",
        "password": hash_password("password123"),
        "name": "David Miller",
        "role": "vc",
        "firm_or_company": "Horizon Capital ($250M AUM)",
        "bio": "Managing Partner focused on FinTech and Enterprise SaaS investments.",
        "is_verified": True,
        "is_active": True
    }

    vc_2 = {
        "id": "usr_vc2",
        "email": "elena@apexvc.com",
        "password": hash_password("password123"),
        "name": "Elena Rostova",
        "role": "vc",
        "firm_or_company": "Apex Ventures ($180M AUM)",
        "bio": "Partner investing in HealthTech, DeepTech, and AI infrastructure.",
        "is_verified": True,
        "is_active": True
    }

    for u in [admin_user, ent_1, ent_2, ent_3, vc_1, vc_2]:
        users_col.insert_one(u)

    # --- 3. Startups ---
    startup_1 = {
        "id": "stp_1",
        "entrepreneur_id": "usr_ent1",
        "name": "NovaPay",
        "logo_url": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80",
        "industry": "FinTech",
        "stage": "Seed",
        "location": "San Francisco, CA",
        "description": "Unified cross-border payment API for high-growth emerging market marketplaces.",
        "problem": "Legacy payment gateways take 3-5 days and charge up to 6% in foreign exchange markup for cross-border transactions.",
        "solution": "Sub-second cross-border settlement engine reducing costs by 70% using liquidity pools.",
        "business_model": "0.45% transaction volume fee + $499 monthly enterprise API tier.",
        "target_market": "$1.2 Trillion global cross-border B2B ecommerce market.",
        "funding_required": 1500000.0,
        "equity_offered_percent": 15.0,
        "founder_name": "Sarah Chen",
        "team_info": "4 Full-time engineers ex-Stripe, PayPal & Plaid.",
        "financials": {
            "revenue_mrr": 42000.0,
            "arr": 504000.0,
            "monthly_burn": 28000.0,
            "previous_funding": 350000.0,
            "funding_required": 1500000.0,
            "equity_offered_percent": 15.0,
            "financial_projections_3yr": "Year 1: $1.8M ARR | Year 2: $6.2M ARR | Year 3: $18.5M ARR"
        },
        "pitch_deck_url": "/api/uploads/novapay_pitch_deck.pdf",
        "status": "Published",
        "admin_notes": "All financial documents & business registration verified by Admin.",
        "created_at": "2026-08-01T10:00:00Z",
        "updated_at": "2026-08-15T14:30:00Z"
    }

    startup_2 = {
        "id": "stp_2",
        "entrepreneur_id": "usr_ent2",
        "name": "HealthPulse AI",
        "logo_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80",
        "industry": "HealthTech",
        "stage": "Series A",
        "location": "Boston, MA",
        "description": "Real-time AI diagnostic copilot for radiologists reducing misdiagnosis by 40%.",
        "problem": "Radiologist shortage causes 48-hour delays in critical MRI & CT scan evaluations.",
        "solution": "FDA-cleared computer vision platform providing instant triage and anomaly heatmap highlights.",
        "business_model": "SaaS per hospital bed ($15k/year/hospital) + volume scan tier.",
        "target_market": "6,000+ US acute care hospitals and imaging centers.",
        "funding_required": 3000000.0,
        "equity_offered_percent": 12.0,
        "founder_name": "Dr. Alex Rivera",
        "team_info": "8 Team members: 3 Radiologist advisors, 4 ML PhDs.",
        "financials": {
            "revenue_mrr": 115000.0,
            "arr": 1380000.0,
            "monthly_burn": 65000.0,
            "previous_funding": 1200000.0,
            "funding_required": 3000000.0,
            "equity_offered_percent": 12.0,
            "financial_projections_3yr": "Year 1: $3.5M ARR | Year 2: $11.0M ARR | Year 3: $28.0M ARR"
        },
        "pitch_deck_url": "/api/uploads/healthpulse_pitch_deck.pdf",
        "status": "Published",
        "admin_notes": "FDA clearance documentation uploaded & verified.",
        "created_at": "2026-08-05T11:00:00Z",
        "updated_at": "2026-08-20T09:15:00Z"
    }

    startup_3 = {
        "id": "stp_3",
        "entrepreneur_id": "usr_ent3",
        "name": "CleanGrid Tech",
        "logo_url": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=150&auto=format&fit=crop&q=80",
        "industry": "CleanTech",
        "stage": "Seed",
        "location": "Austin, TX",
        "description": "Grid-scale battery optimization platform maximizing renewable energy arbitrage.",
        "problem": "Solar & wind power producers lose up to 25% energy potential due to grid curtailment.",
        "solution": "Autonomous battery dispatch software predicting grid congestion with 96% accuracy.",
        "business_model": "Gain-share revenue model (20% of extra energy arbitrage revenue generated).",
        "target_market": "Utility scale solar & energy storage operators in ERCOT & CAISO.",
        "funding_required": 2000000.0,
        "equity_offered_percent": 18.0,
        "founder_name": "Marcus Vance",
        "team_info": "5 CleanTech engineers ex-Tesla Energy & Enphase.",
        "financials": {
            "revenue_mrr": 25000.0,
            "arr": 300000.0,
            "monthly_burn": 20000.0,
            "previous_funding": 400000.0,
            "funding_required": 2000000.0,
            "equity_offered_percent": 18.0,
            "financial_projections_3yr": "Year 1: $1.2M ARR | Year 2: $4.8M ARR | Year 3: $14.0M ARR"
        },
        "pitch_deck_url": "/api/uploads/cleangrid_pitch_deck.pdf",
        "status": "Published",
        "admin_notes": "Energy utility pilot contracts validated.",
        "created_at": "2026-08-10T14:00:00Z",
        "updated_at": "2026-08-22T16:45:00Z"
    }

    startup_4 = {
        "id": "stp_4",
        "entrepreneur_id": "usr_ent1",
        "name": "CloudScale Systems",
        "logo_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80",
        "industry": "SaaS / B2B",
        "stage": "Pre-Seed",
        "location": "Seattle, WA",
        "description": "Zero-trust Kubernetes cost optimization engine.",
        "problem": "Cloud computing bills are growing 35% YoY with 40% idle infrastructure waste.",
        "solution": "Real-time automated pod rightsizing without cluster downtime.",
        "business_model": "15% of monthly AWS/GCP cost savings.",
        "target_market": "Mid-market software companies running Kubernetes.",
        "funding_required": 800000.0,
        "equity_offered_percent": 10.0,
        "founder_name": "Sarah Chen",
        "team_info": "2 Co-founders ex-AWS Elastic Container Service team.",
        "financials": {
            "revenue_mrr": 8000.0,
            "arr": 96000.0,
            "monthly_burn": 12000.0,
            "previous_funding": 100000.0,
            "funding_required": 800000.0,
            "equity_offered_percent": 10.0,
            "financial_projections_3yr": "Year 1: $500k ARR | Year 2: $2.2M ARR | Year 3: $7.5M ARR"
        },
        "pitch_deck_url": "",
        "status": "Submitted", # Under Admin Review
        "admin_notes": "Pending pitch deck upload review.",
        "created_at": "2026-08-24T09:00:00Z",
        "updated_at": "2026-08-24T09:00:00Z"
    }

    for s in [startup_1, startup_2, startup_3, startup_4]:
        startups_col.insert_one(s)

    # --- 4. VC Evaluation Scorecards ---
    scorecard_1 = {
        "id": "sc_1",
        "vc_id": "usr_vc1",
        "startup_id": "stp_1",
        "market_potential": {"rating": 9, "notes": "Huge addressable market in LatAm & SE Asia cross-border payments."},
        "business_model": {"rating": 8, "notes": "Strong take-rate economics with recurring API subscriptions."},
        "product": {"rating": 9, "notes": "Impressive sub-second latency benchmark."},
        "team": {"rating": 9, "notes": "Experienced founder with deep Stripe payments background."},
        "financials": {"rating": 7, "notes": "$42k MRR growing 20% MoM; burn rate is disciplined."},
        "competition": {"rating": 8, "notes": "Well differentiated against dLocal and Wise for B2B APIs."},
        "scalability": {"rating": 9, "notes": "High gross margin software platform with minimal marginal cost."},
        "overall_score": 8.43,
        "created_at": "2026-08-16T15:30:00Z"
    }

    scorecard_2 = {
        "id": "sc_2",
        "vc_id": "usr_vc2",
        "startup_id": "stp_2",
        "market_potential": {"rating": 9, "notes": "Acute hospital radiologist staffing crisis driving demand."},
        "business_model": {"rating": 9, "notes": "High retention SaaS model with $15k per bed annual contract value."},
        "product": {"rating": 10, "notes": "FDA clearance is a huge barrier to entry for competitors."},
        "team": {"rating": 9, "notes": "Stanford MD founder backed by stellar medical advisory board."},
        "financials": {"rating": 8, "notes": "$1.38M ARR with positive unit economics."},
        "competition": {"rating": 7, "notes": "Competes with Aidoc and Zebra Med, but unique CT heatmap tech."},
        "scalability": {"rating": 9, "notes": "Seamless hospital EHR integrations (Epic & Cerner)."},
        "overall_score": 8.71,
        "created_at": "2026-08-21T11:20:00Z"
    }

    for sc in [scorecard_1, scorecard_2]:
        scorecards_col.insert_one(sc)

    # --- 5. Due Diligence Workspace ---
    dd_items = [
        {"id": "dd_1", "category": "Business", "title": "Market Size & SAM Validation", "description": "Verify TAM/SAM calculations with third-party Gartner/IDC reports.", "is_completed": True, "notes": "Validated via Gartner 2026 Fintech Report.", "verified_by_vc_id": "usr_vc1"},
        {"id": "dd_2", "category": "Business", "title": "Customer Pipeline & Cohorts", "description": "Review top 10 customer contracts and churn rates.", "is_completed": True, "notes": "Zero churn in last 6 months.", "verified_by_vc_id": "usr_vc1"},
        {"id": "dd_3", "category": "Financial", "title": "Bank Statements & MRR Audit", "description": "Reconcile Stripe/Plaid bank statements with reported $42k MRR.", "is_completed": True, "notes": "MRR verified by audit team.", "verified_by_vc_id": "usr_vc1"},
        {"id": "dd_4", "category": "Financial", "title": "Cap Table & Option Pool Verification", "description": "Verify fully-diluted share distribution and unallocated option pool.", "is_completed": True, "notes": "Cap table clean, 10% ESOP option pool reserved.", "verified_by_vc_id": "usr_vc1"},
        {"id": "dd_5", "category": "Legal", "title": "Incorporation & Good Standing", "description": "Check Delaware C-Corp filing and tax compliance.", "is_completed": True, "notes": "Delaware Certificate of Good Standing received.", "verified_by_vc_id": "usr_vc1"},
        {"id": "dd_6", "category": "Legal", "title": "IP Assignment Agreements", "description": "Confirm all founders & contractors signed IP assignment docs.", "is_completed": True, "notes": "All code repository IP explicitly assigned to NovaPay Inc.", "verified_by_vc_id": "usr_vc1"},
        {"id": "dd_7", "category": "Legal", "title": "Regulatory & Licensing Compliance", "description": "Review FinCEN MSB registration and AML/KYC policies.", "is_completed": True, "notes": "MSB registration verified.", "verified_by_vc_id": "usr_vc1"},
        {"id": "dd_8", "category": "Team", "title": "Founder Reference Checks", "description": "Conduct 3 backchannel calls with previous managers/colleagues.", "is_completed": True, "notes": "Glowing references from former Stripe engineering VP.", "verified_by_vc_id": "usr_vc1"},
        {"id": "dd_9", "category": "Team", "title": "Background Checks", "description": "Run criminal & credit background checks for founders.", "is_completed": False, "notes": "Pending final background check report.", "verified_by_vc_id": ""},
        {"id": "dd_10", "category": "Financial", "title": "Tax Compliance & Audited Financials", "description": "Review CPA-reviewed financial statements for 2025.", "is_completed": False, "notes": "Scheduled for delivery by Friday.", "verified_by_vc_id": ""}
    ]
    
    dd_workspace = {
        "id": "dd_ws_novapay",
        "startup_id": "stp_1",
        "vc_id": "usr_vc1",
        "items": dd_items,
        "total_checks": 10,
        "completed_checks": 8,
        "completion_percentage": 80.0
    }
    dd_col.insert_one(dd_workspace)

    # --- 6. Meetings ---
    meeting_1 = {
        "id": "mtg_1",
        "startup_id": "stp_1",
        "startup_name": "NovaPay",
        "vc_id": "usr_vc1",
        "vc_name": "David Miller (Horizon Capital)",
        "entrepreneur_id": "usr_ent1",
        "date": "2026-08-28",
        "time": "14:00",
        "purpose": "Term Sheet & Partner Investment Committee Presentation",
        "message": "We would like to invite Sarah to present NovaPay to our full investment committee for final term sheet approval.",
        "status": "Accepted",
        "created_at": "2026-08-20T10:00:00Z"
    }
    meetings_col.insert_one(meeting_1)

    # --- 7. Investment Proposals & Negotiation ---
    proposal_1 = {
        "id": "prop_1",
        "startup_id": "stp_1",
        "startup_name": "NovaPay",
        "vc_id": "usr_vc1",
        "vc_name": "David Miller (Horizon Capital)",
        "entrepreneur_id": "usr_ent1",
        "investment_amount": 1500000.0,
        "equity_percent": 15.0,
        "conditions": "1 Board seat for Horizon Capital, 1:1 pro-rata rights in subsequent rounds, 1-year cliff with 4-year vesting for founders.",
        "notes": "We are excited to lead your Seed round!",
        "status": "Counter Offer",
        "counter_offers": [
            {
                "sender_role": "vc",
                "sender_id": "usr_vc1",
                "sender_name": "David Miller",
                "investment_amount": 1500000.0,
                "equity_percent": 15.0,
                "conditions": "1 Board seat, pro-rata rights, 1-year cliff vesting.",
                "notes": "Initial term sheet proposal.",
                "timestamp": "2026-08-22T09:30:00Z"
            },
            {
                "sender_role": "entrepreneur",
                "sender_id": "usr_ent1",
                "sender_name": "Sarah Chen",
                "investment_amount": 1500000.0,
                "equity_percent": 12.5,
                "conditions": "1 Board observer seat (upgrading to full director at Series A), pro-rata rights retained.",
                "notes": "Given our strong MoM MRR growth, we propose 12.5% equity for the $1.5M investment.",
                "timestamp": "2026-08-23T14:15:00Z"
            }
        ],
        "created_at": "2026-08-22T09:30:00Z",
        "updated_at": "2026-08-23T14:15:00Z"
    }
    proposals_col.insert_one(proposal_1)

    # --- 8. Portfolio & Progress Updates ---
    portfolio_1 = {
        "id": "port_1",
        "vc_id": "usr_vc2",
        "startup_id": "stp_2",
        "startup_name": "HealthPulse AI",
        "investment_amount": 1200000.0,
        "equity_percent": 10.0,
        "investment_date": "2026-03-15",
        "stage_at_investment": "Seed",
        "current_status": "Active Portfolio Company"
    }
    portfolio_col.insert_one(portfolio_1)

    update_1 = {
        "id": "upd_1",
        "startup_id": "stp_2",
        "startup_name": "HealthPulse AI",
        "title": "Q2 2026 Progress Update - Hospital Deployments & Revenue Milestone",
        "period": "Q2 2026",
        "revenue": 115000.0,
        "customers_count": 14,
        "employees_count": 8,
        "milestones_achieved": "Secured 4 new hospital deployment contracts (Mass General & Beth Israel); achieved $115k MRR.",
        "product_progress": "Released v2.4 diagnostic heatmap pipeline with 99.1% sensitivity for acute brain hemorrhages.",
        "new_funding": 0.0,
        "business_notes": "On track to hit $1.5M ARR ahead of schedule.",
        "created_at": "2026-07-15T10:00:00Z"
    }
    updates_col.insert_one(update_1)

    # --- 9. Graph Database Seed (Nodes & Edges for Cypher Queries) ---
    graph_db.add_node("usr_vc1", "VC", {"id": "usr_vc1", "name": "David Miller", "firm": "Horizon Capital"})
    graph_db.add_node("usr_vc2", "VC", {"id": "usr_vc2", "name": "Elena Rostova", "firm": "Apex Ventures"})
    graph_db.add_node("usr_vc3", "VC", {"id": "usr_vc3", "name": "Michael Chang", "firm": "Sequoia Next"})

    graph_db.add_node("stp_1", "Startup", {"id": "stp_1", "name": "NovaPay", "industry": "FinTech", "stage": "Seed"})
    graph_db.add_node("stp_2", "Startup", {"id": "stp_2", "name": "HealthPulse AI", "industry": "HealthTech", "stage": "Series A"})
    graph_db.add_node("stp_3", "Startup", {"id": "stp_3", "name": "CleanGrid Tech", "industry": "CleanTech", "stage": "Seed"})

    graph_db.add_node("usr_ent1", "Entrepreneur", {"id": "usr_ent1", "name": "Sarah Chen"})
    graph_db.add_node("usr_ent2", "Entrepreneur", {"id": "usr_ent2", "name": "Dr. Alex Rivera"})

    # Graph Relationships
    graph_db.add_relationship("usr_vc1", "stp_1", "INVESTED_IN", {"amount": 1500000, "equity": 15.0, "round": "Seed"})
    graph_db.add_relationship("usr_vc2", "stp_2", "INVESTED_IN", {"amount": 1200000, "equity": 10.0, "round": "Seed"})
    graph_db.add_relationship("usr_vc3", "stp_1", "CO_INVESTED_WITH", {"syndicate": "NovaPay Seed Round"})
    graph_db.add_relationship("usr_vc1", "usr_vc3", "CO_INVESTED_WITH", {"year": 2026})

    graph_db.add_relationship("usr_vc1", "stp_1", "EVALUATED", {"score": 8.43})
    graph_db.add_relationship("usr_vc2", "stp_2", "EVALUATED", {"score": 8.71})

    graph_db.add_relationship("usr_ent1", "stp_1", "FOUNDED", {"role": "CEO & Founder"})
    graph_db.add_relationship("usr_ent2", "stp_2", "FOUNDED", {"role": "Founder & MD"})

    print("[SEED DATA] VentureConnect seed data successfully populated into Mongo & Graph stores!")

if __name__ == "__main__":
    seed_database()
