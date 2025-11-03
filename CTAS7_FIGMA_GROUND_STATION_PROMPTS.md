# CTAS-7 Figma Ground Station Rack Design Prompts

Tesla/SpaceX/Apple Elite Standards - Presentation Assets

## Executive Summary

This document provides structured Figma prompts for generating high-quality line drawings and presentation assets for CTAS-7 ground station rack systems. These prompts are designed for use with the Figma MCP server to create professional-grade documentation and presentation materials.

## Design Specifications

### 1. Ground Station Rack Overview (OV-1 Style)

**Figma Prompt ID**: `CTAS7_RACK_OVERVIEW_OV1`

**Design Brief**: Create a clean, technical line drawing of a complete ground station rack system showing:

- 42U rack cabinet (2000mm height × 600mm width × 1000mm depth)
- Airbus/OneWeb modular architecture
- Cable management systems
- Power distribution units
- Network switching equipment
- Environmental controls
- Security modules

**Visual Style**:

- Minimalist Tesla/Apple aesthetic
- Monochromatic line art (stroke weight: 2-3px)
- Clear hierarchical information design
- Technical blueprint style with clean annotations
- IEEE 802.11 standard compliance indicators

**Components to Include**:

1. **Power Module** (Top 4U)

   - Redundant PSU units
   - UPS backup systems
   - Power distribution panels

2. **Network Module** (Middle 8U)

   - Core switching fabric
   - Optical transport modules
   - SDN controllers
   - Edge computing units

3. **Compute Module** (Middle 12U)

   - Intel Xeon servers
   - GPU acceleration cards
   - Storage arrays (NVMe/SSD)
   - Legion slot graph processors

4. **Storage Module** (Middle 8U)

   - SurrealDB cluster nodes
   - Sled KVS storage
   - Supabase sync modules
   - Hash verification units

5. **Environmental Module** (Middle 6U)

   - Thermal management
   - Humidity controls
   - Air filtration systems
   - Monitoring sensors

6. **Security Module** (Bottom 4U)
   - Hardware security modules (HSM)
   - Quantum key distribution units
   - Intrusion detection systems
   - Access control panels

### 2. Network Architecture Diagram (SV-1 Style)

**Figma Prompt ID**: `CTAS7_NETWORK_ARCHITECTURE_SV1`

**Design Brief**: Create a systems view showing interconnections between ground station components:

- Fiber optic connections to cable landing points
- Satellite uplink/downlink paths
- Terrestrial network integration
- Legion slot graph replication paths
- Multi-database synchronization flows

**Visual Elements**:

- Network topology with clear data flows
- Latency indicators (sub-1ms, 1-10ms, >10ms zones)
- Bandwidth specifications (1Gbps, 10Gbps, 100Gbps)
- Redundancy pathways
- Quantum-encrypted channels

### 3. Operational View (OV-3 Style)

**Figma Prompt ID**: `CTAS7_OPERATIONAL_VIEW_OV3`

**Design Brief**: Show information flows and operational procedures:

- Real-time telemetry processing
- NeuralMux cognitive operations
- Cesium visualization pipelines
- Multi-tenant GIS data flows
- Automated failover procedures

### 4. Technical Standards (TV-1 Style)

**Figma Prompt ID**: `CTAS7_TECHNICAL_STANDARDS_TV1`

**Design Brief**: Technical specification overlay showing:

- Airbus HALO standard compliance
- OneWeb ground segment integration
- IEEE 802.11 standards
- ITU-R frequency allocations
- CCSDS space data system standards

## Color Palette (Monochromatic Focus)

- **Primary**: #1E293B (Slate 800) - Main lines and text
- **Secondary**: #475569 (Slate 600) - Supporting elements
- **Accent**: #0EA5E9 (Sky 500) - Highlight connections
- **Background**: #F8FAFC (Slate 50) - Clean background
- **Grid**: #E2E8F0 (Slate 200) - Technical grid overlay

## Typography Standards

- **Headers**: SF Pro Display Bold, 24-32pt
- **Subheaders**: SF Pro Text Semibold, 16-20pt
- **Body Text**: SF Pro Text Regular, 12-14pt
- **Technical Labels**: SF Mono Medium, 10-12pt

## Layout Specifications

- **Canvas Size**: 1920×1080 (16:9 for presentations)
- **Margins**: 80px on all sides
- **Grid**: 8px base grid system
- **Component Spacing**: 24px between major elements
- **Annotation Spacing**: 16px from components

## Export Requirements

- **Format**: SVG (vector), PNG (high-res backup)
- **Resolution**: 300 DPI for print, 144 DPI for screen
- **Naming Convention**: `CTAS7_[TYPE]_[DATE]_[VERSION].svg`

## Integration Points

### Airbus HALO Ground Station Standards

Reference the following Airbus specifications:

- HALO terminal physical dimensions
- Thermal management requirements
- Power consumption profiles
- Network interface standards

### OneWeb Ground Segment Architecture

Incorporate OneWeb's modular design principles:

- Standardized rack mounting
- Hot-swappable components
- Automated monitoring systems
- Remote management capabilities

### Legion Slot Graph Visualization

Show Legion replication topology:

- Node-to-node connections
- Hash verification paths
- Consensus mechanisms
- Load balancing algorithms

## Figma MCP Commands

### Generate Complete Rack Diagram

```json
{
  "command": "generate_diagram",
  "prompt_id": "CTAS7_RACK_OVERVIEW_OV1",
  "output_format": "svg",
  "include_annotations": true,
  "style": "technical_blueprint"
}
```

### Generate Network Architecture

```json
{
  "command": "generate_diagram",
  "prompt_id": "CTAS7_NETWORK_ARCHITECTURE_SV1",
  "output_format": "svg",
  "include_data_flows": true,
  "style": "systems_view"
}
```

### Generate Presentation Slide Set

```json
{
  "command": "generate_presentation",
  "slides": [
    "CTAS7_RACK_OVERVIEW_OV1",
    "CTAS7_NETWORK_ARCHITECTURE_SV1",
    "CTAS7_OPERATIONAL_VIEW_OV3",
    "CTAS7_TECHNICAL_STANDARDS_TV1"
  ],
  "template": "apple_keynote_style",
  "output_format": "figma_frames"
}
```

## Quality Assurance Checklist

- [ ] All components properly labeled and dimensioned
- [ ] Consistent line weights and typography
- [ ] Proper information hierarchy
- [ ] Accessibility compliance (contrast, text size)
- [ ] Technical accuracy verification
- [ ] Brand consistency with Tesla/Apple standards
- [ ] Export quality verification (SVG scalability)

## References

- Airbus HALO Ground Station Technical Specifications
- OneWeb Ground Segment Architecture Guide
- IEEE 802.11 Standards Documentation
- CCSDS Space Data System Standards
- Tesla Design System Guidelines
- Apple Human Interface Guidelines
- SpaceX Engineering Drawing Standards

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-23  
**Approval**: CTAS-7 System Architecture Team  
**Classification**: Technical Design Documentation
