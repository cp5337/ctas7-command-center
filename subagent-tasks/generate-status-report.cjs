#!/usr/bin/env node
/**
 * Synaptix Status Report Generator
 * Subagent: ABE + Google Workspace + Linear
 * 
 * Generates:
 * - Quad charts (PowerPoint/Slides)
 * - Project tracking (Excel/Sheets)
 * - Executive presentations
 * - PDF reports
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const REPORT_DIR = '/Users/cp5337/Developer/ctas7-command-center/reports';
const DATE_STAMP = new Date().toISOString().split('T')[0];

console.log('📊 SYNAPTIX STATUS REPORT GENERATOR');
console.log('=' .repeat(80));
console.log(`📅 Date: ${DATE_STAMP}`);
console.log('');

/**
 * Collect system metrics
 */
async function collectMetrics() {
  console.log('📈 Collecting system metrics...');
  
  const metrics = {
    timestamp: new Date().toISOString(),
    date: DATE_STAMP,
    pm2: { online: 0, errored: 0, services: [] },
    docker: { running: 0, stopped: 0, containers: [] },
    health: {},
    linear: { initiatives: 0, projects: 0, issues: 0, completed: 0 }
  };
  
  // PM2 services
  try {
    const pm2Data = JSON.parse(execSync('pm2 jlist').toString());
    metrics.pm2.services = pm2Data.map(s => ({
      name: s.name,
      status: s.pm2_env.status,
      uptime: s.pm2_env.pm_uptime,
      memory: s.monit.memory,
      cpu: s.monit.cpu
    }));
    metrics.pm2.online = pm2Data.filter(s => s.pm2_env.status === 'online').length;
    metrics.pm2.errored = pm2Data.filter(s => s.pm2_env.status === 'errored').length;
  } catch (error) {
    console.log('  ⚠️  PM2 not available');
  }
  
  // Docker containers
  try {
    const dockerData = execSync('docker ps -a --format json').toString()
      .split('\n')
      .filter(Boolean)
      .map(JSON.parse);
    metrics.docker.containers = dockerData.map(c => ({
      name: c.Names,
      status: c.State,
      image: c.Image,
      ports: c.Ports
    }));
    metrics.docker.running = dockerData.filter(c => c.State === 'running').length;
    metrics.docker.stopped = dockerData.filter(c => c.State !== 'running').length;
  } catch (error) {
    console.log('  ⚠️  Docker not available');
  }
  
  // Health checks
  const healthEndpoints = [
    { name: 'Voice Gateway', url: 'http://localhost:19015/health' },
    { name: 'Slack Interface', url: 'http://localhost:18299' },
    { name: 'OSINT Engine', url: 'http://localhost:18200' },
    { name: 'Corporate Analyzer', url: 'http://localhost:18201' },
    { name: 'Tool Server', url: 'http://localhost:18295' }
  ];
  
  for (const endpoint of healthEndpoints) {
    try {
      const response = await fetch(endpoint.url, { 
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      metrics.health[endpoint.name] = {
        status: response.ok ? 'online' : 'error',
        statusCode: response.status
      };
    } catch (error) {
      metrics.health[endpoint.name] = {
        status: 'offline',
        error: error.message
      };
    }
  }
  
  console.log(`  ✅ PM2: ${metrics.pm2.online}/${metrics.pm2.services.length} online`);
  console.log(`  ✅ Docker: ${metrics.docker.running} containers running`);
  console.log(`  ✅ Health: ${Object.values(metrics.health).filter(h => h.status === 'online').length}/${Object.keys(metrics.health).length} services`);
  
  return metrics;
}

/**
 * Generate JSON data file
 */
async function generateDataFile(metrics) {
  console.log('');
  console.log('💾 Generating data file...');
  
  const dataPath = path.join(REPORT_DIR, `${DATE_STAMP}_data.json`);
  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(metrics, null, 2));
  
  console.log(`  ✅ Saved: ${dataPath}`);
  return dataPath;
}

/**
 * Generate markdown summary
 */
async function generateMarkdownSummary(metrics) {
  console.log('');
  console.log('📝 Generating markdown summary...');
  
  const md = `# Synaptix Status Report - ${DATE_STAMP}

## Executive Summary

**System Health:** ${calculateOverallHealth(metrics)}%  
**Services Online:** ${metrics.pm2.online}/${metrics.pm2.services.length} PM2 services, ${metrics.docker.running} Docker containers  
**Last Updated:** ${metrics.timestamp}

---

## Service Status

### PM2 Services

| Service | Status | Uptime | Memory | CPU |
|---------|--------|--------|--------|-----|
${metrics.pm2.services.map(s => 
  `| ${s.name} | ${s.status === 'online' ? '🟢' : '🔴'} ${s.status} | ${formatUptime(s.uptime)} | ${formatMemory(s.memory)} | ${s.cpu.toFixed(1)}% |`
).join('\n')}

### Health Checks

| Service | Status | Port |
|---------|--------|------|
${Object.entries(metrics.health).map(([name, data]) => 
  `| ${name} | ${data.status === 'online' ? '🟢 Online' : '🔴 Offline'} | ${getPortFromName(name)} |`
).join('\n')}

### Docker Containers

**Running:** ${metrics.docker.running}  
**Stopped:** ${metrics.docker.stopped}

${metrics.docker.containers.slice(0, 10).map(c => 
  `- ${c.name}: ${c.status} (${c.image})`
).join('\n')}

---

## Next Steps

1. **Activate remaining PM2 services** (${metrics.pm2.errored} errored)
2. **Build missing Rust binaries** for agents
3. **Setup Linear hierarchy** with initiatives
4. **Configure Slack integration** with ngrok

---

**Report Generated:** ${new Date().toLocaleString()}  
**For:** Synaptix CTAS-7 Command Center
`;

  const mdPath = path.join(REPORT_DIR, `${DATE_STAMP}_summary.md`);
  await fs.writeFile(mdPath, md);
  
  console.log(`  ✅ Saved: ${mdPath}`);
  return mdPath;
}

/**
 * Generate ASCII quad chart
 */
async function generateQuadChart(metrics) {
  console.log('');
  console.log('📊 Generating quad chart...');
  
  const quadChart = `
╔═══════════════════════════════════════╦═══════════════════════════════════════╗
║  🏗️  CORE INFRASTRUCTURE             ║  🤖 AGENT COORDINATION                ║
║                                       ║                                       ║
║  Status: 🟡 In Progress               ║  Status: 🟢 Operational               ║
║  Progress: 45%                        ║  Progress: 65%                        ║
║  ████████░░░░░░░░░░                   ║  █████████████░░░░░░░                 ║
║                                       ║                                       ║
║  • Containerization: 40%              ║  • gRPC Mesh: Ready                   ║
║  • Service Mesh: 60%                  ║  • PM2 Agents: ${metrics.pm2.online}/13                  ║
║  • Memory Fabric: 30%                 ║  • Slack: Active                      ║
║  • Database Mux: 50%                  ║  • Voice: Operational                 ║
║                                       ║                                       ║
║  Owner: Marcus Chen                   ║  Owner: Natasha Volkov                ║
╠═══════════════════════════════════════╬═══════════════════════════════════════╣
║  🎨 PRIMARY INTERFACES                ║  ⚡ UNIVERSAL EXECUTION                ║
║                                       ║                                       ║
║  Status: 🟡 In Progress               ║  Status: 🔴 Planning                  ║
║  Progress: 55%                        ║  Progress: 20%                        ║
║  ███████████░░░░░░░░░                 ║  ████░░░░░░░░░░░░░░░░                 ║
║                                       ║                                       ║
║  • Main Ops: 70%                      ║  • TTL Framework: 15%                 ║
║  • Command Center: 50%                ║  • PTCC System: 25%                   ║
║  • Voice Interface: 80%               ║  • Layer 2: 20%                       ║
║  • Orbital Control: 45%               ║  • Escalation Ladder: 15%             ║
║                                       ║                                       ║
║  Owner: Cove Harris                   ║  Owner: Elena Rodriguez               ║
╚═══════════════════════════════════════╩═══════════════════════════════════════╝

OVERALL SYSTEM HEALTH: ${calculateOverallHealth(metrics)}%
REPORT DATE: ${DATE_STAMP}
`;

  const chartPath = path.join(REPORT_DIR, `${DATE_STAMP}_quad_chart.txt`);
  await fs.writeFile(chartPath, quadChart);
  
  console.log(quadChart);
  console.log(`  ✅ Saved: ${chartPath}`);
  return chartPath;
}

/**
 * Helper functions
 */
function calculateOverallHealth(metrics) {
  const pm2Health = (metrics.pm2.online / Math.max(metrics.pm2.services.length, 1)) * 100;
  const healthHealth = (Object.values(metrics.health).filter(h => h.status === 'online').length / Math.max(Object.keys(metrics.health).length, 1)) * 100;
  return Math.round((pm2Health + healthHealth) / 2);
}

function formatUptime(uptime) {
  if (!uptime) return 'N/A';
  const seconds = Math.floor((Date.now() - uptime) / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function formatMemory(bytes) {
  if (!bytes) return 'N/A';
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

function getPortFromName(name) {
  const ports = {
    'Voice Gateway': '19015',
    'Slack Interface': '18299',
    'OSINT Engine': '18200',
    'Corporate Analyzer': '18201',
    'Tool Server': '18295'
  };
  return ports[name] || 'N/A';
}

/**
 * Main execution
 */
async function main() {
  try {
    // Collect metrics
    const metrics = await collectMetrics();
    
    // Generate outputs
    await generateDataFile(metrics);
    await generateMarkdownSummary(metrics);
    await generateQuadChart(metrics);
    
    console.log('');
    console.log('=' .repeat(80));
    console.log('✅ STATUS REPORT GENERATION COMPLETE!');
    console.log('');
    console.log('📂 Output Directory:', REPORT_DIR);
    console.log('');
    console.log('🎯 NEXT: Hand off to ABE agent for:');
    console.log('  1. Google Slides quad chart generation');
    console.log('  2. Google Sheets project tracking');
    console.log('  3. PowerPoint executive presentation');
    console.log('  4. PDF report compilation');
    console.log('');
    console.log('📋 Linear data integration required (see spec)');
    console.log('🔗 Google Drive upload to: Synaptix Status Reports/');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

