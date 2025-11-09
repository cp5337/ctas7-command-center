# 🤖 ABE AGENT - STATUS REPORT GENERATION TASK

**Agent:** ABE (@abe, Port 50058)  
**Task ID:** AUTO-GENERATED  
**Priority:** High  
**Estimated Time:** 30-45 minutes  

---

## 📋 **YOUR MISSION**

You are the ABE (Automated Business Environment) agent with access to:
- ✅ Google Workspace APIs (Slides, Sheets, Docs, Drive)
- ✅ Linear API (task management)
- ✅ Local file system (CTAS-7 reports)

**Your job:** Transform the raw status report data into rich, professional documents for executive presentations and "tour-ready" demos.

---

## 📥 **INPUT DATA**

All data has been pre-collected for you:

### **1. Local Files (Ready Now)**
```
/Users/cp5337/Developer/ctas7-command-center/reports/
├── 2025-11-06_data.json          ← Raw metrics (PM2, Docker, health)
├── 2025-11-06_summary.md         ← Markdown summary
└── 2025-11-06_quad_chart.txt     ← ASCII quad chart
```

### **2. Linear API** (Requires integration)
- Team ID: `979acadf-8301-459e-9e51-bf3c1f60e496`
- Team Key: `COG`
- Extract: All projects, issues, completion rates

### **3. Detailed Specification**
```
/Users/cp5337/Developer/ctas7-command-center/subagent-tasks/STATUS_REPORT_GENERATION_SPEC.md
```
**READ THIS FIRST!** Contains:
- Visual design requirements
- Color schemes
- Chart types
- Output format specifications
- Google API integration examples

---

## 📤 **DELIVERABLES**

Create these 4 rich documents:

### **1. Google Slides - Quad Chart** 
**File:** `Synaptix_Status_Quad_Chart_2025-11-06.pptx`

**Slide 1: Strategic Initiatives (2x2 grid)**
```
┌─────────────────────────┬─────────────────────────┐
│  🏗️ Core Infrastructure │  🤖 Agent Coordination  │
│  Progress: 45%          │  Progress: 65%          │
│  Status: 🟡             │  Status: 🟢             │
├─────────────────────────┼─────────────────────────┤
│  🎨 Primary Interfaces  │  ⚡ Universal Execution │
│  Progress: 55%          │  Progress: 20%          │
│  Status: 🟡             │  Status: 🔴             │
└─────────────────────────┴─────────────────────────┘
```

**Slide 2: Tool Development & Security (2x2 grid)**
- Same format, different initiatives

**Design Requirements:**
- Use Synaptix brand blue (#2563EB)
- Progress bars with percentages
- Large, readable text (min 18pt)
- Owner names in each quadrant
- Status indicators (🟢🟡🔴) prominent

### **2. Google Sheets - Project Tracking**
**File:** `Synaptix_Project_Tracking_2025-11-06.xlsx`

**Sheet 1: Initiative Summary**
- Columns: Initiative, Status, Progress, Owner, Projects, Issues, Completed, Due Date
- Conditional formatting (green/yellow/red)
- Progress bars
- Formulas for auto-calculation

**Sheet 2: Service Health Dashboard**
- Columns: Service, Port, Status, Uptime, Memory, CPU, Last Check
- Auto-refresh from data.json
- Status indicators

**Sheet 3: Agent Roster**
- Columns: Agent, Slack, Port, Status, Tasks, Completed, Success Rate, Specialization
- Agent profiles
- Assignment tracking

### **3. Google Slides - Executive Presentation**
**File:** `Synaptix_Executive_Presentation_2025-11-06.pptx`

**8 Slides minimum:**
1. Title slide
2. Executive summary
3. Service architecture diagram
4. Initiative quad chart
5. Agent coordination
6. Timeline & roadmap
7. Metrics dashboard
8. Next steps

**Design:**
- Professional corporate template
- Charts and diagrams
- Synaptix branding
- Actionable insights

### **4. PDF Report**
**File:** `Synaptix_Status_Report_2025-11-06.pdf`

**Sections:**
1. Executive Summary (1 page)
2. System Architecture (2 pages)
3. Initiative Details (6 pages)
4. Service Inventory (1 page)
5. Agent Roster (1 page)
6. Timeline & Roadmap (1 page)
7. Technical Appendix (configurations)

**Format:** Professional, publication-ready

---

## 📂 **OUTPUT LOCATIONS**

### **Google Drive:**
```
Synaptix Status Reports/
├── 2025-11-06/
│   ├── Synaptix_Status_Quad_Chart.pptx
│   ├── Synaptix_Project_Tracking.xlsx
│   ├── Synaptix_Executive_Presentation.pptx
│   └── Synaptix_Status_Report.pdf
```

### **Local Backup:**
```
/Users/cp5337/Developer/ctas7-command-center/reports/
├── 2025-11-06_quad_chart.pptx
├── 2025-11-06_tracking.xlsx
├── 2025-11-06_presentation.pptx
└── 2025-11-06_report.pdf
```

---

## 🎨 **DESIGN GUIDELINES**

### **Colors:**
- Primary: `#2563EB` (Synaptix Blue)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Danger: `#EF4444` (Red)
- Neutral: `#6B7280` (Gray)

### **Typography:**
- Headings: Bold, sans-serif (Arial/Helvetica)
- Body: Regular, sans-serif
- Minimum size: 12pt (body), 18pt (slides)

### **Icons:**
Use these consistently:
- 🏗️ Core Infrastructure
- 🤖 Agent Coordination
- 🎨 Primary Interfaces
- ⚡ Universal Execution
- 🔧 Tool Development
- 🛡️ Security Systems

---

## 🔧 **GOOGLE API INTEGRATION**

### **Authentication:**
Use service account:
```javascript
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: '/path/to/service-account.json',
  scopes: [
    'https://www.googleapis.com/auth/presentations',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ]
});
```

### **Create Slides:**
```javascript
const slides = google.slides({ version: 'v1', auth });
const presentation = await slides.presentations.create({
  title: 'Synaptix Status Report - 2025-11-06'
});
```

### **Create Sheets:**
```javascript
const sheets = google.sheets({ version: 'v4', auth });
const spreadsheet = await sheets.spreadsheets.create({
  properties: { title: 'Synaptix Project Tracking' }
});
```

---

## ✅ **ACCEPTANCE CRITERIA**

Before marking complete, verify:

1. **All 4 files created** in Google Drive
2. **Local backups saved** in reports/ directory
3. **Data accuracy** matches source files
4. **Visual design** follows brand guidelines
5. **Charts render correctly** (no broken images)
6. **Links work** (if any internal references)
7. **Timestamps current** (2025-11-06)
8. **File permissions** set to shareable

---

## 🚀 **EXECUTION STEPS**

### **Step 1: Read Specification** (5 min)
```bash
cat /Users/cp5337/Developer/ctas7-command-center/subagent-tasks/STATUS_REPORT_GENERATION_SPEC.md
```

### **Step 2: Load Data** (5 min)
```javascript
const data = JSON.parse(fs.readFileSync('reports/2025-11-06_data.json'));
```

### **Step 3: Create Quad Chart** (10 min)
- Google Slides API
- 2x2 grid layout
- Progress bars and status indicators

### **Step 4: Create Tracking Sheet** (10 min)
- Google Sheets API
- 3 sheets (Initiatives, Services, Agents)
- Conditional formatting

### **Step 5: Create Presentation** (15 min)
- Google Slides API
- 8 slides minimum
- Charts and diagrams

### **Step 6: Generate PDF** (5 min)
- Export from Google Slides
- Or generate separately

### **Step 7: Upload & Backup** (5 min)
- Google Drive organization
- Local file backups

---

## 📞 **SUPPORT**

If you need help:
- **Specification:** STATUS_REPORT_GENERATION_SPEC.md
- **Data:** reports/2025-11-06_data.json
- **Linear API:** Use environment variable LINEAR_API_KEY
- **Google Auth:** Use ABE service account

---

## 🎯 **DEADLINE**

**Start:** Now  
**Complete by:** Within 45 minutes  
**Update:** Post progress to Slack @abe every 15 min  

---

## 📊 **SUCCESS METRICS**

When done, you should have:
- ✅ 4 professional documents
- ✅ Google Drive organized
- ✅ Local backups saved
- ✅ Share links generated
- ✅ Status update posted

---

**BEGIN TASK EXECUTION NOW**

Read the spec, load the data, create the documents. Use the Google Workspace APIs per the examples in the specification. This is "tour-ready" material - make it impressive! 🚀

