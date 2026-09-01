import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from database.mongo import db
from models.schemas import (
    StartupResponse, ScorecardCreate, ScorecardResponse, CompareRequest,
    DueDiligenceWorkspace, DueDiligenceUpdateItem, MeetingCreate, MeetingResponse,
    ProposalCreate, ProposalResponse, PortfolioItem, ProgressUpdateResponse
)
from utils.security import require_role

router = APIRouter(prefix="/api/vc", tags=["Venture Capitalist Module"])

@router.get("/dashboard")
def get_vc_dashboard(current_user: dict = Depends(require_role(["vc"]))):
    startups_col = db.get_collection("startups")
    scorecards_col = db.get_collection("scorecards")
    meetings_col = db.get_collection("meetings")
    proposals_col = db.get_collection("proposals")
    portfolio_col = db.get_collection("portfolio")

    total_startups = startups_col.count_documents({"status": "Published"})
    vc_scorecards = scorecards_col.find({"vc_id": current_user["id"]})
    shortlisted_count = len(vc_scorecards)
    
    vc_meetings = meetings_col.find({"vc_id": current_user["id"]})
    active_meetings_count = len([m for m in vc_meetings if m.get("status") in ["Requested", "Accepted", "Rescheduled"]])

    portfolio_items = portfolio_col.find({"vc_id": current_user["id"]})
    active_investments_count = len(portfolio_items)
    total_invested_capital = sum([p.get("investment_amount", 0) for p in portfolio_items])

    return {
        "total_discoverable_startups": total_startups,
        "evaluated_shortlisted_count": shortlisted_count,
        "active_meetings_count": active_meetings_count,
        "active_investments_count": active_investments_count,
        "total_capital_invested": total_invested_capital
    }

@router.get("/discover", response_model=List[StartupResponse])
def discover_startups(
    query: Optional[str] = None,
    industry: Optional[str] = None,
    stage: Optional[str] = None,
    max_funding: Optional[float] = None,
    location: Optional[str] = None,
    current_user: dict = Depends(require_role(["vc"]))
):
    startups_col = db.get_collection("startups")
    all_published = startups_col.find({"status": {"$in": ["Published", "Approved", "Shortlisted", "Under Due Diligence", "Meeting Scheduled", "Investment Proposed", "Negotiation", "Invested"]}})

    results = []
    for s in all_published:
        if query and query.lower() not in s["name"].lower() and query.lower() not in s["description"].lower():
            continue
        if industry and industry.lower() != "all" and s["industry"].lower() != industry.lower():
            continue
        if stage and stage.lower() != "all" and s["stage"].lower() != stage.lower():
            continue
        if max_funding and s["funding_required"] > max_funding:
            continue
        if location and location.lower() not in s["location"].lower():
            continue
        results.append(StartupResponse(**s))

    return results

@router.get("/startups/{startup_id}", response_model=StartupResponse)
def get_startup_details(startup_id: str, current_user: dict = Depends(require_role(["vc"]))):
    startups_col = db.get_collection("startups")
    startup = startups_col.find_one({"id": startup_id})
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found.")
    return StartupResponse(**startup)

# --- VC Scorecard ---
@router.post("/scorecard", response_model=ScorecardResponse)
def create_or_update_scorecard(sc: ScorecardCreate, current_user: dict = Depends(require_role(["vc"]))):
    scorecards_col = db.get_collection("scorecards")
    existing = scorecards_col.find_one({"vc_id": current_user["id"], "startup_id": sc.startup_id})

    # Calculate average score (1.0 to 10.0)
    ratings = [
        sc.market_potential.rating,
        sc.business_model.rating,
        sc.product.rating,
        sc.team.rating,
        sc.financials.rating,
        sc.competition.rating,
        sc.scalability.rating
    ]
    overall_score = round(sum(ratings) / len(ratings), 2)
    now = datetime.utcnow().isoformat() + "Z"

    scorecard_data = {
        "vc_id": current_user["id"],
        "startup_id": sc.startup_id,
        "market_potential": sc.market_potential.dict(),
        "business_model": sc.business_model.dict(),
        "product": sc.product.dict(),
        "team": sc.team.dict(),
        "financials": sc.financials.dict(),
        "competition": sc.competition.dict(),
        "scalability": sc.scalability.dict(),
        "overall_score": overall_score,
        "created_at": now
    }

    if existing:
        scorecards_col.update_one({"id": existing["id"]}, {"$set": scorecard_data})
        scorecard_data["id"] = existing["id"]
    else:
        scorecard_data["id"] = f"sc_{uuid.uuid4().hex[:8]}"
        scorecards_col.insert_one(scorecard_data)

    return ScorecardResponse(**scorecard_data)

@router.get("/scorecard/{startup_id}", response_model=Optional[ScorecardResponse])
def get_scorecard(startup_id: str, current_user: dict = Depends(require_role(["vc"]))):
    scorecards_col = db.get_collection("scorecards")
    sc = scorecards_col.find_one({"vc_id": current_user["id"], "startup_id": startup_id})
    if not sc:
        return None
    return ScorecardResponse(**sc)

# --- Startup Comparison ---
@router.post("/compare")
def compare_startups(req: CompareRequest, current_user: dict = Depends(require_role(["vc"]))):
    if len(req.startup_ids) < 2 or len(req.startup_ids) > 4:
        raise HTTPException(status_code=400, detail="Please select between 2 and 4 startups to compare.")

    startups_col = db.get_collection("startups")
    scorecards_col = db.get_collection("scorecards")

    comparison = []
    for st_id in req.startup_ids:
        startup = startups_col.find_one({"id": st_id})
        if startup:
            sc = scorecards_col.find_one({"vc_id": current_user["id"], "startup_id": st_id})
            comparison.append({
                "startup": StartupResponse(**startup),
                "scorecard": ScorecardResponse(**sc) if sc else None
            })

    return {"compared_count": len(comparison), "items": comparison}

# --- Investment Pipeline ---
@router.get("/pipeline")
def get_investment_pipeline(current_user: dict = Depends(require_role(["vc"]))):
    startups_col = db.get_collection("startups")
    scorecards_col = db.get_collection("scorecards")
    proposals_col = db.get_collection("proposals")
    
    startups = startups_col.find({"status": {"$in": ["Published", "Approved", "Shortlisted", "Under Due Diligence", "Meeting Scheduled", "Investment Proposed", "Negotiation", "Invested"]}})
    
    pipeline = {
        "New": [],
        "Review": [],
        "Shortlisted": [],
        "Due Diligence": [],
        "Meeting": [],
        "Proposal": [],
        "Negotiation": [],
        "Invested": []
    }
    
    for s in startups:
        st_id = s["id"]
        sc = scorecards_col.find_one({"vc_id": current_user["id"], "startup_id": st_id})
        status_val = s.get("status", "Published")
        
        item = {
            "startup_id": st_id,
            "name": s["name"],
            "logo_url": s.get("logo_url", ""),
            "industry": s["industry"],
            "funding_required": s["funding_required"],
            "equity_offered_percent": s["equity_offered_percent"],
            "overall_score": sc.get("overall_score") if sc else None,
            "status": status_val
        }

        if status_val in ["Published", "Approved"]:
            pipeline["New"].append(item)
        elif status_val == "Shortlisted":
            pipeline["Shortlisted"].append(item)
        elif status_val == "Under Due Diligence":
            pipeline["Due Diligence"].append(item)
        elif status_val == "Meeting Scheduled":
            pipeline["Meeting"].append(item)
        elif status_val == "Investment Proposed":
            pipeline["Proposal"].append(item)
        elif status_val == "Negotiation":
            pipeline["Negotiation"].append(item)
        elif status_val == "Invested":
            pipeline["Invested"].append(item)
        else:
            pipeline["Review"].append(item)

    return pipeline

@router.post("/pipeline/{startup_id}/stage")
def update_pipeline_stage(startup_id: str, new_stage: str, current_user: dict = Depends(require_role(["vc"]))):
    startups_col = db.get_collection("startups")
    stage_to_status = {
        "New": "Published",
        "Shortlisted": "Shortlisted",
        "Due Diligence": "Under Due Diligence",
        "Meeting": "Meeting Scheduled",
        "Proposal": "Investment Proposed",
        "Negotiation": "Negotiation",
        "Invested": "Invested"
    }
    if new_stage not in stage_to_status:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Allowed: {list(stage_to_status.keys())}")
    
    status_val = stage_to_status[new_stage]
    startups_col.update_one({"id": startup_id}, {"$set": {"status": status_val}})
    return {"message": f"Startup pipeline stage updated to {new_stage}", "status": status_val}

# --- Due Diligence Workspace ---
@router.get("/due-diligence/{startup_id}", response_model=DueDiligenceWorkspace)
def get_due_diligence(startup_id: str, current_user: dict = Depends(require_role(["vc"]))):
    dd_col = db.get_collection("due_diligence")
    ws = dd_col.find_one({"startup_id": startup_id, "vc_id": current_user["id"]})
    
    if not ws:
        # Generate default checklist for startup
        default_items = [
            {"id": "dd_1", "category": "Business", "title": "Market Size & Addressable Market Validation", "description": "Verify TAM/SAM calculations.", "is_completed": False, "notes": "", "verified_by_vc_id": ""},
            {"id": "dd_2", "category": "Business", "title": "Customer Pipeline & Retention Review", "description": "Audit churn rate and top customer contracts.", "is_completed": False, "notes": "", "verified_by_vc_id": ""},
            {"id": "dd_3", "category": "Financial", "title": "MRR & Bank Statement Audit", "description": "Reconcile reported revenue with bank statements.", "is_completed": False, "notes": "", "verified_by_vc_id": ""},
            {"id": "dd_4", "category": "Financial", "title": "Cap Table & Share Distribution", "description": "Verify equity split and unallocated option pool.", "is_completed": False, "notes": "", "verified_by_vc_id": ""},
            {"id": "dd_5", "category": "Legal", "title": "Incorporation & Good Standing", "description": "Check Delaware filing and tax filings.", "is_completed": False, "notes": "", "verified_by_vc_id": ""},
            {"id": "dd_6", "category": "Legal", "title": "IP Assignment Validation", "description": "Confirm all code & patents are assigned to company.", "is_completed": False, "notes": "", "verified_by_vc_id": ""},
            {"id": "dd_7", "category": "Team", "title": "Founder Backchannel References", "description": "Conduct 3 reference calls on founders.", "is_completed": False, "notes": "", "verified_by_vc_id": ""},
            {"id": "dd_8", "category": "Team", "title": "Background & Education Verification", "description": "Verify degrees and previous executive roles.", "is_completed": False, "notes": "", "verified_by_vc_id": ""}
        ]
        ws = {
            "id": f"dd_ws_{uuid.uuid4().hex[:8]}",
            "startup_id": startup_id,
            "vc_id": current_user["id"],
            "items": default_items,
            "total_checks": len(default_items),
            "completed_checks": 0,
            "completion_percentage": 0.0
        }
        dd_col.insert_one(ws)

    return DueDiligenceWorkspace(**ws)

@router.post("/due-diligence/{startup_id}/item", response_model=DueDiligenceWorkspace)
def update_due_diligence_item(startup_id: str, update: DueDiligenceUpdateItem, current_user: dict = Depends(require_role(["vc"]))):
    dd_col = db.get_collection("due_diligence")
    ws = dd_col.find_one({"startup_id": startup_id, "vc_id": current_user["id"]})
    if not ws:
        raise HTTPException(status_code=404, detail="Due diligence workspace not found.")

    items = ws["items"]
    updated = False
    for item in items:
        if item["id"] == update.item_id:
            item["is_completed"] = update.is_completed
            if update.notes is not None:
                item["notes"] = update.notes
            item["verified_by_vc_id"] = current_user["id"] if update.is_completed else ""
            updated = True
            break

    if not updated:
        raise HTTPException(status_code=404, detail="Item ID not found in workspace.")

    completed_cnt = len([i for i in items if i["is_completed"]])
    total_cnt = len(items)
    pct = round((completed_cnt / total_cnt) * 100.0, 1) if total_cnt > 0 else 0.0

    ws["items"] = items
    ws["completed_checks"] = completed_cnt
    ws["completion_percentage"] = pct

    dd_col.update_one({"id": ws["id"]}, {"$set": ws})
    return DueDiligenceWorkspace(**ws)

# --- Meetings ---
@router.post("/meetings", response_model=MeetingResponse)
def request_meeting(data: MeetingCreate, current_user: dict = Depends(require_role(["vc"]))):
    startups_col = db.get_collection("startups")
    startup = startups_col.find_one({"id": data.startup_id})
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found.")

    meetings_col = db.get_collection("meetings")
    now = datetime.utcnow().isoformat() + "Z"
    mtg_id = f"mtg_{uuid.uuid4().hex[:8]}"

    new_meeting = {
        "id": mtg_id,
        "startup_id": startup["id"],
        "startup_name": startup["name"],
        "vc_id": current_user["id"],
        "vc_name": current_user["name"],
        "entrepreneur_id": startup["entrepreneur_id"],
        "date": data.date,
        "time": data.time,
        "purpose": data.purpose,
        "message": data.message or "",
        "status": "Requested",
        "created_at": now
    }
    meetings_col.insert_one(new_meeting)

    # Update startup status to Meeting Scheduled
    startups_col.update_one({"id": startup["id"]}, {"$set": {"status": "Meeting Scheduled"}})

    return MeetingResponse(**new_meeting)

@router.get("/meetings", response_model=List[MeetingResponse])
def get_vc_meetings(current_user: dict = Depends(require_role(["vc"]))):
    meetings_col = db.get_collection("meetings")
    meetings = meetings_col.find({"vc_id": current_user["id"]})
    return [MeetingResponse(**m) for m in meetings]

# --- Proposals ---
@router.post("/proposals", response_model=ProposalResponse)
def create_proposal(data: ProposalCreate, current_user: dict = Depends(require_role(["vc"]))):
    startups_col = db.get_collection("startups")
    startup = startups_col.find_one({"id": data.startup_id})
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found.")

    proposals_col = db.get_collection("proposals")
    now = datetime.utcnow().isoformat() + "Z"
    prop_id = f"prop_{uuid.uuid4().hex[:8]}"

    initial_counter = {
        "sender_role": "vc",
        "sender_id": current_user["id"],
        "sender_name": current_user["name"],
        "investment_amount": data.investment_amount,
        "equity_percent": data.equity_percent,
        "conditions": data.conditions,
        "notes": data.notes or "",
        "timestamp": now
    }

    new_proposal = {
        "id": prop_id,
        "startup_id": startup["id"],
        "startup_name": startup["name"],
        "vc_id": current_user["id"],
        "vc_name": current_user["name"],
        "entrepreneur_id": startup["entrepreneur_id"],
        "investment_amount": data.investment_amount,
        "equity_percent": data.equity_percent,
        "conditions": data.conditions,
        "notes": data.notes or "",
        "status": "Proposal Sent",
        "counter_offers": [initial_counter],
        "created_at": now,
        "updated_at": now
    }
    proposals_col.insert_one(new_proposal)

    # Update startup status
    startups_col.update_one({"id": startup["id"]}, {"$set": {"status": "Investment Proposed"}})

    return ProposalResponse(**new_proposal)

@router.get("/proposals", response_model=List[ProposalResponse])
def get_vc_proposals(current_user: dict = Depends(require_role(["vc"]))):
    proposals_col = db.get_collection("proposals")
    proposals = proposals_col.find({"vc_id": current_user["id"]})
    return [ProposalResponse(**p) for p in proposals]

@router.post("/proposals/{proposal_id}/record-investment")
def record_investment(proposal_id: str, current_user: dict = Depends(require_role(["vc"]))):
    proposals_col = db.get_collection("proposals")
    proposal = proposals_col.find_one({"id": proposal_id, "vc_id": current_user["id"]})
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    now_date = datetime.utcnow().strftime("%Y-%m-%d")
    proposals_col.update_one({"id": proposal_id}, {"$set": {"status": "Invested"}})

    startups_col = db.get_collection("startups")
    startup = startups_col.find_one({"id": proposal["startup_id"]})
    if startup:
        startups_col.update_one({"id": startup["id"]}, {"$set": {"status": "Invested"}})

    # Record in Portfolio
    portfolio_col = db.get_collection("portfolio")
    existing = portfolio_col.find_one({"vc_id": current_user["id"], "startup_id": proposal["startup_id"]})
    if not existing:
        port_item = {
            "id": f"port_{uuid.uuid4().hex[:8]}",
            "vc_id": current_user["id"],
            "startup_id": proposal["startup_id"],
            "startup_name": proposal["startup_name"],
            "investment_amount": proposal["investment_amount"],
            "equity_percent": proposal["equity_percent"],
            "investment_date": now_date,
            "stage_at_investment": startup.get("stage", "Seed") if startup else "Seed",
            "current_status": "Active Portfolio Company"
        }
        portfolio_col.insert_one(port_item)

    return {"message": "Investment recorded successfully in VC portfolio!", "status": "Invested"}

# --- Portfolio & Progress Updates ---
@router.get("/portfolio", response_model=List[PortfolioItem])
def get_portfolio(current_user: dict = Depends(require_role(["vc"]))):
    portfolio_col = db.get_collection("portfolio")
    items = portfolio_col.find({"vc_id": current_user["id"]})
    return [PortfolioItem(**p) for p in items]

@router.get("/portfolio/{startup_id}/updates", response_model=List[ProgressUpdateResponse])
def get_portfolio_startup_updates(startup_id: str, current_user: dict = Depends(require_role(["vc"]))):
    updates_col = db.get_collection("progress_updates")
    updates = updates_col.find({"startup_id": startup_id})
    return [ProgressUpdateResponse(**u) for u in updates]
