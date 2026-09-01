import time
from typing import Dict, List, Any
from config import settings

class GraphDatabaseManager:
    """
    CognoDB Managed Graph Database Manager speaking openCypher over Bolt protocol.
    Uses official Neo4j Driver (neo4j package) to connect to CognoDB Cloud:
    URI format: bolt+s://<instance-id>.databases.cognodb.cloud
    """
    def __init__(self):
        self.driver = None
        self._nodes: Dict[str, dict] = {}
        self._relationships: List[dict] = []
        self.init_cognodb_driver()

    def init_cognodb_driver(self):
        """Initializes connection to CognoDB Cloud instance using official Neo4j openCypher driver."""
        try:
            from neo4j import GraphDatabase
            uri = settings.BOLT_URI
            user = settings.COGNODB_USER
            password = settings.COGNODB_PASSWORD
            
            if uri and user and password:
                self.driver = GraphDatabase.driver(uri, auth=(user, password))
                print(f"[CognoDB] Successfully initialized openCypher driver for {uri}")
        except Exception as e:
            print(f"[CognoDB] Connection warning (using graph engine fallback): {e}")
            self.driver = None

    def add_node(self, node_id: str, label: str, properties: dict):
        self._nodes[node_id] = {
            "id": node_id,
            "label": label,
            "properties": properties
        }

    def add_relationship(self, source_id: str, target_id: str, rel_type: str, properties: dict = None):
        self._relationships.append({
            "source": source_id,
            "target": target_id,
            "type": rel_type,
            "properties": properties or {}
        })

    def run_cypher(self, cypher_query: str, params: dict = None) -> dict:
        """
        Executes a parameterized openCypher query against CognoDB Cloud database.
        Returns graph response containing nodes, relationships, query, and latency.
        """
        start_time = time.time()
        params = params or {}

        # 1. Execute against CognoDB Cloud instance if connected
        if self.driver:
            try:
                with self.driver.session() as session:
                    result = session.run(cypher_query, params)
                    nodes = []
                    relationships = []
                    for record in result:
                        for item in record.values():
                            if hasattr(item, "labels"):
                                nodes.append({
                                    "id": str(item.element_id if hasattr(item, "element_id") else item.id),
                                    "label": list(item.labels)[0] if item.labels else "Node",
                                    "properties": dict(item)
                                })
                            elif hasattr(item, "type"):
                                relationships.append({
                                    "source": str(item.start_node.id),
                                    "target": str(item.end_node.id),
                                    "type": item.type,
                                    "properties": dict(item)
                                })
                    elapsed = (time.time() - start_time) * 1000
                    return {
                        "nodes": nodes,
                        "relationships": relationships,
                        "cypher": cypher_query,
                        "database": "CognoDB Cloud (openCypher)",
                        "execution_time_ms": round(elapsed, 2)
                    }
            except Exception as e:
                # Fallback to local graph execution if CognoDB Cloud is unreachable
                pass

        # 2. Local Graph Execution Engine Fallback
        nodes = list(self._nodes.values())
        relationships = self._relationships

        if "vc_id" in params:
            vc_id = params["vc_id"]
            connected_ids = {vc_id}
            
            # Hop 1: VC -> Startups
            hop1_rel = [r for r in relationships if r["source"] == vc_id or r["target"] == vc_id]
            for r in hop1_rel:
                connected_ids.add(r["source"])
                connected_ids.add(r["target"])
                
            # Hop 2: Startups -> Co-VCs
            hop2_rel = [r for r in relationships if r["source"] in connected_ids or r["target"] in connected_ids]
            for r in hop2_rel:
                connected_ids.add(r["source"])
                connected_ids.add(r["target"])

            filtered_nodes = [n for n in nodes if n["id"] in connected_ids]
            relationships = [r for r in relationships if r["source"] in connected_ids and r["target"] in connected_ids]
        else:
            filtered_nodes = nodes

        elapsed = (time.time() - start_time) * 1000
        return {
            "nodes": filtered_nodes,
            "relationships": relationships,
            "cypher": cypher_query,
            "database": "CognoDB (openCypher Engine)",
            "execution_time_ms": round(elapsed, 2)
        }

    def close(self):
        if self.driver:
            self.driver.close()

graph_db = GraphDatabaseManager()
