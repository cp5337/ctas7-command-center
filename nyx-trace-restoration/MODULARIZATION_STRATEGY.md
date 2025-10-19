# NYX-TRACE Modularization Strategy
**Breaking Down 2000+ Line Files for Security Compliance**

## Classification
**UNCLASSIFIED//FOR OFFICIAL USE ONLY**

---

## Overview

The original NYX-TRACE system contains several monolithic files exceeding 2000 lines, which violates government security review standards. This document provides a systematic approach to decompose these files into security-compliant modules.

**Security Review Threshold**: 500 lines maximum per module
**Optimal Target**: 200-300 lines per module
**Comment Density**: Minimum 15% for security documentation

---

## Part 1: File Inventory & Decomposition Targets

### Primary Targets (From NYX Original System)

1. **main_dashboard.py** (~2,800 lines)
   - Current: Monolithic Streamlit dashboard
   - Target: 8-10 focused modules

2. **criminal_network_analyzer.py** (~2,100 lines)
   - Current: All-in-one network analysis
   - Target: 6-8 specialized analyzers

3. **network_analysis_core.py** (~1,900 lines)
   - Current: Core network algorithms
   - Target: 5-7 algorithm modules

4. **data_sources/osint_investigation.py** (~1,500 lines)
   - Current: Combined OSINT collection
   - Target: 4-5 source-specific collectors

---

## Part 2: main_dashboard.py Decomposition

### 2.1 Current Structure Analysis

**Line Breakdown**:
- Lines 1-100: Imports and configuration
- Lines 101-500: Dashboard layout and UI components
- Lines 501-1000: Data loading and processing
- Lines 1001-1500: Visualization generation
- Lines 1501-2000: Interactive controls and callbacks
- Lines 2001-2500: Data export and reporting
- Lines 2501-2800: Utility functions and helpers

### 2.2 Decomposition Plan

#### Module 1: dashboard_config.py (~150 lines)
```python
"""
Dashboard Configuration Module
Classification: UNCLASSIFIED
Purpose: Centralized configuration for CTAS 7.0 NYX dashboard
"""

import streamlit as st
from typing import Dict, Any
from pathlib import Path

class DashboardConfig:
    """Configuration manager for NYX dashboard"""

    # Classification settings
    CLASSIFICATION_LEVEL = "UNCLASSIFIED"
    HANDLING_RESTRICTIONS = "FOUO"

    # UI Theme
    THEME = {
        'background': '#0E1117',
        'foreground': '#FAFAFA',
        'primary': '#FF4B4B',
        'secondary': '#262730',
    }

    # Page layout
    PAGE_CONFIG = {
        'page_title': 'CTAS 7.0 NYX Intelligence Center',
        'layout': 'wide',
        'initial_sidebar_state': 'expanded',
    }

    # Data refresh intervals (seconds)
    REFRESH_INTERVALS = {
        'real_time': 5,
        'frequent': 30,
        'moderate': 300,
        'infrequent': 3600,
    }

    @staticmethod
    def apply_page_config():
        """Apply Streamlit page configuration"""
        st.set_page_config(**DashboardConfig.PAGE_CONFIG)

    @staticmethod
    def apply_custom_css():
        """Apply custom CSS theme"""
        # Implementation
        pass
```

#### Module 2: dashboard_layout.py (~200 lines)
```python
"""
Dashboard Layout Module
Classification: UNCLASSIFIED
Purpose: Defines UI layout structure for intelligence dashboard
"""

import streamlit as st
from typing import List, Optional
from dataclasses import dataclass

@dataclass
class LayoutSection:
    """Defines a dashboard layout section"""
    title: str
    columns: List[int]
    classification: str = "UNCLASSIFIED"

class DashboardLayout:
    """Manages dashboard layout and structure"""

    def __init__(self):
        self.sections: List[LayoutSection] = []

    def create_header(self, title: str, classification: str):
        """Create classified header"""
        col1, col2 = st.columns([4, 1])
        with col1:
            st.title(title)
        with col2:
            st.markdown(f"**{classification}**")

    def create_intelligence_grid(
        self,
        columns: int = 3
    ) -> List[st.delta_generator.DeltaGenerator]:
        """Create grid layout for intelligence cards"""
        return st.columns(columns)

    def create_map_section(self):
        """Create geospatial intelligence section"""
        st.header("Geospatial Intelligence")
        return st.container()

    def create_timeline_section(self):
        """Create temporal analysis section"""
        st.header("Temporal Analysis")
        return st.container()

    def create_network_section(self):
        """Create network analysis section"""
        st.header("Network Analysis")
        return st.container()
```

#### Module 3: data_loaders.py (~250 lines)
```python
"""
Data Loading Module
Classification: UNCLASSIFIED
Purpose: Handles data loading from various intelligence sources
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class IntelligenceDataLoader:
    """Loads intelligence data from multiple sources"""

    def __init__(self, cache_enabled: bool = True):
        self.cache_enabled = cache_enabled
        self._cache: Dict[str, pd.DataFrame] = {}

    def load_entity_data(
        self,
        source: str,
        filters: Optional[Dict] = None
    ) -> pd.DataFrame:
        """Load entity intelligence data"""
        # Check cache
        cache_key = f"entities_{source}"
        if self.cache_enabled and cache_key in self._cache:
            logger.info(f"Loading {source} from cache")
            return self._cache[cache_key]

        # Load from source
        data = self._load_from_source(source)

        # Apply filters
        if filters:
            data = self._apply_filters(data, filters)

        # Cache and return
        if self.cache_enabled:
            self._cache[cache_key] = data

        return data

    def load_geospatial_data(
        self,
        area: str,
        layer_type: str
    ) -> pd.DataFrame:
        """Load geospatial intelligence data"""
        # Implementation
        pass

    def load_network_data(
        self,
        network_id: str
    ) -> Dict[str, Any]:
        """Load network relationship data"""
        # Implementation
        pass

    def _load_from_source(self, source: str) -> pd.DataFrame:
        """Internal method to load from data source"""
        # Implementation
        pass

    def _apply_filters(
        self,
        data: pd.DataFrame,
        filters: Dict
    ) -> pd.DataFrame:
        """Apply data filters"""
        # Implementation
        pass
```

#### Module 4: visualization_generators.py (~300 lines)
```python
"""
Visualization Generation Module
Classification: UNCLASSIFIED
Purpose: Generates intelligence visualizations
"""

import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
from typing import Dict, List, Optional

class IntelligenceVisualizer:
    """Generates intelligence visualizations"""

    def __init__(self, theme: Dict[str, str]):
        self.theme = theme

    def create_entity_network_graph(
        self,
        nodes: pd.DataFrame,
        edges: pd.DataFrame,
        highlight_nodes: Optional[List[str]] = None
    ) -> go.Figure:
        """Create entity relationship network graph"""
        # Implementation
        pass

    def create_geospatial_heatmap(
        self,
        locations: pd.DataFrame,
        metric: str
    ) -> go.Figure:
        """Create geospatial intelligence heatmap"""
        # Implementation
        pass

    def create_temporal_timeline(
        self,
        events: pd.DataFrame,
        color_by: str = 'category'
    ) -> go.Figure:
        """Create temporal analysis timeline"""
        # Implementation
        pass

    def create_sentiment_chart(
        self,
        sentiment_data: pd.DataFrame
    ) -> go.Figure:
        """Create sentiment analysis visualization"""
        # Implementation
        pass

    def create_threat_matrix(
        self,
        threats: pd.DataFrame
    ) -> go.Figure:
        """Create threat assessment matrix"""
        # Implementation
        pass
```

#### Module 5: interactive_controls.py (~200 lines)
```python
"""
Interactive Controls Module
Classification: UNCLASSIFIED
Purpose: Handles user interactions and controls
"""

import streamlit as st
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

class InteractiveControls:
    """Manages interactive dashboard controls"""

    def __init__(self):
        self.filters: Dict[str, Any] = {}

    def create_time_range_selector(
        self,
        default_range: int = 7
    ) -> tuple[datetime, datetime]:
        """Create time range selection controls"""
        col1, col2 = st.columns(2)
        with col1:
            start_date = st.date_input(
                "Start Date",
                value=datetime.now() - timedelta(days=default_range)
            )
        with col2:
            end_date = st.date_input(
                "End Date",
                value=datetime.now()
            )
        return start_date, end_date

    def create_classification_filter(
        self,
        available_levels: List[str]
    ) -> List[str]:
        """Create classification level filter"""
        return st.multiselect(
            "Classification Levels",
            available_levels,
            default=available_levels
        )

    def create_entity_filter(
        self,
        entity_types: List[str]
    ) -> List[str]:
        """Create entity type filter"""
        return st.multiselect(
            "Entity Types",
            entity_types,
            default=entity_types
        )

    def create_geospatial_bounds_selector(self):
        """Create geographic bounds selector"""
        # Implementation
        pass

    def create_network_depth_selector(
        self,
        max_depth: int = 5
    ) -> int:
        """Create network traversal depth selector"""
        return st.slider(
            "Network Depth",
            min_value=1,
            max_value=max_depth,
            value=2
        )
```

#### Module 6: data_exporters.py (~150 lines)
```python
"""
Data Export Module
Classification: UNCLASSIFIED
Purpose: Exports intelligence data in various formats
"""

import pandas as pd
from pathlib import Path
from typing import Dict, Any
import json

class IntelligenceExporter:
    """Exports intelligence data"""

    EXPORT_FORMATS = ['csv', 'json', 'excel', 'pdf']

    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def export_to_csv(
        self,
        data: pd.DataFrame,
        filename: str,
        classification: str = "UNCLASSIFIED"
    ) -> Path:
        """Export data to CSV with classification header"""
        output_path = self.output_dir / f"{filename}.csv"

        # Add classification header
        with output_path.open('w') as f:
            f.write(f"# Classification: {classification}\n")
            data.to_csv(f, index=False)

        return output_path

    def export_to_json(
        self,
        data: Dict[str, Any],
        filename: str,
        classification: str = "UNCLASSIFIED"
    ) -> Path:
        """Export data to JSON with metadata"""
        output_path = self.output_dir / f"{filename}.json"

        export_data = {
            'metadata': {
                'classification': classification,
                'timestamp': str(pd.Timestamp.now()),
            },
            'data': data
        }

        with output_path.open('w') as f:
            json.dump(export_data, f, indent=2)

        return output_path

    def export_intelligence_report(
        self,
        report_data: Dict[str, Any],
        classification: str = "UNCLASSIFIED"
    ) -> Path:
        """Export comprehensive intelligence report"""
        # Implementation
        pass
```

#### Module 7: utility_functions.py (~200 lines)
```python
"""
Utility Functions Module
Classification: UNCLASSIFIED
Purpose: Shared utility functions for dashboard
"""

import pandas as pd
import numpy as np
from typing import Any, List, Dict, Optional
from datetime import datetime

def format_classification_header(classification: str) -> str:
    """Format classification header for display"""
    colors = {
        'UNCLASSIFIED': '#00FF00',
        'CONFIDENTIAL': '#0000FF',
        'SECRET': '#FF0000',
        'TOP SECRET': '#FF00FF',
    }
    color = colors.get(classification, '#FFFFFF')
    return f'<span style="color: {color}; font-weight: bold;">{classification}</span>'

def calculate_confidence_score(
    data: pd.DataFrame,
    method: str = 'default'
) -> float:
    """Calculate intelligence confidence score"""
    # Implementation
    pass

def aggregate_intelligence_sources(
    sources: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Aggregate data from multiple intelligence sources"""
    # Implementation
    pass

def sanitize_for_classification(
    data: Any,
    target_classification: str
) -> Any:
    """Sanitize data for specified classification level"""
    # Implementation
    pass

def generate_audit_log_entry(
    action: str,
    user: str,
    classification: str,
    details: Optional[Dict] = None
) -> Dict[str, Any]:
    """Generate audit log entry for intelligence operations"""
    return {
        'timestamp': datetime.now().isoformat(),
        'action': action,
        'user': user,
        'classification': classification,
        'details': details or {}
    }
```

#### Module 8: dashboard_main.py (~150 lines)
```python
"""
Main Dashboard Orchestrator
Classification: UNCLASSIFIED
Purpose: Orchestrates all dashboard components
"""

import streamlit as st
from dashboard_config import DashboardConfig
from dashboard_layout import DashboardLayout
from data_loaders import IntelligenceDataLoader
from visualization_generators import IntelligenceVisualizer
from interactive_controls import InteractiveControls
from data_exporters import IntelligenceExporter
from utility_functions import (
    format_classification_header,
    generate_audit_log_entry
)

def main():
    """Main dashboard entry point"""

    # Apply configuration
    DashboardConfig.apply_page_config()
    DashboardConfig.apply_custom_css()

    # Initialize components
    layout = DashboardLayout()
    data_loader = IntelligenceDataLoader()
    visualizer = IntelligenceVisualizer(DashboardConfig.THEME)
    controls = InteractiveControls()
    exporter = IntelligenceExporter(output_dir=Path('./exports'))

    # Create header
    layout.create_header(
        "CTAS 7.0 NYX Intelligence Center",
        DashboardConfig.CLASSIFICATION_LEVEL
    )

    # Create interactive controls
    with st.sidebar:
        st.header("Intelligence Controls")
        time_range = controls.create_time_range_selector()
        entity_filter = controls.create_entity_filter(['Person', 'Organization', 'Location'])

    # Load data
    entity_data = data_loader.load_entity_data(
        source='supabase',
        filters={'time_range': time_range}
    )

    # Create visualizations
    map_container = layout.create_map_section()
    with map_container:
        geo_data = data_loader.load_geospatial_data('global', 'entities')
        geo_viz = visualizer.create_geospatial_heatmap(geo_data, 'activity_level')
        st.plotly_chart(geo_viz, use_container_width=True)

    # Network analysis
    network_container = layout.create_network_section()
    with network_container:
        network_data = data_loader.load_network_data('primary')
        network_viz = visualizer.create_entity_network_graph(
            network_data['nodes'],
            network_data['edges']
        )
        st.plotly_chart(network_viz, use_container_width=True)

    # Audit logging
    log_entry = generate_audit_log_entry(
        action='dashboard_view',
        user=st.session_state.get('user', 'anonymous'),
        classification=DashboardConfig.CLASSIFICATION_LEVEL
    )

if __name__ == "__main__":
    main()
```

### 2.3 Decomposition Summary

**Before**: 1 file, 2,800 lines
**After**: 8 files, average 225 lines each

| Module | Lines | Purpose | Classification |
|--------|-------|---------|----------------|
| dashboard_config.py | 150 | Configuration | UNCLASSIFIED |
| dashboard_layout.py | 200 | UI layout | UNCLASSIFIED |
| data_loaders.py | 250 | Data loading | UNCLASSIFIED |
| visualization_generators.py | 300 | Visualizations | UNCLASSIFIED |
| interactive_controls.py | 200 | User controls | UNCLASSIFIED |
| data_exporters.py | 150 | Data export | UNCLASSIFIED |
| utility_functions.py | 200 | Utilities | UNCLASSIFIED |
| dashboard_main.py | 150 | Orchestration | UNCLASSIFIED |

---

## Part 3: criminal_network_analyzer.py Decomposition

### 3.1 Current Structure Analysis

**Purpose**: Analyzes criminal/adversary networks
**Line Breakdown**:
- Lines 1-200: Network data structures
- Lines 201-600: Graph algorithms
- Lines 601-1000: Community detection
- Lines 1001-1400: Pattern recognition
- Lines 1401-1800: Threat scoring
- Lines 1801-2100: Reporting and visualization

### 3.2 Decomposition Plan

#### Module 1: network_models.py (~200 lines)
```python
"""
Network Data Models
Classification: UNCLASSIFIED
Purpose: Data structures for network analysis
"""

from dataclasses import dataclass
from typing import List, Dict, Optional, Set
from datetime import datetime

@dataclass
class NetworkNode:
    """Represents an entity in the network"""
    id: str
    node_type: str  # person, organization, location, asset
    classification: str
    properties: Dict[str, any]
    last_updated: datetime

@dataclass
class NetworkEdge:
    """Represents a relationship between entities"""
    source_id: str
    target_id: str
    relationship_type: str
    weight: float
    confidence: float
    classification: str
    metadata: Dict[str, any]

@dataclass
class NetworkCommunity:
    """Represents a detected community/cluster"""
    community_id: str
    members: Set[str]
    cohesion_score: float
    threat_level: str
    classification: str

class NetworkGraph:
    """Container for network data"""

    def __init__(self):
        self.nodes: Dict[str, NetworkNode] = {}
        self.edges: List[NetworkEdge] = []
        self.communities: List[NetworkCommunity] = []

    def add_node(self, node: NetworkNode):
        """Add node to network"""
        self.nodes[node.id] = node

    def add_edge(self, edge: NetworkEdge):
        """Add edge to network"""
        self.edges.append(edge)

    def get_neighbors(self, node_id: str) -> List[str]:
        """Get neighboring nodes"""
        return [
            e.target_id if e.source_id == node_id else e.source_id
            for e in self.edges
            if node_id in (e.source_id, e.target_id)
        ]
```

#### Module 2: graph_algorithms.py (~250 lines)
```python
"""
Graph Algorithms Module
Classification: UNCLASSIFIED
Purpose: Core graph analysis algorithms
"""

import networkx as nx
from typing import List, Dict, Set, Tuple
from network_models import NetworkGraph, NetworkNode, NetworkEdge

class GraphAlgorithms:
    """Core graph analysis algorithms"""

    @staticmethod
    def calculate_centrality(
        graph: NetworkGraph,
        method: str = 'betweenness'
    ) -> Dict[str, float]:
        """Calculate node centrality scores"""
        # Convert to NetworkX graph
        G = GraphAlgorithms._to_networkx(graph)

        if method == 'betweenness':
            return nx.betweenness_centrality(G)
        elif method == 'degree':
            return nx.degree_centrality(G)
        elif method == 'eigenvector':
            return nx.eigenvector_centrality(G)
        else:
            raise ValueError(f"Unknown centrality method: {method}")

    @staticmethod
    def find_shortest_paths(
        graph: NetworkGraph,
        source: str,
        target: str
    ) -> List[List[str]]:
        """Find shortest paths between nodes"""
        G = GraphAlgorithms._to_networkx(graph)
        try:
            paths = list(nx.all_shortest_paths(G, source, target))
            return paths
        except nx.NetworkXNoPath:
            return []

    @staticmethod
    def detect_cycles(graph: NetworkGraph) -> List[List[str]]:
        """Detect cycles in the network"""
        G = GraphAlgorithms._to_networkx(graph)
        return list(nx.simple_cycles(G))

    @staticmethod
    def calculate_clustering_coefficient(
        graph: NetworkGraph
    ) -> Dict[str, float]:
        """Calculate clustering coefficients"""
        G = GraphAlgorithms._to_networkx(graph)
        return nx.clustering(G)

    @staticmethod
    def _to_networkx(graph: NetworkGraph) -> nx.Graph:
        """Convert internal graph to NetworkX"""
        G = nx.Graph()
        for node_id, node in graph.nodes.items():
            G.add_node(node_id, **node.properties)
        for edge in graph.edges:
            G.add_edge(
                edge.source_id,
                edge.target_id,
                weight=edge.weight
            )
        return G
```

#### Module 3: community_detection.py (~300 lines)
```python
"""
Community Detection Module
Classification: UNCLASSIFIED
Purpose: Detects communities and clusters in networks
"""

import networkx as nx
from typing import List, Dict, Set
from network_models import NetworkGraph, NetworkCommunity

class CommunityDetector:
    """Detects communities in criminal/adversary networks"""

    def __init__(self, min_community_size: int = 3):
        self.min_community_size = min_community_size

    def detect_communities(
        self,
        graph: NetworkGraph,
        algorithm: str = 'louvain'
    ) -> List[NetworkCommunity]:
        """Detect communities using specified algorithm"""
        G = self._to_networkx(graph)

        if algorithm == 'louvain':
            communities = self._louvain_detection(G)
        elif algorithm == 'girvan_newman':
            communities = self._girvan_newman_detection(G)
        elif algorithm == 'label_propagation':
            communities = self._label_propagation_detection(G)
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")

        # Convert to NetworkCommunity objects
        return self._create_community_objects(communities, graph)

    def _louvain_detection(self, G: nx.Graph) -> List[Set[str]]:
        """Louvain community detection"""
        # Implementation
        pass

    def _girvan_newman_detection(self, G: nx.Graph) -> List[Set[str]]:
        """Girvan-Newman community detection"""
        # Implementation
        pass

    def _label_propagation_detection(self, G: nx.Graph) -> List[Set[str]]:
        """Label propagation community detection"""
        # Implementation
        pass

    def calculate_modularity(
        self,
        graph: NetworkGraph,
        communities: List[NetworkCommunity]
    ) -> float:
        """Calculate modularity score for community partitioning"""
        # Implementation
        pass

    def _create_community_objects(
        self,
        communities: List[Set[str]],
        graph: NetworkGraph
    ) -> List[NetworkCommunity]:
        """Create NetworkCommunity objects from detected communities"""
        # Implementation
        pass
```

#### Module 4: pattern_recognition.py (~300 lines)
```python
"""
Pattern Recognition Module
Classification: UNCLASSIFIED
Purpose: Identifies patterns in adversary networks
"""

from typing import List, Dict, Set, Tuple
from network_models import NetworkGraph, NetworkNode, NetworkEdge
import pandas as pd

class PatternRecognizer:
    """Recognizes patterns in adversary networks"""

    def __init__(self):
        self.known_patterns: Dict[str, List[str]] = {}

    def detect_hierarchical_structure(
        self,
        graph: NetworkGraph
    ) -> Dict[str, int]:
        """Detect hierarchical organizational structure"""
        # Identify levels in hierarchy
        # Return node_id -> level mapping
        pass

    def detect_hub_and_spoke(
        self,
        graph: NetworkGraph
    ) -> List[Tuple[str, List[str]]]:
        """Detect hub-and-spoke patterns"""
        # Identify hub nodes with many connections
        # Return (hub_id, spoke_ids) tuples
        pass

    def detect_chain_networks(
        self,
        graph: NetworkGraph
    ) -> List[List[str]]:
        """Detect chain/pipeline network patterns"""
        # Identify linear chains of nodes
        pass

    def detect_cell_structure(
        self,
        graph: NetworkGraph
    ) -> List[Set[str]]:
        """Detect compartmentalized cell structures"""
        # Identify loosely connected cells
        pass

    def identify_brokers(
        self,
        graph: NetworkGraph
    ) -> List[str]:
        """Identify broker nodes connecting communities"""
        # Find nodes with high betweenness centrality
        pass

    def detect_temporal_patterns(
        self,
        graph: NetworkGraph,
        time_window_days: int = 30
    ) -> pd.DataFrame:
        """Detect temporal activity patterns"""
        # Analyze time-based patterns in network activity
        pass
```

#### Module 5: threat_scoring.py (~250 lines)
```python
"""
Threat Scoring Module
Classification: UNCLASSIFIED
Purpose: Calculates threat scores for entities and networks
"""

from typing import Dict, List
from network_models import NetworkGraph, NetworkNode, NetworkCommunity
from dataclasses import dataclass

@dataclass
class ThreatScore:
    """Threat assessment score"""
    entity_id: str
    overall_score: float
    components: Dict[str, float]
    threat_level: str  # low, medium, high, critical
    confidence: float
    classification: str

class ThreatScorer:
    """Calculates threat scores for network entities"""

    THREAT_LEVELS = {
        (0.0, 0.25): 'low',
        (0.25, 0.50): 'medium',
        (0.50, 0.75): 'high',
        (0.75, 1.0): 'critical'
    }

    def calculate_node_threat(
        self,
        node: NetworkNode,
        graph: NetworkGraph
    ) -> ThreatScore:
        """Calculate threat score for individual node"""
        components = {
            'connectivity': self._score_connectivity(node, graph),
            'centrality': self._score_centrality(node, graph),
            'activity': self._score_activity(node),
            'associations': self._score_associations(node, graph),
        }

        overall = sum(components.values()) / len(components)
        threat_level = self._determine_threat_level(overall)

        return ThreatScore(
            entity_id=node.id,
            overall_score=overall,
            components=components,
            threat_level=threat_level,
            confidence=0.85,
            classification=node.classification
        )

    def calculate_community_threat(
        self,
        community: NetworkCommunity,
        graph: NetworkGraph
    ) -> ThreatScore:
        """Calculate threat score for entire community"""
        # Aggregate node threats
        # Consider community cohesion
        # Return community threat score
        pass

    def _score_connectivity(
        self,
        node: NetworkNode,
        graph: NetworkGraph
    ) -> float:
        """Score based on node connectivity"""
        neighbors = graph.get_neighbors(node.id)
        # Normalize and return score
        return min(len(neighbors) / 10.0, 1.0)

    def _score_centrality(
        self,
        node: NetworkNode,
        graph: NetworkGraph
    ) -> float:
        """Score based on network centrality"""
        # Calculate betweenness centrality
        # Return normalized score
        pass

    def _score_activity(self, node: NetworkNode) -> float:
        """Score based on entity activity level"""
        # Analyze recent activity
        # Return activity score
        pass

    def _score_associations(
        self,
        node: NetworkNode,
        graph: NetworkGraph
    ) -> float:
        """Score based on associations with known threats"""
        # Check connections to known threat actors
        # Return association score
        pass

    def _determine_threat_level(self, score: float) -> str:
        """Determine threat level from score"""
        for (low, high), level in self.THREAT_LEVELS.items():
            if low <= score < high:
                return level
        return 'critical'
```

#### Module 6: network_reporting.py (~200 lines)
```python
"""
Network Reporting Module
Classification: UNCLASSIFIED
Purpose: Generates intelligence reports on network analysis
"""

from typing import Dict, List, Any
from network_models import NetworkGraph, NetworkCommunity
from threat_scoring import ThreatScore
from datetime import datetime
import json

class NetworkReporter:
    """Generates intelligence reports on network analysis"""

    def generate_executive_summary(
        self,
        graph: NetworkGraph,
        communities: List[NetworkCommunity],
        threat_scores: List[ThreatScore]
    ) -> Dict[str, Any]:
        """Generate executive summary report"""
        return {
            'report_date': datetime.now().isoformat(),
            'classification': 'UNCLASSIFIED',
            'summary': {
                'total_entities': len(graph.nodes),
                'total_relationships': len(graph.edges),
                'communities_identified': len(communities),
                'high_threat_entities': len([
                    s for s in threat_scores
                    if s.threat_level in ['high', 'critical']
                ]),
            },
            'key_findings': self._extract_key_findings(
                graph, communities, threat_scores
            ),
            'recommendations': self._generate_recommendations(
                threat_scores
            )
        }

    def generate_detailed_report(
        self,
        graph: NetworkGraph,
        communities: List[NetworkCommunity],
        threat_scores: List[ThreatScore]
    ) -> Dict[str, Any]:
        """Generate detailed intelligence report"""
        # Comprehensive report with all analysis
        pass

    def export_to_json(
        self,
        report: Dict[str, Any],
        filename: str
    ):
        """Export report to JSON"""
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)

    def _extract_key_findings(
        self,
        graph: NetworkGraph,
        communities: List[NetworkCommunity],
        threat_scores: List[ThreatScore]
    ) -> List[str]:
        """Extract key findings from analysis"""
        findings = []
        # Analyze data and extract insights
        return findings

    def _generate_recommendations(
        self,
        threat_scores: List[ThreatScore]
    ) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        # Generate based on threat scores
        return recommendations
```

### 3.3 Decomposition Summary

**Before**: 1 file, 2,100 lines
**After**: 6 files, average 250 lines each

| Module | Lines | Purpose | Classification |
|--------|-------|---------|----------------|
| network_models.py | 200 | Data structures | UNCLASSIFIED |
| graph_algorithms.py | 250 | Core algorithms | UNCLASSIFIED |
| community_detection.py | 300 | Community detection | UNCLASSIFIED |
| pattern_recognition.py | 300 | Pattern detection | UNCLASSIFIED |
| threat_scoring.py | 250 | Threat assessment | UNCLASSIFIED |
| network_reporting.py | 200 | Report generation | UNCLASSIFIED |

---

## Part 4: Security Compliance Checklist

### 4.1 Per-Module Requirements

For each decomposed module:

- [ ] **File Header**: Classification markings present
- [ ] **Line Count**: Under 500 lines (optimal: 200-300)
- [ ] **Comment Density**: Minimum 15% documentation
- [ ] **Security Review**: Reviewed by security officer
- [ ] **Import Controls**: No unauthorized external dependencies
- [ ] **Data Classification**: All data properly classified
- [ ] **Audit Logging**: Security-relevant operations logged
- [ ] **Error Handling**: No information leakage in errors
- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **Output Sanitization**: Classification-appropriate output

### 4.2 Classification Header Template

```python
"""
Module: <module_name>
Classification: <UNCLASSIFIED|CONFIDENTIAL|SECRET|TOP SECRET>
Handling: <FOUO|NOFORN|ORCON|etc>

Purpose:
<Brief description of module purpose>

Security Notice:
This module processes <classification> intelligence data.
Appropriate clearance required for access and operation.

Maintainer: <name>
Last Security Review: <date>
Next Review Due: <date>

Distribution: Authorized personnel only
"""
```

### 4.3 Code Quality Standards

```python
# Good: Under line limit, well-documented
def calculate_threat_score(
    node: NetworkNode,
    graph: NetworkGraph
) -> ThreatScore:
    """
    Calculate threat score for network node

    Security: UNCLASSIFIED processing
    Args:
        node: Entity to assess
        graph: Network context

    Returns:
        Threat assessment score
    """
    # Implementation (< 50 lines)
    pass

# Bad: Over line limit, poor documentation
def do_everything(data):  # Too vague, no types
    # 500 lines of undocumented code
    pass
```

---

## Part 5: Implementation Timeline

### Week 1: Planning
- Review all target files
- Identify natural module boundaries
- Design module interfaces
- Create decomposition specs

### Week 2-3: Decomposition
- Decompose main_dashboard.py
- Decompose criminal_network_analyzer.py
- Add classification headers
- Implement module tests

### Week 4: Integration Testing
- Test module interactions
- Verify no functionality loss
- Performance testing
- Security review

### Week 5: Documentation
- Update architecture docs
- Create module dependency maps
- Write deployment guides
- Security compliance docs

---

## Part 6: Success Metrics

### Quantitative Metrics
- **Average Module Size**: <300 lines
- **Maximum Module Size**: <500 lines
- **Comment Density**: >15%
- **Test Coverage**: >80%

### Qualitative Metrics
- **Security Review**: Passed
- **Maintainability**: Improved (subjective assessment)
- **Understandability**: Improved (subjective assessment)
- **Deployability**: Improved (subjective assessment)

---

**END OF MODULARIZATION STRATEGY**
