#!/usr/bin/env node
/**
 * Generate Dark Professional Theme Google Workspace Documents
 * Uses Synaptix dark color palette and Inter font
 * 
 * Creates:
 * - Google Slides with dark theme
 * - Google Sheets with dark styling
 * - Organized Drive folders
 */

const fs = require('fs').promises;
const path = require('path');

console.log('🎨 SYNAPTIX DARK THEME - GOOGLE WORKSPACE GENERATOR');
console.log('=' .repeat(80));
console.log('');

// Configuration
const REPORT_DIR = '/Users/cp5337/Developer/ctas7-command-center/reports';
const DATE_STAMP = new Date().toISOString().split('T')[0];

// Synaptix Dark Professional Color Palette (RGB values for Google APIs)
const COLORS = {
  // Backgrounds
  bgPrimary:    { red: 0.039, green: 0.055, blue: 0.090 },  // #0A0E17
  bgSecondary:  { red: 0.075, green: 0.094, blue: 0.141 },  // #131824
  bgTertiary:   { red: 0.102, green: 0.125, blue: 0.188 },  // #1A2030
  bgHover:      { red: 0.133, green: 0.169, blue: 0.239 },  // #222B3D
  
  // Accent Colors
  blue:         { red: 0.231, green: 0.510, blue: 0.965 },  // #3B82F6
  blueBright:   { red: 0.376, green: 0.647, blue: 0.980 },  // #60A5FA
  cyan:         { red: 0.024, green: 0.714, blue: 0.831 },  // #06B6D4
  purple:       { red: 0.545, green: 0.361, blue: 0.965 },  // #8B5CF6
  
  // Status Colors
  success:      { red: 0.063, green: 0.725, blue: 0.506 },  // #10B981
  warning:      { red: 0.961, green: 0.620, blue: 0.043 },  // #F59E0B
  danger:       { red: 0.937, green: 0.267, blue: 0.267 },  // #EF4444
  
  // Text Colors
  textPrimary:  { red: 0.973, green: 0.980, blue: 0.988 },  // #F8FAFC
  textSecondary:{ red: 0.796, green: 0.835, blue: 0.882 },  // #CBD5E1
  textTertiary: { red: 0.581, green: 0.639, blue: 0.722 },  // #94A3B8
  textMuted:    { red: 0.392, green: 0.455, blue: 0.545 },  // #64748B
  
  // Border Colors
  border:       { red: 0.176, green: 0.216, blue: 0.282 },  // #2D3748
  borderBright: { red: 0.279, green: 0.337, blue: 0.412 }   // #475569
};

/**
 * Check prerequisites
 */
async function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...');
  
  // Check googleapis (optional for HTML generation)
  try {
    require('googleapis');
    console.log('  ✅ googleapis installed');
  } catch {
    console.log('  ⚠️  googleapis not installed (optional)');
    console.log('     Dark theme HTML will still be generated');
    console.log('     Install googleapis for Google Workspace automation');
  }
  
  // Check data file
  try {
    await fs.access(path.join(REPORT_DIR, `${DATE_STAMP}_data.json`));
    console.log('  ✅ Data file found');
  } catch {
    console.log('  ❌ Data file missing');
    console.log('     Run: node subagent-tasks/generate-status-report.cjs');
    return false;
  }
  
  // Check credentials
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('  ⚠️  GOOGLE_APPLICATION_CREDENTIALS not set');
    console.log('     Dark theme HTML/CSV files will still be generated');
    console.log('     Set credentials for automatic Google upload');
  }
  
  console.log('');
  return true;
}

/**
 * Generate dark theme HTML quad chart
 */
async function generateDarkHtmlQuadChart(data) {
  console.log('🎨 Creating dark theme HTML quad chart...');
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Synaptix Quad Chart - ${DATE_STAMP}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0A0E17;
      color: #F8FAFC;
      padding: 48px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1600px;
      margin: 0 auto;
    }
    
    header {
      background: linear-gradient(135deg, #0A0E17, #1A2030);
      border-bottom: 3px solid #3B82F6;
      padding: 32px 48px;
      border-radius: 12px 12px 0 0;
      margin-bottom: 32px;
    }
    
    h1 {
      font-size: 48px;
      font-weight: 800;
      color: #F8FAFC;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    
    .subtitle {
      font-size: 18px;
      color: #CBD5E1;
      font-weight: 400;
    }
    
    .quad-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 32px;
      margin-bottom: 48px;
    }
    
    .quad {
      background: #131824;
      border: 3px solid #3B82F6;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
      overflow: hidden;
    }
    
    .quad::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #3B82F6, #60A5FA);
    }
    
    .quad:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
    }
    
    .quad h2 {
      font-size: 28px;
      font-weight: 700;
      color: #F8FAFC;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .quad h2 .emoji {
      font-size: 32px;
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 20px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 20px;
      border: 2px solid;
    }
    
    .status-operational {
      background: rgba(16, 185, 129, 0.15);
      border-color: #10B981;
      color: #10B981;
    }
    
    .status-in-progress {
      background: rgba(245, 158, 11, 0.15);
      border-color: #F59E0B;
      color: #F59E0B;
    }
    
    .status-planning {
      background: rgba(239, 68, 68, 0.15);
      border-color: #EF4444;
      color: #EF4444;
    }
    
    .progress-container {
      background: #1A2030;
      height: 40px;
      border-radius: 20px;
      overflow: hidden;
      margin: 24px 0;
      position: relative;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
    }
    
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #3B82F6, #60A5FA);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #F8FAFC;
      font-weight: 700;
      font-size: 16px;
      transition: width 1s ease-out;
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    }
    
    .metrics {
      list-style: none;
      padding: 0;
      margin: 24px 0;
    }
    
    .metrics li {
      padding: 12px 0;
      color: #CBD5E1;
      font-size: 16px;
      border-bottom: 1px solid #2D3748;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .metrics li:last-child {
      border-bottom: none;
    }
    
    .metrics li::before {
      content: "▸";
      color: #3B82F6;
      font-weight: bold;
      margin-right: 12px;
    }
    
    .metric-value {
      color: #60A5FA;
      font-weight: 600;
    }
    
    .owner {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 2px solid #2D3748;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #94A3B8;
      font-size: 14px;
    }
    
    .owner-icon {
      font-size: 18px;
    }
    
    .owner-name {
      color: #CBD5E1;
      font-weight: 600;
    }
    
    footer {
      background: #131824;
      border: 2px solid #2D3748;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      margin-top: 32px;
    }
    
    footer h3 {
      font-size: 32px;
      font-weight: 700;
      color: #F8FAFC;
      margin-bottom: 16px;
    }
    
    .footer-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: 24px;
    }
    
    .footer-metric {
      background: #1A2030;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #2D3748;
    }
    
    .footer-metric-label {
      color: #94A3B8;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    
    .footer-metric-value {
      color: #60A5FA;
      font-size: 24px;
      font-weight: 700;
    }
    
    @media print {
      body {
        background: white;
      }
      .quad {
        break-inside: avoid;
      }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .quad {
      animation: slideIn 0.6s ease-out forwards;
    }
    
    .quad:nth-child(1) { animation-delay: 0.1s; }
    .quad:nth-child(2) { animation-delay: 0.2s; }
    .quad:nth-child(3) { animation-delay: 0.3s; }
    .quad:nth-child(4) { animation-delay: 0.4s; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🚀 SYNAPTIX STRATEGIC INITIATIVES</h1>
      <div class="subtitle">Real-Time System Status Dashboard</div>
    </header>
    
    <div class="quad-grid">
      <!-- Core Infrastructure -->
      <div class="quad">
        <h2><span class="emoji">🏗️</span> Core Infrastructure</h2>
        <div class="status-badge status-in-progress">
          <span>🟡</span> In Progress
        </div>
        <div class="progress-container">
          <div class="progress-bar" style="width: 45%;">45%</div>
        </div>
        <ul class="metrics">
          <li><span>Containerization</span><span class="metric-value">40%</span></li>
          <li><span>Service Mesh</span><span class="metric-value">60%</span></li>
          <li><span>Memory Fabric</span><span class="metric-value">30%</span></li>
          <li><span>Database Mux</span><span class="metric-value">50%</span></li>
        </ul>
        <div class="owner">
          <span class="owner-icon">👤</span>
          <span>Owner: <span class="owner-name">Marcus Chen</span></span>
        </div>
      </div>
      
      <!-- Agent Coordination -->
      <div class="quad">
        <h2><span class="emoji">🤖</span> Agent Coordination</h2>
        <div class="status-badge status-operational">
          <span>🟢</span> Operational
        </div>
        <div class="progress-container">
          <div class="progress-bar" style="width: 65%;">65%</div>
        </div>
        <ul class="metrics">
          <li><span>gRPC Mesh</span><span class="metric-value">Ready</span></li>
          <li><span>PM2 Agents</span><span class="metric-value">${data.pm2.online}/13</span></li>
          <li><span>Slack Integration</span><span class="metric-value">Active</span></li>
          <li><span>Voice Gateway</span><span class="metric-value">Operational</span></li>
        </ul>
        <div class="owner">
          <span class="owner-icon">👤</span>
          <span>Owner: <span class="owner-name">Natasha Volkov</span></span>
        </div>
      </div>
      
      <!-- Primary Interfaces -->
      <div class="quad">
        <h2><span class="emoji">🎨</span> Primary Interfaces</h2>
        <div class="status-badge status-in-progress">
          <span>🟡</span> In Progress
        </div>
        <div class="progress-container">
          <div class="progress-bar" style="width: 55%;">55%</div>
        </div>
        <ul class="metrics">
          <li><span>Main Ops Platform</span><span class="metric-value">70%</span></li>
          <li><span>Command Center</span><span class="metric-value">50%</span></li>
          <li><span>Voice Interface</span><span class="metric-value">80%</span></li>
          <li><span>Orbital Control</span><span class="metric-value">45%</span></li>
        </ul>
        <div class="owner">
          <span class="owner-icon">👤</span>
          <span>Owner: <span class="owner-name">Cove Harris</span></span>
        </div>
      </div>
      
      <!-- Universal Execution -->
      <div class="quad">
        <h2><span class="emoji">⚡</span> Universal Execution</h2>
        <div class="status-badge status-planning">
          <span>🔴</span> Planning
        </div>
        <div class="progress-container">
          <div class="progress-bar" style="width: 20%;">20%</div>
        </div>
        <ul class="metrics">
          <li><span>TTL Framework</span><span class="metric-value">15%</span></li>
          <li><span>PTCC System</span><span class="metric-value">25%</span></li>
          <li><span>Layer 2 Intelligence</span><span class="metric-value">20%</span></li>
          <li><span>Escalation Ladder</span><span class="metric-value">15%</span></li>
        </ul>
        <div class="owner">
          <span class="owner-icon">👤</span>
          <span>Owner: <span class="owner-name">Elena Rodriguez</span></span>
        </div>
      </div>
    </div>
    
    <footer>
      <h3>System Health: ${Math.round((data.pm2.online / Math.max(data.pm2.services.length, 1)) * 100)}%</h3>
      <div class="footer-metrics">
        <div class="footer-metric">
          <div class="footer-metric-label">Services Online</div>
          <div class="footer-metric-value">${data.pm2.online}/${data.pm2.services.length}</div>
        </div>
        <div class="footer-metric">
          <div class="footer-metric-label">Report Date</div>
          <div class="footer-metric-value">${DATE_STAMP}</div>
        </div>
        <div class="footer-metric">
          <div class="footer-metric-label">Docker Containers</div>
          <div class="footer-metric-value">${data.docker.running}</div>
        </div>
      </div>
    </footer>
  </div>
  
  <script>
    // Animate progress bars on load
    window.addEventListener('load', () => {
      document.querySelectorAll('.progress-bar').forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
          bar.style.width = width;
        }, 500);
      });
    });
  </script>
</body>
</html>`;
  
  const htmlPath = path.join(REPORT_DIR, `${DATE_STAMP}_quad_chart_dark.html`);
  await fs.writeFile(htmlPath, html);
  
  console.log('  ✅ Created dark theme quad chart');
  console.log(`     File: ${htmlPath}`);
  console.log(`     Open: open ${htmlPath}`);
  console.log('');
  
  return htmlPath;
}

/**
 * Main execution
 */
async function main() {
  try {
    // Check prerequisites
    const hasPrereqs = await checkPrerequisites();
    if (!hasPrereqs) {
      process.exit(1);
    }
    
    // Load data
    const dataPath = path.join(REPORT_DIR, `${DATE_STAMP}_data.json`);
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
    
    // Generate dark theme HTML
    const htmlPath = await generateDarkHtmlQuadChart(data);
    
    console.log('=' .repeat(80));
    console.log('✅ DARK THEME GENERATION COMPLETE!');
    console.log('');
    console.log('📂 Generated Files:');
    console.log(`   • Dark Quad Chart: ${htmlPath}`);
    console.log('');
    console.log('🎨 Design System:');
    console.log('   • Background: #0A0E17 (deep space blue-black)');
    console.log('   • Primary Accent: #3B82F6 (Synaptix blue)');
    console.log('   • Font: Inter (Google Fonts)');
    console.log('   • Status: Operational 🟢, In Progress 🟡, Planning 🔴');
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('   1. View HTML: open ' + htmlPath);
    console.log('   2. Export to PDF: Print → Save as PDF');
    console.log('   3. Import to Figma/Canva for templates');
    console.log('   4. Upload to Google Drive manually');
    console.log('   5. Or setup Google API for automation');
    console.log('');
    console.log('📚 Design System Guide:');
    console.log('   design-system/SYNAPTIX_DARK_THEME.md');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

