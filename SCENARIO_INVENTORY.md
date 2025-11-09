# 📚 CTAS Scenario Inventory

**Date:** November 9, 2025  
**Location:** Dell XPS (192.168.1.218) - `/Volumes/C Drive on Dell XPS/ctas-sceanrios/`

---

## 🎯 MASTER SCENARIO DOCUMENTS

### **DHS National Planning Scenarios (2006 - Original)**
- **File:** `Word Scenario/DHS - National Planning Scenarios March 2006.docx`
- **Size:** 2.4 MB
- **Description:** Original 15 DHS scenarios - the foundation

### **Scenario 27: Blue Dusk Black Sky**
- **File 1:** `Word Scenario/Scenario 27 Final.docx`
- **File 2:** `Word Scenario/ctas_sceanario_27_1_blue_dusk_black_sky.docx`
- **Description:** Converged multi-domain threat (Maritime hostage + Cyber attack on LaserLight satellites + Power grid ransomware + NYC traffic disruption)
- **Domains:** Kinetic, Cyber-Espionage, Cyber-Physical, Information Warfare
- **Actors:** Hezbollah, Sinaloa Cartel, PRC (Unit 61419), PRK

### **Other Key Scenarios**
- **Scenario 21:** `21 University Attack.docx`
- **Scenario 22:** `22 Fentanyl and Human Trafficing.docx`
- **Scenario 25:** `Scenario_25_Operation_CHIMERA_Timeline.docx`
- **Chemical Attack:** `Chemical Attack Scenario v2.0 13JAN19 1745 (with Table).docx`
- **Nuclear Attack:** `Nuclear Planning Sceanrio (Updated).docx` + `Nuclear Attack Scenario v2.0 13JAN19 1320 (with Table).docx`
- **LaserLight:** `Laser Light Scenario.docx`
- **Maritime/Air Cargo:** `Maritime and Air Cargo.docx`

---

## 📊 REAL-WORLD CYBER SCENARIOS (19 Total)

**Location:** `ctas_json scenarios-actual/` + `ctas_scenario_actual_monte_carlo/`

### **Kinetic Terrorism (9 scenarios)**
1. **Mumbai** - 2008 coordinated attacks
2. **Oct 7** - Hamas attack on Israel
3. **Sept 11** - 9/11 World Trade Center
4. **Bojinka** - 1995 airline bombing plot
5. **Moscow Theater** - 2002 hostage crisis
6. **London** - 7/7 bombings
7. **Madrid** - 2004 train bombings
8. **Paris** - 2015 coordinated attacks
9. **Dupont** - Chemical plant scenario

### **Cyber Warfare (10 scenarios)**
10. **Chimera** - Multi-domain convergence
11. **Crimea** - Russian annexation cyber ops
12. **Salt Typhoon** - Chinese APT telecom breach
13. **NotPetya** - Russian destructive malware (Ukraine power grid)
14. **Power Grid** - Cyber-physical infrastructure attack
15. **Bangladesh Bank** - $81M cyber heist (SWIFT)
16. **Sony** - North Korean destructive attack
17. **Volt Typhoon** - Chinese APT critical infrastructure
18. **OPM Breach** - Chinese theft of 21M personnel records
19. **WannaCry** - North Korean global ransomware

### **CSV Exports**
- `GPT_ctas_refined_scenarios_for-WOlfram.csv`
- `NPS_Scenarios_for_Grok.csv`
- `ctas_refined_scenarios2.csv`
- `modernized_top_5_nps_scenarios.csv`

### **Monte Carlo Data**
- `Randoms for Blue Dust v1.csv`
- `RandomsforBlueDust v2.csv`
- All 19 scenarios have Monte Carlo simulation runs

### **Synthetic Scenarios**
- **Folder:** `ctas_scnario_synth_json/`
- **Zip:** `ctas_scnario_synth_json.zip`

---

## 🔧 CONFIGURATION & SUPPORT

### **PTCC Configs**
- **Folder:** `ctas_ptcc_configs/` (empty - needs population)

### **SCH (Semantic Content Hash)**
- **Folder:** `SCH/`

### **White Papers**
- **Folder:** `6.4 White Paper/`

### **NIEM Integration**
- **Folder:** `NIEM/`

---

## 📝 DOCUMENTATION

### **Prompts & Instructions**
- `GROK String About Scenarios.docx`
- `GROK String with Tech Description.docx`
- `Grok Prompt for NPS.docx`
- `GROK Prompt with certain scenarios.docx`
- `Planning Sceanario Prompt.docx`
- `New NPS Prompt.docx`

### **Technical Docs**
- `Backend Integration (Working)`
- `Backend Integration.docx`
- `Backend Refactor List`
- `CTAS_Hashing_Schema v6.4.1.docx`
- `Hashing and UDP.docx`

### **Operational Docs**
- `MISSION CONTEXT.docx`
- `Phase 1.docx`
- `CLI Strategic Layer to Tactical Ops.docx`
- `CTAS - Command Line v6.4.docx`

---

## 🚨 CRITICAL INTEL DOCS

### **Real-World Cases**
- `CITIGROUP CASING REPORT - UFOUO.pdf` (137 KB)
- `gov.uscourts.nyed.296434.29.0.pdf` (69 KB)
- `gov.uscourts.vaed.267725.3.0.pdf` (316 KB)
- `WTC1.docx`

### **Adversary Profiles**
- `Vulnerability_profiles_adversry_NSA_tools.json`

---

## 📦 ARCHIVES & BUNDLES

- `Word Scenario.zip` (3.3 MB) - All scenario Word docs
- `Scenario Clean Up 1 to 22 Grok.zip`
- `dataverse_files.zip`
- `ctas_payload_core_bundle.zip`

---

## 🎯 NEXT ACTIONS

1. **Extract all scenarios** from zips to ABE for GPU processing
2. **Parse PTCC configs** (currently empty folder)
3. **Map scenarios to 165 CTAS tasks**
4. **Identify drone/UAV tooling** from Nyx-Trace
5. **Create scenario → task → tool mappings**
6. **Build scenario activation triggers** for lazy loading

---

**DO NOT modify scenario files directly. Work from copies in ABE.**

