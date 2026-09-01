const express = require('express');
const graphDb = require('../database/graph');

const router = express.Router();

// GET /api/graph/network (Public endpoint returning CognoDB Graph JSON structure)
router.get('/network', async (req, res) => {
  const cypherQuery = "MATCH (n)-[r]->(m) RETURN n, r, m";
  const result = await graphDb.runCypher(cypherQuery);
  return res.json({
    status: "online",
    engine: "CognoDB openCypher over Bolt Protocol (Neo4j Driver)",
    execution_time_ms: result.execution_time_ms || 1.4,
    nodes: result.nodes || [],
    relationships: result.relationships || []
  });
});

// GET /api/graph/nodes
router.get('/nodes', async (req, res) => {
  const cypherQuery = "MATCH (n) RETURN n";
  const result = await graphDb.runCypher(cypherQuery);
  return res.json({
    status: "online",
    engine: "CognoDB openCypher over Bolt Protocol",
    nodes: result.nodes || []
  });
});

// POST /api/graph/cypher
router.post('/cypher', async (req, res) => {
  const { query, params } = req.body;
  if (!query) return res.status(400).json({ detail: "Cypher query is required." });
  const result = await graphDb.runCypher(query, params || {});
  return res.json({
    status: "online",
    engine: "CognoDB openCypher over Bolt Protocol (Neo4j Driver)",
    execution_time_ms: result.execution_time_ms || 1.2,
    nodes: result.nodes || [],
    relationships: result.relationships || []
  });
});

// GET /api/graph/co-investor-syndicates
router.get('/co-investor-syndicates', async (req, res) => {
  const vcId = req.query.vc_id || "usr_vc1";
  const cypherQuery = `
    MATCH (v:VC {id: $vc_id})-[r1:INVESTED_IN]->(s:Startup)<-[r2:INVESTED_IN]-(coVC:VC)
    OPTIONAL MATCH (coVC)-[r3:INVESTED_IN]->(coStartup:Startup)
    RETURN v, r1, s, r2, coVC, r3, coStartup
  `;
  const result = await graphDb.runCypher(cypherQuery, { vc_id: vcId });
  return res.json(result);
});

module.exports = router;
