# 🛰️ ZOE: Critical Infrastructure API Collection Mission

**Date:** November 9, 2025  
**Agent:** Zoe (Orbital Operations Specialist)  
**Mission:** Collect all open-source APIs for critical infrastructure mapping

---

## 🎯 MISSION OBJECTIVES

Collect APIs and data sources for:
1. **Power Grid** (electrical infrastructure)
2. **Internet Backbone** (BGP, ASN, peering points)
3. **Submarine Cable Landing Stations** (undersea fiber optics)
4. **Critical Infrastructure** (targets for scenario modeling)

---

## 📡 TARGET APIs & DATA SOURCES

### **1. POWER GRID**

**EIA (U.S. Energy Information Administration)**
- API: https://www.eia.gov/opendata/
- Data: Power plants, transmission lines, substations
- Format: JSON, XML
- Auth: Free API key
- Coverage: U.S. nationwide

**GridStatus**
- API: https://www.gridstatus.io/
- Data: Real-time grid status, ISO/RTO data
- Format: JSON
- Auth: API key required
- Coverage: U.S. grid operators

**OpenInfra Map**
- Source: https://openinframap.org/
- Data: Power lines, substations (OpenStreetMap)
- Format: GeoJSON, Overpass API
- Auth: None (OSM data)
- Coverage: Global

**HIFLD (Homeland Infrastructure Foundation-Level Data)**
- Source: https://hifld-geoplatform.opendata.arcgis.com/
- Data: Power plants, substations, transmission
- Format: GeoJSON, Shapefile
- Auth: None (open data)
- Coverage: U.S. critical infrastructure

---

### **2. INTERNET BACKBONE**

**BGPView**
- API: https://bgpview.io/api
- Data: ASN, prefixes, peers, upstreams
- Format: JSON
- Auth: None (rate-limited)
- Coverage: Global BGP routing

**PeeringDB**
- API: https://www.peeringdb.com/api/
- Data: Internet exchanges, facilities, networks
- Format: JSON
- Auth: API key (free)
- Coverage: Global peering infrastructure

**RIPE Stat**
- API: https://stat.ripe.net/docs/data_api
- Data: BGP, DNS, geolocation, routing
- Format: JSON
- Auth: None
- Coverage: Global (RIPE focus)

**Hurricane Electric BGP Toolkit**
- Source: https://bgp.he.net/
- Data: ASN info, prefixes, peering
- Format: HTML (scraping required)
- Auth: None
- Coverage: Global

**Cloudflare Radar**
- API: https://developers.cloudflare.com/radar/
- Data: Internet traffic, attacks, outages
- Format: JSON
- Auth: API key (free)
- Coverage: Global

---

### **3. SUBMARINE CABLE LANDING STATIONS**

**TeleGeography Submarine Cable Map**
- Source: https://www.submarinecablemap.com/
- Data: Cables, landing points, capacity
- Format: GeoJSON (via API or scraping)
- Auth: None (public map)
- Coverage: Global undersea cables

**Infrapedia**
- API: https://www.infrapedia.com/
- Data: Cables, data centers, networks
- Format: JSON
- Auth: API key (free tier)
- Coverage: Global telecom infrastructure

**ISCPC (International Submarine Cable Protection Committee)**
- Source: https://www.iscpc.org/
- Data: Cable routes, protection zones
- Format: PDF reports, maps
- Auth: None (public data)
- Coverage: Global

**Greg's Cable Map**
- Source: https://www.cablemap.info/
- Data: Historical and current cables
- Format: KML, GeoJSON
- Auth: None
- Coverage: Global

---

### **4. CRITICAL INFRASTRUCTURE (GENERAL)**

**OpenStreetMap Overpass API**
- API: https://overpass-api.de/
- Data: All infrastructure (power, telecom, transport)
- Format: XML, JSON, GeoJSON
- Auth: None
- Coverage: Global crowdsourced

**Natural Earth Data**
- Source: https://www.naturalearthdata.com/
- Data: Borders, cities, infrastructure
- Format: Shapefile, GeoJSON
- Auth: None
- Coverage: Global

**USGS (U.S. Geological Survey)**
- API: https://www.usgs.gov/products/data-and-tools/apis
- Data: Dams, pipelines, facilities
- Format: JSON, GeoJSON
- Auth: None
- Coverage: U.S.

**Global Energy Observatory**
- Source: http://globalenergyobservatory.org/
- Data: Power plants, transmission
- Format: CSV, KML
- Auth: None
- Coverage: Global

---

## 🗺️ GOOGLE EARTH ENGINE (GEE) INTEGRATION

**GEE Datasets for Infrastructure:**
1. **VIIRS Nighttime Lights** - Power grid activity
2. **Sentinel-2** - High-res satellite imagery
3. **Landsat** - Historical infrastructure changes
4. **SRTM DEM** - Terrain for cable/power routing
5. **Global Human Settlement Layer** - Urban infrastructure

**GEE API:**
- Python: `earthengine-api`
- JavaScript: Earth Engine Code Editor
- Auth: Google Cloud service account
- Cost: Free tier (250GB/month), then pay-as-you-go

---

## 📊 DELIVERABLES

**For each API/source:**
1. ✅ API endpoint/URL
2. ✅ Authentication method
3. ✅ Data format
4. ✅ Sample query
5. ✅ Rate limits
6. ✅ Coverage area
7. ✅ Hash all data (SCH + USIM headers)
8. ✅ Store in SurrealDB (geospatial nodes)
9. ✅ Link to CTAS tasks (target selection)

**Output Format:**
```json
{
  "infrastructure_type": "power_grid",
  "source": "EIA",
  "api_url": "https://api.eia.gov/...",
  "entities": [
    {
      "hash": "SCH+CUID+UUID",
      "type": "power_plant",
      "name": "Indian Point Nuclear",
      "location": {"lat": 41.27, "lon": -73.95},
      "capacity_mw": 2000,
      "usim_header": {...},
      "ctas_tasks": ["1.3.4", "1.3.6"],
      "scenario_relevance": ["nuclear_scenario", "power_grid_attack"]
    }
  ]
}
```

---

## 🎯 SCENARIO INTEGRATION

**Link infrastructure to scenarios:**
- **Bio Scenario** → Healthcare facilities, water treatment, food supply
- **Nuclear Scenario** → Nuclear plants, fuel cycle, proliferation
- **Cyber Scenario** → Internet exchanges, data centers, cables
- **Physical Scenario** → Power substations, bridges, tunnels

**For Frontline Narrative:**
> "There are 327 submarine cable landing stations worldwide. 
> 99% of intercontinental internet traffic flows through them. 
> A coordinated attack on just 10 stations could isolate entire continents."

---

## ⚡ EXECUTION PRIORITY

1. **Submarine Cables** (TeleGeography, Infrapedia) - HIGH
2. **Power Grid** (EIA, HIFLD) - HIGH
3. **Internet Backbone** (BGPView, PeeringDB) - MEDIUM
4. **GEE Datasets** (Nighttime lights, Sentinel-2) - MEDIUM

**Timeline:** 24-48 hours for initial data collection

---

**Zoe, you have your orders. Report back with API status and initial data extracts.** 🛰️

