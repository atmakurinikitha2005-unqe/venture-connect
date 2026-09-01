from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from database.mongo import db
from models.schemas import StartupResponse, UserResponse
from utils.security import require_role

router = APIRouter(prefix="/api/admin", tags=["Admin Module"])

@router.get("/dashboard")
def get_admin_dashboard_stats(admin_user: dict = Depends(require_role(["admin"]))):
    users_col = db.get_collection("users")
    startups_col = db.get_collection("startups")
    proposals_col = db.get_collection("proposals")
    
    users = users_col.find()
    total_users = len(users)
    entrepreneurs_count = len([u for u in users if u.get("role") == "entrepreneur"])
    vcs_count = len([u for u in users if u.get("role") == "vc"])
    
    startups = startups_col.find()
    total_startups = len(startups)
    pending_startups = len([s for s in startups if s.get("status") in ["Submitted", "Under Review", "Correction Required"]])
    approved_startups = len([s for s in startups if s.get("status") in ["Approved", "Published", "Shortlisted", "Under Due Diligence", "Invested"]])
    
    proposals = proposals_col.find()
    total_investments_count = len([p for p in proposals if p.get("status") in ["Invested", "Completed"]])
    total_capital = sum([p.get("investment_amount", 0) for p in proposals if p.get("status") in ["Invested", "Completed"]])
    
    return {
        "total_users": total_users,
        "entrepreneurs_count": entrepreneurs_count,
        "vcs_count": vcs_count,
        "total_startups": total_startups,
        "pending_startups": pending_startups,
        "approved_startups": approved_startups,
        "total_investments_count": total_investments_count,
        "total_capital_invested": total_capital,
        "complaints_count": 0
    }

@router.get("/users", response_model=List[UserResponse])
def list_users(admin_user: dict = Depends(require_role(["admin"]))):
    users_col = db.get_collection("users")
    users = users_col.find()
    return [
        UserResponse(
            id=u["id"],
            email=u["email"],
            name=u["name"],
            role=u["role"],
            firm_or_company=u.get("firm_or_company", ""),
            bio=u.get("bio", ""),
            is_verified=u.get("is_verified", True),
            is_active=u.get("is_active", True)
        ) for u in users
    ]

@router.post("/users/{user_id}/status")
def update_user_status(user_id: str, is_active: bool, admin_user: dict = Depends(require_role(["admin"]))):
    users_col = db.get_collection("users")
    user = users_col.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    users_col.update_one({"id": user_id}, {"$set": {"is_active": is_active}})
    return {"message": f"User status updated to {'active' if is_active else 'suspended'}"}

@router.get("/startups/pending", response_model=List[StartupResponse])
def get_pending_startups(admin_user: dict = Depends(require_role(["admin"]))):
    startups_col = db.get_collection("startups")
    startups = startups_col.find()
    pending = [s for s in startups if s.get("status") in ["Submitted", "Under Review", "Correction Required", "Draft"]]
    return [StartupResponse(**s) for s in pending]

@router.post("/startups/{startup_id}/verify")
def verify_startup(startup_id: str, action: str, notes: Optional[str] = "", admin_user: dict = Depends(require_role(["admin"]))):
    """
    Action: 'approve', 'reject', 'request_correction'
    """
    startups_col = db.get_collection("startups")
    startup = startups_col.find_one({"id": startup_id})
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found.")

    status_map = {
        "approve": "Published",
        "reject": "Rejected",
        "request_correction": "Correction Required"
    }
    
    if action not in status_map:
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'approve', 'reject', or 'request_correction'.")

    new_status = status_map[action]
    startups_col.update_one(
        {"id": startup_id},
        {"$set": {"status": new_status, "admin_notes": notes}}
    )
    return {"message": f"Startup status updated to {new_status}", "status": new_status}

@router.get("/categories")
def get_categories():
    categories_col = db.get_collection("categories")
    return categories_col.find()
