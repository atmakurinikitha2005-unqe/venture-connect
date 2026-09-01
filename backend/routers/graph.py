from fastapi import APIRouter, HTTPException, Depends
from models.schemas import CypherQueryRequest, GraphResponse
from database.graph import graph_db
from utils.security import get_current_user

router = APIRouter(prefix="/api/graph", tags=["Graph Database Module (CognoDB / openCypher)"])

@router.post("/cypher", response_model=GraphResponse)
def execute_cypher(req: CypherQueryRequest, current_user: dict = Depends(get_current_user)):
    """
    Executes a parameterized openCypher query against CognoDB / Neo4j graph database instance.
    """
    result = graph_db.run_cypher(req.query, req.params)
    return GraphResponse(**result)

@router.get("/co-investor-syndicates", response_model=GraphResponse)
def get_co_investor_syndicates(vc_id: str = "usr_vc1", current_user: dict = Depends(get_current_user)):
    """
    Multi-hop Cypher traversal (2+ hops):
    Traverses VC -> Invested Startups -> Co-investing VCs -> Co-invested Startups.
    Demonstrates graph query capability awkward/costly in relational databases.
    """
    cypher_query = """
    MATCH (v:VC {id: $vc_id})-[r1:INVESTED_IN]->(s:Startup)<-[r2:INVESTED_IN]-(coVC:VC)
    OPTIONAL MATCH (coVC)-[r3:INVESTED_IN]->(coStartup:Startup)
    RETURN v, r1, s, r2, coVC, r3, coStartup
    """
    result = graph_db.run_cypher(cypher_query, {"vc_id": vc_id})
    return GraphResponse(**result)

@router.get("/network", response_model=GraphResponse)
def get_full_network(current_user: dict = Depends(get_current_user)):
    """
    Returns the complete node & relationship graph for visualization.
    """
    cypher_query = "MATCH (n)-[r]->(m) RETURN n, r, m"
    result = graph_db.run_cypher(cypher_query)
    return GraphResponse(**result)
