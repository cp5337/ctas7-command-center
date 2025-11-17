#!/usr/bin/env python3
"""
CTAS7 GNN OSINT Intelligence System
Graph Neural Network for Open Source Intelligence Analysis
Integration with ABE Drop Zone, SlotGraph, and High-GPU Systems

Author: CTAS7 Intelligence Generator
Purpose: Neural graph analysis for enhanced OSINT processing
Architecture: Local processing + High-GPU system integration
"""

import asyncio
import json
import logging
import sqlite3
import os
import numpy as np
import networkx as nx
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from pathlib import Path
import google.generativeai as genai

# Neural network and graph processing
try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    from torch_geometric.nn import GCNConv, GATConv, TransformerConv
    from torch_geometric.data import Data, Batch
    import torch_geometric.transforms as T
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    logging.warning("PyTorch/PyG not available - will use CPU-based graph processing")

# Load environment variables
def load_env_file():
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

load_env_file()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OSINTNodeType(Enum):
    """OSINT graph node types"""
    ENTITY = "ENTITY"          # Person, organization, location
    DOCUMENT = "DOCUMENT"      # Reports, articles, files
    EVENT = "EVENT"            # Incidents, activities, timeline events
    INDICATOR = "INDICATOR"    # IOCs, TTPs, observable patterns
    INFRASTRUCTURE = "INFRASTRUCTURE"  # Domains, IPs, servers
    CAMPAIGN = "CAMPAIGN"      # Operations, threat campaigns
    ACTOR = "ACTOR"           # Threat actors, groups
    VULNERABILITY = "VULNERABILITY"  # CVEs, exploits
    ARTIFACT = "ARTIFACT"     # Files, malware, tools

class OSINTRelationType(Enum):
    """OSINT graph relationship types"""
    ASSOCIATED_WITH = "ASSOCIATED_WITH"
    BELONGS_TO = "BELONGS_TO"
    COMMUNICATES_WITH = "COMMUNICATES_WITH"
    USES = "USES"
    TARGETS = "TARGETS"
    ATTRIBUTED_TO = "ATTRIBUTED_TO"
    EXPLOITS = "EXPLOITS"
    HOSTS = "HOSTS"
    REFERENCES = "REFERENCES"
    TEMPORALLY_RELATED = "TEMPORALLY_RELATED"
    GEOGRAPHICALLY_RELATED = "GEOGRAPHICALLY_RELATED"

class GNNProcessingMode(Enum):
    """GNN processing modes"""
    LOCAL_CPU = "LOCAL_CPU"           # Local CPU-based processing
    LOCAL_GPU = "LOCAL_GPU"           # Local GPU if available
    HIGH_GPU_REMOTE = "HIGH_GPU_REMOTE"  # Marcus GCP high-GPU system
    HYBRID = "HYBRID"                 # Local + Remote combination

@dataclass
class OSINTNode:
    """OSINT graph node structure"""
    node_id: str
    node_type: OSINTNodeType
    name: str
    description: str
    properties: Dict[str, Any]
    confidence_score: float
    source_reliability: str  # QA5 assessment
    collection_timestamp: datetime
    last_updated: datetime
    features: Optional[np.ndarray] = None  # Neural features
    embedding: Optional[np.ndarray] = None  # Graph embedding

@dataclass
class OSINTEdge:
    """OSINT graph edge structure"""
    edge_id: str
    source_node_id: str
    target_node_id: str
    relation_type: OSINTRelationType
    weight: float
    confidence: float
    evidence: List[str]
    metadata: Dict[str, Any]
    temporal_window: Optional[Tuple[datetime, datetime]] = None

@dataclass
class OSINTGraph:
    """Complete OSINT graph structure"""
    graph_id: str
    nodes: List[OSINTNode]
    edges: List[OSINTEdge]
    metadata: Dict[str, Any]
    created_timestamp: datetime
    last_analysis: Optional[datetime] = None
    neural_analysis: Optional[Dict[str, Any]] = None

class GNNOSINTModel(nn.Module):
    """Graph Neural Network for OSINT analysis"""

    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int, num_layers: int = 3):
        super(GNNOSINTModel, self).__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.output_dim = output_dim

        # Multi-layer GCN with attention
        self.convs = nn.ModuleList()
        self.convs.append(GCNConv(input_dim, hidden_dim))

        for _ in range(num_layers - 2):
            self.convs.append(GCNConv(hidden_dim, hidden_dim))

        self.convs.append(GCNConv(hidden_dim, output_dim))

        # Graph attention mechanism
        self.attention = GATConv(hidden_dim, hidden_dim, heads=8, concat=False)

        # Output layers
        self.classifier = nn.Linear(output_dim, 5)  # 5 threat levels
        self.anomaly_detector = nn.Linear(output_dim, 1)
        self.relationship_predictor = nn.Linear(output_dim * 2, len(OSINTRelationType))

        self.dropout = nn.Dropout(0.3)

    def forward(self, x, edge_index, batch=None):
        # Graph convolution layers
        for i, conv in enumerate(self.convs[:-1]):
            x = conv(x, edge_index)
            x = F.relu(x)
            x = self.dropout(x)

            # Apply attention on middle layers
            if i == len(self.convs) // 2:
                x = self.attention(x, edge_index)

        # Final layer
        x = self.convs[-1](x, edge_index)

        # Predictions
        threat_scores = self.classifier(x)
        anomaly_scores = torch.sigmoid(self.anomaly_detector(x))

        return {
            'node_embeddings': x,
            'threat_scores': threat_scores,
            'anomaly_scores': anomaly_scores
        }

class HighGPUConnector:
    """Connector for Marcus GCP high-GPU system"""

    def __init__(self):
        self.project_id = "gen-lang-client-0779767785"
        self.service_account_key = os.path.expanduser("~/.ctas7/marcus-gcp-key.json")
        self.endpoint_url = "https://aiplatform.googleapis.com"
        self.marcus_neural_mux_url = "http://localhost:18100"  # Neural Mux endpoint

    async def is_available(self) -> bool:
        """Check if high-GPU system is available"""
        try:
            # Check Marcus Neural Mux connectivity
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.marcus_neural_mux_url}/health") as response:
                    return response.status == 200
        except:
            return False

    async def submit_heavy_computation(self, graph_data: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        """Submit heavy neural computation to high-GPU system"""
        try:
            # Package graph data for remote processing
            payload = {
                "task_type": task_type,
                "graph_data": graph_data,
                "model_config": {
                    "input_dim": 512,
                    "hidden_dim": 256,
                    "num_layers": 5,
                    "use_attention": True
                },
                "processing_requirements": {
                    "gpu_memory": "16GB",
                    "estimated_time": "300s",
                    "priority": "high"
                }
            }

            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.marcus_neural_mux_url}/process_graph",
                    json=payload
                ) as response:
                    return await response.json()

        except Exception as e:
            logger.error(f"High-GPU processing failed: {e}")
            return {"status": "failed", "error": str(e)}

class ABEDropZoneConnector:
    """Connector for ABE Drop Zone auto-processing"""

    def __init__(self):
        self.operator_drop_zone = os.path.expanduser("~/CTAS_Operator_DropZone/")
        self.processing_dir = os.path.join(self.operator_drop_zone, "processing")
        self.processed_dir = os.path.join(self.operator_drop_zone, "processed")

        # Create directories if they don't exist
        os.makedirs(self.operator_drop_zone, exist_ok=True)
        os.makedirs(self.processing_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)

    async def get_processed_documents(self) -> List[Dict[str, Any]]:
        """Get documents processed by ABE drop zone"""
        documents = []
        try:
            for file in os.listdir(self.processed_dir):
                if file.endswith('.json'):
                    with open(os.path.join(self.processed_dir, file), 'r') as f:
                        doc_data = json.load(f)
                        documents.append(doc_data)
        except Exception as e:
            logger.error(f"Error reading ABE processed documents: {e}")

        return documents

    async def create_osint_nodes_from_abe(self, documents: List[Dict[str, Any]]) -> List[OSINTNode]:
        """Convert ABE processed documents to OSINT nodes"""
        nodes = []

        for doc in documents:
            # Extract OSINT-relevant information
            node = OSINTNode(
                node_id=f"ABE-{doc.get('doc_id', 'unknown')}",
                node_type=OSINTNodeType.DOCUMENT,
                name=doc.get('title', 'Unknown Document'),
                description=doc.get('summary', doc.get('content', '')[:200]),
                properties={
                    "source": "ABE_DROP_ZONE",
                    "format": doc.get('format', 'unknown'),
                    "classification": doc.get('classification', 'UNCLASSIFIED'),
                    "taxonomy": doc.get('taxonomy_tags', []),
                    "entities": doc.get('extracted_entities', []),
                    "keywords": doc.get('keywords', [])
                },
                confidence_score=doc.get('confidence_score', 0.5),
                source_reliability=doc.get('qa5_reliability', 'C'),
                collection_timestamp=datetime.fromisoformat(doc.get('processed_date', datetime.now().isoformat())),
                last_updated=datetime.now()
            )
            nodes.append(node)

        return nodes

class GNNOSINTIntelligence:
    """Main GNN OSINT Intelligence System"""

    def __init__(self):
        # Core components
        self.db_path = "/Users/cp5337/Developer/ctas7-command-center/gnn_osint_intelligence.db"
        self.processing_mode = GNNProcessingMode.HYBRID

        # Neural network model
        self.model = None
        if TORCH_AVAILABLE:
            self.model = GNNOSINTModel(input_dim=512, hidden_dim=256, output_dim=128)

        # Connectors
        self.high_gpu = HighGPUConnector()
        self.abe_connector = ABEDropZoneConnector()

        # In-memory graph
        self.current_graph: Optional[OSINTGraph] = None
        self.nx_graph = nx.DiGraph()

        # Initialize database
        self.initialize_database()

        logger.info("🕷️ GNN OSINT Intelligence System initialized")
        logger.info(f"   Processing mode: {self.processing_mode.value}")
        logger.info(f"   PyTorch available: {TORCH_AVAILABLE}")

    def initialize_database(self):
        """Initialize SQLite database for GNN OSINT"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # OSINT nodes table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS osint_nodes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                node_id TEXT UNIQUE,
                node_type TEXT,
                name TEXT,
                description TEXT,
                properties TEXT,
                confidence_score REAL,
                source_reliability TEXT,
                collection_timestamp TEXT,
                last_updated TEXT,
                features BLOB,
                embedding BLOB
            )
        ''')

        # OSINT edges table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS osint_edges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                edge_id TEXT UNIQUE,
                source_node_id TEXT,
                target_node_id TEXT,
                relation_type TEXT,
                weight REAL,
                confidence REAL,
                evidence TEXT,
                metadata TEXT,
                temporal_start TEXT,
                temporal_end TEXT
            )
        ''')

        # Neural analysis results table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS neural_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                graph_id TEXT,
                analysis_type TEXT,
                results TEXT,
                processing_mode TEXT,
                computation_time REAL,
                model_version TEXT,
                created_timestamp TEXT
            )
        ''')

        # OSINT campaigns table (high-level groupings)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS osint_campaigns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                campaign_id TEXT UNIQUE,
                name TEXT,
                description TEXT,
                related_nodes TEXT,
                threat_level TEXT,
                confidence_score REAL,
                start_date TEXT,
                end_date TEXT,
                status TEXT
            )
        ''')

        conn.commit()
        conn.close()

    async def process_abe_intelligence(self) -> List[OSINTNode]:
        """Process intelligence from ABE Drop Zone"""
        logger.info("📥 Processing ABE Drop Zone intelligence...")

        # Get processed documents from ABE
        documents = await self.abe_connector.get_processed_documents()

        # Convert to OSINT nodes
        nodes = await self.abe_connector.create_osint_nodes_from_abe(documents)

        logger.info(f"   Created {len(nodes)} OSINT nodes from ABE documents")
        return nodes

    async def integrate_existing_osint(self) -> List[OSINTNode]:
        """Integrate existing OSINT extractors"""
        logger.info("🔗 Integrating existing OSINT extractors...")

        nodes = []

        # Import existing OSINT extractors
        try:
            import sys
            sys.path.append('/Users/cp5337/Developer/ctas7-command-center')
            from osint_extractors.people_extractor import PeopleExtractor
            from osint_extractors.vehicle_extractor import VehicleExtractor

            # Create nodes from existing extractors
            # This would integrate with the existing OSINT infrastructure
            logger.info("   Integrated existing OSINT extractors")

        except ImportError as e:
            logger.warning(f"Could not import OSINT extractors: {e}")

        return nodes

    async def create_graph_from_cybersec_intel(self) -> List[OSINTNode]:
        """Create OSINT graph from existing cybersecurity intelligence"""
        logger.info("🛡️ Creating graph from cybersecurity intelligence...")

        nodes = []

        # Connect to existing cybersecurity intelligence databases
        intel_sources = [
            "/Users/cp5337/Developer/ctas7-command-center/unified_threat_intelligence.db",
            "/Users/cp5337/Developer/ctas7-command-center/crowdstrike_intelligence.db",
            "/Users/cp5337/Developer/ctas7-command-center/virustotal_intelligence.db"
        ]

        for db_path in intel_sources:
            if os.path.exists(db_path):
                try:
                    conn = sqlite3.connect(db_path)
                    cursor = conn.cursor()

                    # Extract threat actors
                    cursor.execute("SELECT * FROM threat_actors LIMIT 100")
                    for row in cursor.fetchall():
                        try:
                            node = OSINTNode(
                                node_id=f"CYBER-ACTOR-{row[1]}",  # Assuming actor name is in column 1
                                node_type=OSINTNodeType.ACTOR,
                                name=row[1],
                                description=f"Threat actor from {os.path.basename(db_path)}",
                                properties={
                                    "source_db": os.path.basename(db_path),
                                    "attribution": row[3] if len(row) > 3 else "Unknown",
                                    "sophistication": row[4] if len(row) > 4 else "Unknown"
                                },
                                confidence_score=0.8,
                                source_reliability="B",
                                collection_timestamp=datetime.now(),
                                last_updated=datetime.now()
                            )
                            nodes.append(node)
                        except Exception as e:
                            logger.warning(f"Error creating node from {db_path}: {e}")

                    conn.close()

                except Exception as e:
                    logger.warning(f"Could not read intelligence database {db_path}: {e}")

        logger.info(f"   Created {len(nodes)} nodes from cybersecurity intelligence")
        return nodes

    def extract_features(self, node: OSINTNode) -> np.ndarray:
        """Extract neural features from OSINT node"""
        features = []

        # Node type encoding (one-hot)
        node_type_encoding = [0] * len(OSINTNodeType)
        node_type_encoding[list(OSINTNodeType).index(node.node_type)] = 1
        features.extend(node_type_encoding)

        # Confidence and reliability scores
        features.append(node.confidence_score)

        # QA5 reliability encoding
        qa5_mapping = {"A": 1.0, "B": 0.8, "C": 0.6, "D": 0.4, "E": 0.2, "F": 0.0}
        features.append(qa5_mapping.get(node.source_reliability, 0.5))

        # Text-based features (simple for now)
        text_features = self.extract_text_features(node.name + " " + node.description)
        features.extend(text_features)

        # Temporal features
        now = datetime.now()
        age_days = (now - node.collection_timestamp).days
        features.append(min(age_days / 365.0, 1.0))  # Normalize to [0,1]

        # Pad to fixed size
        target_size = 512
        if len(features) < target_size:
            features.extend([0] * (target_size - len(features)))
        else:
            features = features[:target_size]

        return np.array(features, dtype=np.float32)

    def extract_text_features(self, text: str) -> List[float]:
        """Extract simple text features (can be enhanced with embeddings)"""
        # Simple text statistics
        features = [
            len(text),
            len(text.split()),
            text.count('.'),
            text.count(','),
            text.count('?'),
            text.count('!'),
            sum(1 for c in text if c.isupper()) / max(len(text), 1),
            sum(1 for c in text if c.isdigit()) / max(len(text), 1)
        ]

        # Normalize
        features = [(f - min(features)) / max(max(features) - min(features), 1) for f in features]

        # Pad to fixed size for consistency
        while len(features) < 100:
            features.append(0.0)

        return features[:100]  # Limit to 100 features

    def detect_relationships(self, nodes: List[OSINTNode]) -> List[OSINTEdge]:
        """Detect relationships between OSINT nodes"""
        logger.info("🔗 Detecting relationships between nodes...")

        edges = []

        for i, node1 in enumerate(nodes):
            for j, node2 in enumerate(nodes):
                if i >= j:  # Avoid duplicates and self-loops
                    continue

                # Calculate similarity and determine relationship
                relationship = self.calculate_node_relationship(node1, node2)

                if relationship:
                    edge = OSINTEdge(
                        edge_id=f"EDGE-{node1.node_id}-{node2.node_id}",
                        source_node_id=node1.node_id,
                        target_node_id=node2.node_id,
                        relation_type=relationship['type'],
                        weight=relationship['weight'],
                        confidence=relationship['confidence'],
                        evidence=relationship['evidence'],
                        metadata=relationship['metadata']
                    )
                    edges.append(edge)

        logger.info(f"   Detected {len(edges)} relationships")
        return edges

    def calculate_node_relationship(self, node1: OSINTNode, node2: OSINTNode) -> Optional[Dict[str, Any]]:
        """Calculate relationship between two nodes"""
        # Simple heuristic-based relationship detection

        # Actor-Campaign relationships
        if node1.node_type == OSINTNodeType.ACTOR and node2.node_type == OSINTNodeType.CAMPAIGN:
            return {
                'type': OSINTRelationType.ATTRIBUTED_TO,
                'weight': 0.8,
                'confidence': 0.7,
                'evidence': ["Node type heuristic"],
                'metadata': {"rule": "actor_campaign"}
            }

        # Document-Entity relationships
        if node1.node_type == OSINTNodeType.DOCUMENT and node2.node_type == OSINTNodeType.ENTITY:
            # Check if entity is mentioned in document
            if node2.name.lower() in node1.description.lower():
                return {
                    'type': OSINTRelationType.REFERENCES,
                    'weight': 0.6,
                    'confidence': 0.6,
                    'evidence': [f"Entity '{node2.name}' mentioned in document"],
                    'metadata': {"rule": "document_entity_mention"}
                }

        # Infrastructure-Actor relationships
        if (node1.node_type == OSINTNodeType.INFRASTRUCTURE and node2.node_type == OSINTNodeType.ACTOR) or \
           (node2.node_type == OSINTNodeType.INFRASTRUCTURE and node1.node_type == OSINTNodeType.ACTOR):
            return {
                'type': OSINTRelationType.USES,
                'weight': 0.7,
                'confidence': 0.5,
                'evidence': ["Infrastructure-actor association"],
                'metadata': {"rule": "infrastructure_actor"}
            }

        # Temporal relationships
        if abs((node1.collection_timestamp - node2.collection_timestamp).days) <= 7:
            return {
                'type': OSINTRelationType.TEMPORALLY_RELATED,
                'weight': 0.4,
                'confidence': 0.3,
                'evidence': ["Collected within same week"],
                'metadata': {"rule": "temporal_proximity"}
            }

        return None

    async def perform_neural_analysis(self, graph: OSINTGraph) -> Dict[str, Any]:
        """Perform neural analysis on OSINT graph"""
        logger.info("🧠 Performing neural analysis...")

        if not TORCH_AVAILABLE:
            logger.warning("PyTorch not available - performing CPU-based analysis")
            return await self.cpu_based_analysis(graph)

        # Check if we should use high-GPU system
        if self.processing_mode in [GNNProcessingMode.HIGH_GPU_REMOTE, GNNProcessingMode.HYBRID]:
            if await self.high_gpu.is_available():
                logger.info("🚀 Using high-GPU system for neural analysis")
                return await self.high_gpu_analysis(graph)

        # Local neural analysis
        return await self.local_neural_analysis(graph)

    async def local_neural_analysis(self, graph: OSINTGraph) -> Dict[str, Any]:
        """Perform local neural analysis"""
        logger.info("💻 Performing local neural analysis...")

        try:
            # Prepare graph data for PyTorch Geometric
            node_features = []
            node_mapping = {}

            for i, node in enumerate(graph.nodes):
                features = self.extract_features(node)
                node_features.append(features)
                node_mapping[node.node_id] = i

            # Create edge index
            edge_indices = []
            edge_weights = []

            for edge in graph.edges:
                if edge.source_node_id in node_mapping and edge.target_node_id in node_mapping:
                    source_idx = node_mapping[edge.source_node_id]
                    target_idx = node_mapping[edge.target_node_id]
                    edge_indices.append([source_idx, target_idx])
                    edge_weights.append(edge.weight)

            if not edge_indices:
                logger.warning("No valid edges found for neural analysis")
                return {"status": "no_edges", "analysis": {}}

            # Convert to PyTorch tensors
            x = torch.tensor(np.array(node_features), dtype=torch.float32)
            edge_index = torch.tensor(np.array(edge_indices).T, dtype=torch.long)

            # Forward pass through model
            self.model.eval()
            with torch.no_grad():
                results = self.model(x, edge_index)

            # Process results
            analysis = {
                "node_embeddings": results['node_embeddings'].numpy(),
                "threat_scores": results['threat_scores'].numpy(),
                "anomaly_scores": results['anomaly_scores'].numpy(),
                "high_threat_nodes": [],
                "anomalous_nodes": [],
                "centrality_analysis": {},
                "community_detection": {}
            }

            # Identify high-threat and anomalous nodes
            threat_threshold = 0.7
            anomaly_threshold = 0.8

            for i, node in enumerate(graph.nodes):
                threat_score = float(torch.max(results['threat_scores'][i]))
                anomaly_score = float(results['anomaly_scores'][i])

                if threat_score > threat_threshold:
                    analysis["high_threat_nodes"].append({
                        "node_id": node.node_id,
                        "name": node.name,
                        "threat_score": threat_score
                    })

                if anomaly_score > anomaly_threshold:
                    analysis["anomalous_nodes"].append({
                        "node_id": node.node_id,
                        "name": node.name,
                        "anomaly_score": anomaly_score
                    })

            # NetworkX analysis for centrality
            nx_graph = self.convert_to_networkx(graph)
            analysis["centrality_analysis"] = {
                "betweenness": dict(nx.betweenness_centrality(nx_graph)),
                "eigenvector": dict(nx.eigenvector_centrality(nx_graph)),
                "pagerank": dict(nx.pagerank(nx_graph))
            }

            logger.info(f"   Found {len(analysis['high_threat_nodes'])} high-threat nodes")
            logger.info(f"   Found {len(analysis['anomalous_nodes'])} anomalous nodes")

            return {
                "status": "success",
                "analysis": analysis,
                "processing_mode": "local_neural"
            }

        except Exception as e:
            logger.error(f"Local neural analysis failed: {e}")
            return {"status": "failed", "error": str(e)}

    async def high_gpu_analysis(self, graph: OSINTGraph) -> Dict[str, Any]:
        """Perform analysis using high-GPU system"""
        logger.info("🚀 Performing high-GPU neural analysis...")

        # Prepare graph data for remote processing
        graph_data = {
            "nodes": [asdict(node) for node in graph.nodes],
            "edges": [asdict(edge) for edge in graph.edges],
            "metadata": graph.metadata
        }

        # Submit to high-GPU system
        result = await self.high_gpu.submit_heavy_computation(graph_data, "gnn_osint_analysis")

        if result.get("status") == "success":
            logger.info("✅ High-GPU analysis completed successfully")
            return result
        else:
            logger.warning("⚠️ High-GPU analysis failed, falling back to local")
            return await self.local_neural_analysis(graph)

    async def cpu_based_analysis(self, graph: OSINTGraph) -> Dict[str, Any]:
        """Perform CPU-based analysis when neural networks are not available"""
        logger.info("🖥️ Performing CPU-based graph analysis...")

        # Convert to NetworkX for analysis
        nx_graph = self.convert_to_networkx(graph)

        analysis = {
            "centrality_analysis": {
                "degree": dict(nx_graph.degree()),
                "betweenness": dict(nx.betweenness_centrality(nx_graph)),
                "closeness": dict(nx.closeness_centrality(nx_graph)),
                "pagerank": dict(nx.pagerank(nx_graph))
            },
            "structural_analysis": {
                "node_count": len(graph.nodes),
                "edge_count": len(graph.edges),
                "density": nx.density(nx_graph),
                "components": nx.number_connected_components(nx_graph.to_undirected())
            },
            "high_centrality_nodes": [],
            "isolated_nodes": [],
            "dense_subgraphs": []
        }

        # Identify high-centrality nodes
        pagerank_scores = analysis["centrality_analysis"]["pagerank"]
        top_nodes = sorted(pagerank_scores.items(), key=lambda x: x[1], reverse=True)[:10]

        for node_id, score in top_nodes:
            node = next((n for n in graph.nodes if n.node_id == node_id), None)
            if node:
                analysis["high_centrality_nodes"].append({
                    "node_id": node_id,
                    "name": node.name,
                    "centrality_score": score,
                    "type": node.node_type.value
                })

        logger.info(f"   Analyzed graph with {len(graph.nodes)} nodes and {len(graph.edges)} edges")

        return {
            "status": "success",
            "analysis": analysis,
            "processing_mode": "cpu_based"
        }

    def convert_to_networkx(self, graph: OSINTGraph) -> nx.DiGraph:
        """Convert OSINT graph to NetworkX format"""
        nx_graph = nx.DiGraph()

        # Add nodes
        for node in graph.nodes:
            nx_graph.add_node(
                node.node_id,
                name=node.name,
                type=node.node_type.value,
                confidence=node.confidence_score
            )

        # Add edges
        for edge in graph.edges:
            nx_graph.add_edge(
                edge.source_node_id,
                edge.target_node_id,
                weight=edge.weight,
                relation=edge.relation_type.value,
                confidence=edge.confidence
            )

        return nx_graph

    async def generate_intelligence_summary(self, graph: OSINTGraph, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate intelligence summary from graph analysis"""
        logger.info("📊 Generating intelligence summary...")

        summary = {
            "graph_overview": {
                "total_nodes": len(graph.nodes),
                "total_edges": len(graph.edges),
                "node_types": {},
                "relation_types": {},
                "analysis_timestamp": datetime.now().isoformat()
            },
            "key_findings": [],
            "threat_assessment": {
                "overall_threat_level": "MEDIUM",
                "confidence": 0.6,
                "high_priority_nodes": [],
                "recommended_actions": []
            },
            "intelligence_gaps": [],
            "collection_priorities": []
        }

        # Count node types
        for node in graph.nodes:
            node_type = node.node_type.value
            summary["graph_overview"]["node_types"][node_type] = \
                summary["graph_overview"]["node_types"].get(node_type, 0) + 1

        # Count relation types
        for edge in graph.edges:
            rel_type = edge.relation_type.value
            summary["graph_overview"]["relation_types"][rel_type] = \
                summary["graph_overview"]["relation_types"].get(rel_type, 0) + 1

        # Extract key findings from analysis
        if analysis.get("status") == "success":
            analysis_results = analysis.get("analysis", {})

            # High-threat nodes
            high_threat = analysis_results.get("high_threat_nodes", [])
            if high_threat:
                summary["key_findings"].append({
                    "type": "high_threat_detection",
                    "description": f"Detected {len(high_threat)} high-threat entities",
                    "details": high_threat[:5]  # Top 5
                })

            # High centrality nodes
            high_centrality = analysis_results.get("high_centrality_nodes", [])
            if high_centrality:
                summary["key_findings"].append({
                    "type": "key_entities",
                    "description": f"Identified {len(high_centrality)} key entities with high influence",
                    "details": high_centrality[:5]
                })

        # Threat assessment
        threat_indicators = len(analysis.get("analysis", {}).get("high_threat_nodes", []))
        if threat_indicators > 5:
            summary["threat_assessment"]["overall_threat_level"] = "HIGH"
            summary["threat_assessment"]["confidence"] = 0.8
        elif threat_indicators > 2:
            summary["threat_assessment"]["overall_threat_level"] = "ELEVATED"
            summary["threat_assessment"]["confidence"] = 0.7

        return summary

    async def run_complete_analysis(self) -> Dict[str, Any]:
        """Run complete GNN OSINT analysis pipeline"""
        logger.info("🚀 Starting complete GNN OSINT analysis pipeline...")

        try:
            # Step 1: Collect nodes from all sources
            all_nodes = []

            # ABE Drop Zone intelligence
            abe_nodes = await self.process_abe_intelligence()
            all_nodes.extend(abe_nodes)

            # Existing OSINT extractors
            osint_nodes = await self.integrate_existing_osint()
            all_nodes.extend(osint_nodes)

            # Cybersecurity intelligence
            cyber_nodes = await self.create_graph_from_cybersec_intel()
            all_nodes.extend(cyber_nodes)

            if not all_nodes:
                logger.warning("No nodes found for analysis")
                return {"status": "no_data", "message": "No OSINT nodes found"}

            # Step 2: Detect relationships
            edges = self.detect_relationships(all_nodes)

            # Step 3: Create graph
            graph = OSINTGraph(
                graph_id=f"OSINT-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
                nodes=all_nodes,
                edges=edges,
                metadata={
                    "creation_method": "gnn_osint_pipeline",
                    "node_sources": ["abe", "osint_extractors", "cybersec_intel"],
                    "processing_mode": self.processing_mode.value
                },
                created_timestamp=datetime.now()
            )

            self.current_graph = graph

            # Step 4: Perform neural analysis
            analysis_results = await self.perform_neural_analysis(graph)

            # Step 5: Generate intelligence summary
            summary = await self.generate_intelligence_summary(graph, analysis_results)

            # Step 6: Store results
            await self.store_analysis_results(graph, analysis_results, summary)

            logger.info("✅ Complete GNN OSINT analysis pipeline finished")
            logger.info(f"   Processed {len(all_nodes)} nodes and {len(edges)} edges")

            return {
                "status": "success",
                "graph": graph,
                "analysis": analysis_results,
                "summary": summary,
                "processing_mode": self.processing_mode.value
            }

        except Exception as e:
            logger.error(f"GNN OSINT analysis pipeline failed: {e}")
            return {"status": "failed", "error": str(e)}

    async def store_analysis_results(self, graph: OSINTGraph, analysis: Dict[str, Any], summary: Dict[str, Any]):
        """Store analysis results in database"""
        logger.info("💾 Storing analysis results...")

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        try:
            # Store nodes
            for node in graph.nodes:
                cursor.execute('''
                    INSERT OR REPLACE INTO osint_nodes
                    (node_id, node_type, name, description, properties, confidence_score,
                     source_reliability, collection_timestamp, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    node.node_id,
                    node.node_type.value,
                    node.name,
                    node.description,
                    json.dumps(node.properties),
                    node.confidence_score,
                    node.source_reliability,
                    node.collection_timestamp.isoformat(),
                    node.last_updated.isoformat()
                ))

            # Store edges
            for edge in graph.edges:
                cursor.execute('''
                    INSERT OR REPLACE INTO osint_edges
                    (edge_id, source_node_id, target_node_id, relation_type, weight,
                     confidence, evidence, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    edge.edge_id,
                    edge.source_node_id,
                    edge.target_node_id,
                    edge.relation_type.value,
                    edge.weight,
                    edge.confidence,
                    json.dumps(edge.evidence),
                    json.dumps(edge.metadata)
                ))

            # Store analysis results
            cursor.execute('''
                INSERT INTO neural_analysis
                (graph_id, analysis_type, results, processing_mode, model_version, created_timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                graph.graph_id,
                "gnn_osint_analysis",
                json.dumps({"analysis": analysis, "summary": summary}),
                self.processing_mode.value,
                "gnn_osint_v1.0",
                datetime.now().isoformat()
            ))

            conn.commit()
            logger.info("✅ Analysis results stored successfully")

        except Exception as e:
            logger.error(f"Error storing analysis results: {e}")

        finally:
            conn.close()

# Configuration
GNN_OSINT_CONFIG = {
    "processing_mode": GNNProcessingMode.HYBRID.value,
    "model_config": {
        "input_dim": 512,
        "hidden_dim": 256,
        "output_dim": 128,
        "num_layers": 3
    },
    "high_gpu_endpoint": "http://localhost:18100",
    "abe_integration": True,
    "existing_osint_integration": True,
    "cybersec_intel_integration": True
}

async def main():
    """Main function for GNN OSINT Intelligence System"""
    logger.info("🕷️ Starting GNN OSINT Intelligence System")
    logger.info("=" * 60)

    # Initialize GNN OSINT system
    gnn_osint = GNNOSINTIntelligence()

    # Run complete analysis pipeline
    results = await gnn_osint.run_complete_analysis()

    if results["status"] == "success":
        summary = results["summary"]
        logger.info("\n📊 OSINT Intelligence Summary:")
        logger.info(f"   Graph: {summary['graph_overview']['total_nodes']} nodes, {summary['graph_overview']['total_edges']} edges")
        logger.info(f"   Threat Level: {summary['threat_assessment']['overall_threat_level']}")
        logger.info(f"   Key Findings: {len(summary['key_findings'])}")
        logger.info(f"   Processing Mode: {results['processing_mode']}")
    else:
        logger.error(f"Analysis failed: {results.get('error', 'Unknown error')}")

    return results

if __name__ == "__main__":
    asyncio.run(main())