# 📤 GOOGLE WORKSPACE INTEGRATION SETUP

Complete guide to upload Synaptix status reports to Google Drive, Sheets, and Slides.

---

## 🎯 **WHAT YOU'LL GET**

After setup, your status reports will automatically upload to Google Workspace:

- **Google Slides** - Beautiful quad chart presentation
- **Google Sheets** - Service tracking spreadsheet
- **Google Sheets** - Initiative tracking spreadsheet
- **Google Drive** - Organized folders by date

**All with shareable links for stakeholders!**

---

## ⚡ **QUICK START (5 Minutes)**

### **Option 1: Manual Upload (Fastest)**

No API setup needed - just upload directly:

```bash
# 1. Go to drive.google.com
# 2. Create folder: "Synaptix Status Reports"
# 3. Create subfolder: "2025-11-06"
# 4. Drag and drop files from reports/ folder
# 5. Right-click CSVs → "Open with" → "Google Sheets"
# 6. Open HTML quad chart → Select all → Copy
# 7. Create new Google Slides → Paste
```

**Files to upload:**
- `2025-11-06_quad_chart.html`
- `2025-11-06_services.csv`
- `2025-11-06_initiatives.csv`

---

## 🔐 **OPTION 2: AUTOMATED UPLOAD (Recommended)**

One-time setup for automatic uploads via API.

### **Step 1: Install Dependencies**

```bash
cd /Users/cp5337/Developer/ctas7-command-center
npm install googleapis
```

### **Step 2: Create Google Cloud Project**

1. Go to: https://console.cloud.google.com
2. Create new project: "Synaptix Status Reports"
3. Select the project

### **Step 3: Enable APIs**

```bash
# Enable these APIs in Google Cloud Console:
# - Google Drive API
# - Google Sheets API
# - Google Slides API
```

Or click "Enable APIs and Services" → Search and enable each.

### **Step 4: Create Service Account**

1. **IAM & Admin** → **Service Accounts**
2. **Create Service Account**
   - Name: `synaptix-reports`
   - Role: `Editor`
3. **Create Key**
   - Type: JSON
   - Download the credentials file

### **Step 5: Set Environment Variable**

```bash
# Add to ~/.zshrc or ~/.bashrc
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-credentials.json"

# Or add to .env file
echo "GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-credentials.json" >> .env

# Reload shell
source ~/.zshrc
```

### **Step 6: Run Upload Script**

```bash
cd /Users/cp5337/Developer/ctas7-command-center
node subagent-tasks/upload-to-google-workspace.cjs
```

**Output:**
```
✅ UPLOAD COMPLETE!

📂 Google Drive Folder:
   https://drive.google.com/drive/folders/XXXXX

📊 Google Sheets:
   Services: https://docs.google.com/spreadsheets/d/XXXXX
   Initiatives: https://docs.google.com/spreadsheets/d/XXXXX

🎨 Google Slides:
   Quad Chart: https://docs.google.com/presentation/d/XXXXX
```

---

## 📂 **FOLDER STRUCTURE**

```
Google Drive/
└── Synaptix Status Reports/
    ├── 2025-11-06/
    │   ├── Synaptix Quad Chart - 2025-11-06 (Slides)
    │   ├── Synaptix Services - 2025-11-06 (Sheets)
    │   └── Synaptix Initiatives - 2025-11-06 (Sheets)
    ├── 2025-11-13/
    └── 2025-11-20/
```

---

## 🔄 **AUTOMATED WEEKLY UPLOADS**

### **Cron Job (Runs every Monday 9am)**

```bash
# Edit crontab
crontab -e

# Add this line:
0 9 * * 1 cd /Users/cp5337/Developer/ctas7-command-center && node subagent-tasks/generate-status-report.cjs && node subagent-tasks/upload-to-google-workspace.cjs
```

### **Raycast Script**

Create: `raycast-scripts/synaptix-upload-google.sh`

```bash
#!/bin/bash

# @raycast.schemaVersion 1
# @raycast.title Upload to Google Workspace
# @raycast.mode fullOutput
# @raycast.packageName Synaptix CTAS-7
# @raycast.icon 📤

cd /Users/cp5337/Developer/ctas7-command-center
node subagent-tasks/generate-status-report.cjs
node subagent-tasks/upload-to-google-workspace.cjs
```

---

## 🎨 **CUSTOMIZATION**

### **Change Colors**

Edit `upload-to-google-workspace.cjs`:

```javascript
// Find this line and change RGB values:
backgroundColor: { red: 0.145, green: 0.388, blue: 0.922 }

// Synaptix Blue: rgb(37, 99, 235) = (0.145, 0.388, 0.922)
// Change to your brand color
```

### **Add More Slides**

In `createSlidesQuadChart()`, add more requests:

```javascript
{
  createShape: {
    objectId: 'newSlide',
    shapeType: 'TEXT_BOX',
    // ... properties
  }
}
```

### **Change Folder Name**

```javascript
const GOOGLE_FOLDER_NAME = 'Your Custom Folder Name';
```

---

## 🔗 **SHARING**

### **Share with Team**

1. Go to Google Drive folder
2. Click "Share"
3. Add team email addresses
4. Set permission: "Viewer" or "Editor"
5. Click "Send"

### **Get Public Link**

1. Right-click folder/file
2. "Get link"
3. Change to "Anyone with the link"
4. Copy link

### **Embed in Website**

```html
<!-- Embed Google Slides -->
<iframe 
  src="https://docs.google.com/presentation/d/YOUR_ID/embed?start=false&loop=false&delayms=3000"
  width="960" 
  height="569" 
  frameborder="0" 
  allowfullscreen="true">
</iframe>

<!-- Embed Google Sheets -->
<iframe 
  src="https://docs.google.com/spreadsheets/d/YOUR_ID/preview"
  width="100%" 
  height="600">
</iframe>
```

---

## 🐛 **TROUBLESHOOTING**

### **Error: Cannot find module 'googleapis'**
```bash
npm install googleapis
```

### **Error: GOOGLE_APPLICATION_CREDENTIALS not set**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
source ~/.zshrc
```

### **Error: Permission denied**
- Make sure APIs are enabled in Google Cloud Console
- Check service account has Editor role
- Verify credentials file path is correct

### **Error: File not found**
```bash
# Generate reports first
node subagent-tasks/generate-status-report.cjs
node subagent-tasks/abe-execute-status-report.cjs

# Then upload
node subagent-tasks/upload-to-google-workspace.cjs
```

### **CSVs not formatting correctly**
- Google Sheets should auto-detect CSV format
- If not, use "Import" → "Upload" → "Comma" separator

---

## 📊 **WHAT GETS UPLOADED**

### **Google Slides - Quad Chart**
- 4 quadrants (2x2 grid)
- Status indicators (🟢🟡🔴)
- Progress percentages
- Owner names
- Synaptix branding

### **Google Sheets - Services**
- PM2 service status
- Port mappings
- Memory/CPU metrics
- Health check results

### **Google Sheets - Initiatives**
- 6 strategic initiatives
- Progress tracking
- Owner assignments
- Due dates
- Project counts

---

## ✅ **VERIFICATION**

After upload, verify:

1. **Google Drive folder exists**
   - "Synaptix Status Reports" folder created
   - Date subfolder (e.g., "2025-11-06")

2. **Google Sheets populated**
   - Header row formatted (blue background)
   - Data rows visible
   - CSV correctly imported

3. **Google Slides formatted**
   - 4 quadrants visible
   - Text readable
   - Colors correct
   - No layout issues

---

## 🚀 **NEXT STEPS**

Once uploaded:

1. **Share with stakeholders**
   - Send Google Drive folder link
   - Or share individual file links

2. **Schedule weekly updates**
   - Set up cron job
   - Or use Raycast script

3. **Customize branding**
   - Update colors
   - Add company logo
   - Adjust fonts

4. **Embed in dashboard**
   - Use iframe embeds
   - Display on TV/monitor
   - Add to company intranet

---

## 💡 **PRO TIPS**

1. **Version Control**
   - Keep date-based folders
   - Archive old reports monthly

2. **Automation**
   - Link to CI/CD pipeline
   - Trigger on git push
   - Notify team on Slack

3. **Templates**
   - Save Slides as template
   - Reuse formatting
   - Consistent branding

4. **Data Sources**
   - Connect Sheets to Linear API
   - Auto-update from PM2
   - Live dashboard

---

## 📞 **SUPPORT**

**Issues?**
- Check Google Cloud Console for API errors
- Verify credentials file permissions
- Test with manual upload first

**Need Help?**
- Google Workspace API docs: https://developers.google.com/workspace
- Stack Overflow: google-workspace-api tag

---

**Ready to Upload?**

```bash
# Full workflow
node subagent-tasks/generate-status-report.cjs
node subagent-tasks/abe-execute-status-report.cjs
node subagent-tasks/upload-to-google-workspace.cjs
```

🎉 **Your status reports will be in Google Workspace!**

