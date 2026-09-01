import pytest
from fastapi.testclient import TestClient
from main import app
from database.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_seed():
    seed_database()

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_login_entrepreneur():
    response = client.post("/api/auth/login", json={
        "email": "sarah@novapay.io",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "entrepreneur"

def test_login_vc():
    response = client.post("/api/auth/login", json={
        "email": "david@horizoncap.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "vc"

def test_admin_dashboard():
    # Login admin
    login_res = client.post("/api/auth/login", json={
        "email": "admin@ventureconnect.com",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    
    dash_res = client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert dash_res.status_code == 200
    stats = dash_res.json()
    assert stats["total_users"] >= 6
    assert stats["total_startups"] >= 4

def test_vc_discover_and_scorecard():
    # Login VC
    login_res = client.post("/api/auth/login", json={
        "email": "david@horizoncap.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Discover startups
    disc_res = client.get("/api/vc/discover", headers=headers)
    assert disc_res.status_code == 200
    startups = disc_res.json()
    assert len(startups) >= 3

    # Submit scorecard for NovaPay
    sc_data = {
        "startup_id": "stp_1",
        "market_potential": {"rating": 10, "notes": "Excellent market growth"},
        "business_model": {"rating": 9, "notes": "Strong take rate"},
        "product": {"rating": 9, "notes": "Sub-second API"},
        "team": {"rating": 9, "notes": "Experienced Stripe team"},
        "financials": {"rating": 8, "notes": "Solid MRR"},
        "competition": {"rating": 8, "notes": "Strong defensibility"},
        "scalability": {"rating": 10, "notes": "Pure software scalability"}
    }
    sc_res = client.post("/api/vc/scorecard", json=sc_data, headers=headers)
    assert sc_res.status_code == 200
    assert sc_res.json()["overall_score"] == 9.0

def test_cypher_graph_query():
    login_res = client.post("/api/auth/login", json={
        "email": "david@horizoncap.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    graph_res = client.get("/api/graph/co-investor-syndicates?vc_id=usr_vc1", headers=headers)
    assert graph_res.status_code == 200
    g_data = graph_res.json()
    assert "nodes" in g_data
    assert "relationships" in g_data
    assert len(g_data["nodes"]) > 0
