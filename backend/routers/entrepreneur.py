import os
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, status
from typing import List, Optional
from database.mongo import db
from models.schemas import StartupCreate, StartupResponse, ProgressUpdateCreate, ProgressUpdateResponse, ProposalResponse, MeetingResponse
from utils.security import require_role
from config import settings

router = APIRouter(prefix="/api/entrepreneur", tags=["Entrepreneur Module"])

@router.post("/startup", response_model=StartupResponse)
def create_startup(data: StartupCreate, current_user: dict = Depends(require_role(["entrepreneur"]))):
    startups_col = db.get_collection("startups")
    now = datetime.utcnow().isoformat() + "Z"
    
    startup_id = f"stp_{uuid.uuid4().hex[:8]}"
    new_startup = {
        "id": startup_id,
        "entrepreneur_id": current_user["id"],
        "name": data.name,
        "logo_url": data.logo_url or "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80",
        "industry": data.industry,
        "stage": data.stage,
        "location": data.location,
        "description": data.description,
        "problem": data.problem,
        "solution": data.solution,
        "business_model": data.business_model,
        "target_market": data.target_market,
        "funding_required": data.funding_required,
        "equity_offered_percent": data.equity_offered_percent,
        "founder_name": data.founder_name or current_user["name"],
        "team_info": data.team_info,
        "financials": data.financials.dict(),
        "pitch_deck_url": data.pitch_deck_url or "",
        "status": "Submitted", # Submitted -> Awaiting Admin verification
        "admin_notes": "",
        "created_at": now,
        "updated_at": now
    }
    startups_col.insert_one(new_startup)
    return StartupResponse(**new_startup)

@router.get("/startup", response_model=Optional[StartupResponse])
def get_my_startup(current_user: dict = Depends(require_role(["entrepreneur"]))):
    startups_col = db.get_collection("startups")
    startup = startups_col.find_one({"entrepreneur_id": current_user["id"]})
    if not startup:
        return None
    return StartupResponse(**startup)

@router.get("/startups", response_model=List[StartupResponse])
def get_all_my_startups(current_user: dict = Depends(require_role(["entrepreneur"]))):
    startups_col = db.get_collection("startups")
    startups = startups_col.find({"entrepreneur_id": current_user["id"]})
    return [StartupResponse(**s) for s in startups]

@router.post("/pitch-deck")
async def upload_pitch_deck(file: UploadFile = File(...), current_user: dict = Depends(require_role(["entrepreneur"]))):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed for pitch deck upload.")

    filename = f"{current_user['id']}_{uuid.uuid4().hex[:6]}_{file.filename}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    rel_url = f"/api/uploads/{filename}"

    startups_col = db.get_collection("startups")
    startup = startups_col.find_one({"entrepreneur_id": current_user["id"]})
    if startup:
        startups_col.update_one({"id": startup["id"]}, {"$set": {"pitch_deck_url": rel_url}})

    return {"message": "Pitch deck uploaded successfully", "pitch_deck_url": rel_url}

@router.get("/proposals", response_model=List[ProposalResponse])
def get_my_proposals(current_user: dict = Depends(require_role(["entrepreneur"]))):
    proposals_col = db.get_collection("proposals")
    proposals = proposals_col.find({"entrepreneur_id": current_user["id"]})
    return [ProposalResponse(**p) for p in proposals]

@router.post("/proposals/{proposal_id}/respond")
def respond_to_proposal(
    proposal_id: str,
    action: str, # 'accept', 'reject', 'counter'
    counter_amount: Optional[float] = None,
    counter_equity: Optional[float] = None,
    conditions: Optional[str] = None,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_role(["entrepreneur"]))
):
    proposals_col = db.get_collection("proposals")
    proposal = proposals_col.find_one({"id": proposal_id, "entrepreneur_id": current_user["id"]})
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    now = datetime.utcnow().isoformat() + "Z"

    if action == "accept":
        proposals_col.update_one({"id": proposal_id}, {"$set": {"status": "Accepted", "updated_at": now}})
        startups_col = db.get_collection("startups")
        startups_col.update_one({"id": proposal["startup_id"]}, {"$set": {"status": "Invested"}})
        return {"message": "Proposal accepted! Startup moved to Invested status.", "status": "Accepted"}

    elif action == "reject":
        proposals_col.update_one({"id": proposal_id}, {"$set": {"status": "Rejected", "updated_at": now}})
        return {"message": "Proposal rejected.", "status": "Rejected"}

    elif action == "counter":
        if not counter_amount or not counter_equity:
            raise HTTPException(status_code=400, detail="Counter amount and equity % required for counter offer.")

        counter_entry = {
            "sender_role": "entrepreneur",
            "sender_id": current_user["id"],
            "sender_name": current_user["name"],
            "investment_amount": counter_amount,
            "equity_percent": counter_equity,
            "conditions": conditions or proposal.get("conditions", ""),
            "notes": notes or "",
            "timestamp": now
        }
        proposals_col.update_one(
            {"id": proposal_id},
            {
                "$set": {
                    "status": "Counter Offer",
                    "investment_amount": counter_amount,
                    "equity_percent": counter_equity,
                    "updated_at": now
                },
                "$push": {"counter_offers": counter_entry}
            }
        )
        return {"message": "Counter offer submitted successfully.", "status": "Counter Offer"}

    else:
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'accept', 'reject', or 'counter'.")

@router.get("/meetings", response_model=List[MeetingResponse])
def get_my_meetings(current_user: dict = Depends(require_role(["entrepreneur"]))):
    meetings_col = db.get_collection("meetings")
    meetings = meetings_col.find({"entrepreneur_id": current_user["id"]})
    return [MeetingResponse(**m) for m in meetings]

@router.post("/progress-update", response_model=ProgressUpdateResponse)
def post_progress_update(data: ProgressUpdateCreate, current_user: dict = Depends(require_role(["entrepreneur"]))):
    startups_col = db.get_collection("startups")
    startup = startups_col.find_one({"id": data.startup_id, "entrepreneur_id": current_user["id"]})
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found or unauthorized.")

    updates_col = db.get_collection("progress_updates")
    now = datetime.utcnow().isoformat() + "Z"
    
    update_id = f"upd_{uuid.uuid4().hex[:8]}"
    new_update = {
        "id": update_id,
        "startup_id": data.startup_id,
        "startup_name": startup["name"],
        "title": data.title,
        "period": data.period,
        "revenue": data.revenue,
        "customers_count": data.customers_count,
        "employees_count": data.employees_count,
        "milestones_achieved": data.milestones_achieved,
        "product_progress": data.product_progress,
        "new_funding": data.new_funding,
        "business_notes": data.business_notes,
        "created_at": now
    }
    updates_col.insert_one(new_update)
    return ProgressUpdateResponse(**new_update)
