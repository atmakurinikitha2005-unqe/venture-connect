from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# --- User & Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = Field(..., description="Role: 'entrepreneur', 'vc', or 'admin'")
    firm_or_company: Optional[str] = ""
    bio: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    firm_or_company: Optional[str] = ""
    bio: Optional[str] = ""
    is_verified: bool = True
    is_active: bool = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Startup Schemas ---
class FinancialInfo(BaseModel):
    revenue_mrr: float = 0.0
    arr: float = 0.0
    monthly_burn: float = 0.0
    previous_funding: float = 0.0
    funding_required: float = 0.0
    equity_offered_percent: float = 0.0
    financial_projections_3yr: Optional[str] = ""

class StartupCreate(BaseModel):
    name: str
    logo_url: Optional[str] = ""
    industry: str
    stage: str # Pre-seed, Seed, Series A, Series B, etc.
    location: str
    description: str
    problem: str
    solution: str
    business_model: str
    target_market: str
    funding_required: float
    equity_offered_percent: float
    founder_name: str
    team_info: str
    financials: FinancialInfo
    pitch_deck_url: Optional[str] = ""

class StartupUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    business_model: Optional[str] = None
    target_market: Optional[str] = None
    funding_required: Optional[float] = None
    equity_offered_percent: Optional[float] = None
    founder_name: Optional[str] = None
    team_info: Optional[str] = None
    financials: Optional[FinancialInfo] = None
    pitch_deck_url: Optional[str] = None

class StartupResponse(BaseModel):
    id: str
    entrepreneur_id: str
    name: str
    logo_url: Optional[str] = ""
    industry: str
    stage: str
    location: str
    description: str
    problem: str
    solution: str
    business_model: str
    target_market: str
    funding_required: float
    equity_offered_percent: float
    founder_name: str
    team_info: str
    financials: FinancialInfo
    pitch_deck_url: Optional[str] = ""
    status: str = "Draft" # Draft -> Submitted -> Under Review -> Correction Required -> Approved -> Published -> Shortlisted -> Under Due Diligence -> Meeting Scheduled -> Investment Proposed -> Negotiation -> Invested / Rejected
    admin_notes: Optional[str] = ""
    created_at: str
    updated_at: str

# --- VC Evaluation Scorecard ---
class ScorecardCriterion(BaseModel):
    rating: int = Field(..., ge=1, le=10) # 1 to 10 scale
    notes: Optional[str] = ""

class ScorecardCreate(BaseModel):
    startup_id: str
    market_potential: ScorecardCriterion
    business_model: ScorecardCriterion
    product: ScorecardCriterion
    team: ScorecardCriterion
    financials: ScorecardCriterion
    competition: ScorecardCriterion
    scalability: ScorecardCriterion

class ScorecardResponse(BaseModel):
    id: str
    vc_id: str
    startup_id: str
    market_potential: ScorecardCriterion
    business_model: ScorecardCriterion
    product: ScorecardCriterion
    team: ScorecardCriterion
    financials: ScorecardCriterion
    competition: ScorecardCriterion
    scalability: ScorecardCriterion
    overall_score: float # Calculated average (1.0 to 10.0)
    created_at: str

# --- Startup Comparison ---
class CompareRequest(BaseModel):
    startup_ids: List[str] # 2 to 4 startups

# --- Due Diligence Workspace ---
class DueDiligenceItem(BaseModel):
    id: str
    category: str # 'Business', 'Financial', 'Legal', 'Team'
    title: str
    description: str
    is_completed: bool = False
    notes: Optional[str] = ""
    verified_by_vc_id: Optional[str] = ""

class DueDiligenceWorkspace(BaseModel):
    id: str
    startup_id: str
    vc_id: str
    items: List[DueDiligenceItem]
    total_checks: int
    completed_checks: int
    completion_percentage: float # e.g. 80.0

class DueDiligenceUpdateItem(BaseModel):
    item_id: str
    is_completed: bool
    notes: Optional[str] = None

# --- Meeting Management ---
class MeetingCreate(BaseModel):
    startup_id: str
    date: str # YYYY-MM-DD
    time: str # HH:MM
    purpose: str
    message: Optional[str] = ""

class MeetingResponse(BaseModel):
    id: str
    startup_id: str
    startup_name: str
    vc_id: str
    vc_name: str
    entrepreneur_id: str
    date: str
    time: str
    purpose: str
    message: str
    status: str = "Requested" # Requested, Accepted, Rescheduled, Completed, Cancelled, Rejected
    created_at: str

class MeetingStatusUpdate(BaseModel):
    status: str
    message: Optional[str] = ""
    new_date: Optional[str] = None
    new_time: Optional[str] = None

# --- Investment Proposal & Negotiation ---
class CounterOffer(BaseModel):
    sender_role: str # 'vc' or 'entrepreneur'
    sender_id: str
    sender_name: str
    investment_amount: float
    equity_percent: float
    conditions: str
    notes: str
    timestamp: str

class ProposalCreate(BaseModel):
    startup_id: str
    investment_amount: float
    equity_percent: float
    conditions: str
    notes: Optional[str] = ""

class ProposalResponse(BaseModel):
    id: str
    startup_id: str
    startup_name: str
    vc_id: str
    vc_name: str
    entrepreneur_id: str
    investment_amount: float
    equity_percent: float
    conditions: str
    notes: str
    status: str = "Proposal Sent" # Proposal Sent, Under Discussion, Counter Offer, Accepted, Rejected, Invested, Completed
    counter_offers: List[CounterOffer] = []
    created_at: str
    updated_at: str

class ProposalAction(BaseModel):
    action: str # 'accept', 'reject', 'counter'
    counter_amount: Optional[float] = None
    counter_equity: Optional[float] = None
    conditions: Optional[str] = None
    notes: Optional[str] = None

# --- Portfolio & Startup Progress Updates ---
class PortfolioItem(BaseModel):
    id: str
    vc_id: str
    startup_id: str
    startup_name: str
    investment_amount: float
    equity_percent: float
    investment_date: str
    stage_at_investment: str
    current_status: str = "Active"

class ProgressUpdateCreate(BaseModel):
    startup_id: str
    title: str
    period: str # Q1 2026, August 2026, etc.
    revenue: float
    customers_count: int
    employees_count: int
    milestones_achieved: str
    product_progress: str
    new_funding: float = 0.0
    business_notes: str

class ProgressUpdateResponse(BaseModel):
    id: str
    startup_id: str
    startup_name: str
    title: str
    period: str
    revenue: float
    customers_count: int
    employees_count: int
    milestones_achieved: str
    product_progress: str
    new_funding: float
    business_notes: str
    created_at: str

# --- Graph Query Schemas ---
class CypherQueryRequest(BaseModel):
    query: str
    params: Optional[Dict[str, Any]] = {}

class GraphNode(BaseModel):
    id: str
    label: str
    properties: Dict[str, Any]

class GraphRelationship(BaseModel):
    source: str
    target: str
    type: str
    properties: Optional[Dict[str, Any]] = {}

class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    relationships: List[GraphRelationship]
    cypher: str
    execution_time_ms: float
