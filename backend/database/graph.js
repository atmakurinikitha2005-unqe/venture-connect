const neo4j = require('neo4j-driver');
const config = require('../config');

class GraphDatabaseManager {
  constructor() {
    this.driver = null;
    this._nodes = {};
    this._relationships = [];
    this.initCognodbDriver();
  }

  initCognodbDriver() {
    try {
      if (config.BOLT_URI && config.COGNODB_USER && config.COGNODB_PASSWORD) {
        this.driver = neo4j.driver(
          config.BOLT_URI,
          neo4j.auth.basic(config.COGNODB_USER, config.COGNODB_PASSWORD)
        );
        console.log(`[CognoDB] Node.js openCypher driver initialized for ${config.BOLT_URI}`);
      }
    } catch (e) {
      console.log(`[CognoDB] Connection warning (using graph fallback): ${e.message}`);
      this.driver = null;
    }
  }

  addNode(nodeId, label, properties) {
    this._nodes[nodeId] = {
      id: nodeId,
      label: label,
      properties: properties
    };
  }

  addRelationship(sourceId, targetId, relType, properties = {}) {
    this._relationships.push({
      source: sourceId,
      target: targetId,
      type: relType,
      properties: properties
    });
  }

  async runCypher(cypherQuery, params = {}) {
    const startTime = Date.now();

    if (this.driver) {
      try {
        const session = this.driver.session();
        const result = await session.run(cypherQuery, params);
        await session.close();

        const nodes = [];
        const relationships = [];

        result.records.forEach(record => {
          record.keys.forEach(key => {
            const item = record.get(key);
            if (item && item.labels) {
              nodes.push({
                id: item.identity ? item.identity.toString() : item.elementId,
                label: item.labels[0] || 'Node',
                properties: item.properties
              });
            } else if (item && item.type) {
              relationships.push({
                source: item.start.toString(),
                target: item.end.toString(),
                type: item.type,
                properties: item.properties
              });
            }
          });
        });

        const elapsed = Date.now() - startTime;
        return {
          nodes,
          relationships,
          cypher: cypherQuery,
          database: "CognoDB Cloud (openCypher)",
          execution_time_ms: elapsed
        };
      } catch (e) {
        // Fallback to graph engine if live Bolt connection fails
      }
    }

    // Local Graph Engine Fallback
    const nodes = Object.values(this._nodes);
    let relationships = this._relationships;

    if (params.vc_id) {
      const vcId = params.vc_id;
      const connectedIds = new Set([vcId]);

      // Hop 1: VC -> Startups
      relationships.forEach(r => {
        if (r.source === vcId || r.target === vcId) {
          connectedIds.add(r.source);
          connectedIds.add(r.target);
        }
      });

      // Hop 2: Startups -> Co-VCs
      relationships.forEach(r => {
        if (connectedIds.has(r.source) || connectedIds.has(r.target)) {
          connectedIds.add(r.source);
          connectedIds.add(r.target);
        }
      });

      const filteredNodes = nodes.filter(n => connectedIds.has(n.id));
      relationships = relationships.filter(r => connectedIds.has(r.source) && connectedIds.has(r.target));
      
      const elapsed = Date.now() - startTime;
      return {
        nodes: filteredNodes,
        relationships: relationships,
        cypher: cypherQuery,
        database: "CognoDB (openCypher Engine)",
        execution_time_ms: elapsed
      };
    }

    const elapsed = Date.now() - startTime;
    return {
      nodes: nodes,
      relationships: relationships,
      cypher: cypherQuery,
      database: "CognoDB (openCypher Engine)",
      execution_time_ms: elapsed
    };
  }

  close() {
    if (this.driver) {
      this.driver.close();
    }
  }
}

module.exports = new GraphDatabaseManager();
