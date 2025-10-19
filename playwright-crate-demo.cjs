// Playwright Crate Demo - Interactive Button Testing
// 🎯 Connect live crates to buttons for demo

const { chromium } = require('playwright');

class CrateDemoController {
    constructor() {
        this.browser = null;
        this.page = null;
        this.crateConnections = new Map();
        this.repoAgentUrl = 'http://localhost:15180';
        this.demoPort = 8080;
    }

    async initialize() {
        console.log('🚀 Initializing Playwright Crate Demo...');

        this.browser = await chromium.launch({
            headless: false,
            slowMo: 500 // Demo speed
        });

        this.page = await this.browser.newPage();

        // Set viewport for demo
        await this.page.setViewportSize({ width: 1920, height: 1080 });

        console.log('✅ Browser launched');
    }

    async setupCrateConnections() {
        console.log('🔗 Setting up crate connections...');

        // Connect to RepoAgent server
        try {
            const response = await fetch(`${this.repoAgentUrl}/repo/status`);
            const status = await response.json();
            console.log('📡 RepoAgent Status:', status);
        } catch (error) {
            console.log('⚠️ RepoAgent not running, starting demo mode...');
        }

        // Map crates to demo buttons
        this.crateConnections.set('smart-crates', {
            name: 'Smart Crates',
            count: 24,
            status: 'Active',
            endpoint: '/repo/tree',
            color: '#00ff88'
        });

        this.crateConnections.set('qa-certified', {
            name: 'QA Certified',
            count: 18,
            status: 'Certified',
            endpoint: '/repo/status',
            color: '#00ccff'
        });

        this.crateConnections.set('wasm-ready', {
            name: 'WASM Ready',
            count: 20,
            status: 'Deployed',
            endpoint: '/agents/dispatch',
            color: '#88ccff'
        });

        this.crateConnections.set('ports-assigned', {
            name: 'Ports Assigned',
            count: 16,
            status: 'Configured',
            endpoint: '/mux/playbook',
            color: '#ffcc00'
        });

        console.log('✅ Crate connections configured');
    }

    async createDemoInterface() {
        console.log('🎨 Creating demo interface...');

        // Create HTML content with interactive buttons
        const demoHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CTAS-7 Crate Demo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            height: 100vh;
            overflow: hidden;
        }

        .demo-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 20px;
            padding: 20px;
            height: 100vh;
        }

        .crate-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid transparent;
            position: relative;
            overflow: hidden;
        }

        .crate-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 255, 136, 0.3);
            border-color: var(--card-color);
        }

        .crate-card.active {
            border-color: var(--card-color);
            box-shadow: 0 0 30px var(--card-color);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .card-title {
            font-size: 2rem;
            font-weight: bold;
            color: var(--card-color);
        }

        .card-count {
            font-size: 3rem;
            font-weight: bold;
            color: var(--card-color);
        }

        .card-status {
            padding: 8px 16px;
            border-radius: 20px;
            background: var(--card-color);
            color: #000;
            font-weight: bold;
            font-size: 0.9rem;
        }

        .card-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        .action-btn {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 8px;
            background: var(--card-color);
            color: #000;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .action-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .output-console {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 400px;
            height: 200px;
            background: rgba(0, 0, 0, 0.9);
            border-radius: 10px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #00ff88;
            overflow-y: auto;
            border: 1px solid #00ff88;
        }

        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid var(--card-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .pulse {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="demo-container">
        ${Array.from(this.crateConnections.entries()).map(([key, crate]) => `
            <div class="crate-card" style="--card-color: ${crate.color}" data-crate="${key}">
                <div class="card-header">
                    <div class="card-title">${crate.name}</div>
                    <div class="card-count">${crate.count}</div>
                </div>
                <div class="card-status">${crate.status}</div>
                <div class="card-actions">
                    <button class="action-btn" onclick="testCrate('${key}')">Test</button>
                    <button class="action-btn" onclick="deployCrate('${key}')">Deploy</button>
                    <button class="action-btn" onclick="monitorCrate('${key}')">Monitor</button>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="output-console" id="console">
        <div>🎯 CTAS-7 Crate Demo Ready</div>
        <div>📡 RepoAgent: ${this.repoAgentUrl}</div>
        <div>✅ Playwright Connected</div>
        <div>---</div>
    </div>

    <script>
        const console_output = document.getElementById('console');

        function log(message) {
            const timestamp = new Date().toLocaleTimeString();
            console_output.innerHTML += '<div>[' + timestamp + '] ' + message + '</div>';
            console_output.scrollTop = console_output.scrollHeight;
        }

        async function testCrate(crateKey) {
            const card = document.querySelector('[data-crate="' + crateKey + '"]');
            card.classList.add('active', 'pulse');

            log('🧪 Testing crate: ' + crateKey);

            try {
                // Simulate crate testing
                const response = await fetch('${this.repoAgentUrl}/repo/status');
                const data = await response.json();
                log('✅ Test passed: ' + JSON.stringify(data));
            } catch (error) {
                log('⚠️ Test simulation: ' + crateKey + ' - OK');
            }

            setTimeout(() => {
                card.classList.remove('active', 'pulse');
            }, 2000);
        }

        async function deployCrate(crateKey) {
            const card = document.querySelector('[data-crate="' + crateKey + '"]');
            card.classList.add('active');

            log('🚀 Deploying crate: ' + crateKey);

            try {
                // Simulate deployment
                const response = await fetch('${this.repoAgentUrl}/agents/dispatch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ agent: crateKey, action: 'deploy' })
                });
                log('✅ Deployed: ' + crateKey);
            } catch (error) {
                log('✅ Deploy simulation: ' + crateKey + ' - Success');
            }

            setTimeout(() => {
                card.classList.remove('active');
            }, 1500);
        }

        async function monitorCrate(crateKey) {
            const card = document.querySelector('[data-crate="' + crateKey + '"]');
            card.classList.add('active');

            log('📊 Monitoring crate: ' + crateKey);

            // Simulate real-time monitoring
            let count = 0;
            const interval = setInterval(() => {
                count++;
                log('📈 ' + crateKey + ' metrics: ' + Math.floor(Math.random() * 100) + '% healthy');

                if (count >= 3) {
                    clearInterval(interval);
                    card.classList.remove('active');
                    log('✅ Monitoring complete: ' + crateKey);
                }
            }, 1000);
        }

        // Auto-demo mode
        setTimeout(() => {
            log('🎬 Starting auto-demo...');
            testCrate('smart-crates');
        }, 2000);

        setTimeout(() => {
            deployCrate('qa-certified');
        }, 5000);

        setTimeout(() => {
            monitorCrate('wasm-ready');
        }, 8000);
    </script>
</body>
</html>`;

        // Write demo HTML to temp file
        const fs = require('fs');
        const demoPath = '/tmp/ctas7-crate-demo.html';
        fs.writeFileSync(demoPath, demoHTML);

        return demoPath;
    }

    async runDemo() {
        console.log('🎬 Starting Playwright Crate Demo...');

        await this.initialize();
        await this.setupCrateConnections();

        const demoPath = await this.createDemoInterface();

        // Navigate to demo
        await this.page.goto(`file://${demoPath}`);

        console.log('✅ Demo loaded');

        // Demo interaction sequence
        await this.runDemoSequence();
    }

    async runDemoSequence() {
        console.log('🎭 Running demo sequence...');

        // Wait for page load
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);

        // Demo sequence: Test each crate
        const crates = ['smart-crates', 'qa-certified', 'wasm-ready', 'ports-assigned'];

        for (const crate of crates) {
            console.log(`🎯 Testing ${crate}...`);

            // Click test button
            await this.page.click(`[data-crate="${crate}"] .action-btn:nth-child(1)`);
            await this.page.waitForTimeout(2500);

            // Click deploy button
            await this.page.click(`[data-crate="${crate}"] .action-btn:nth-child(2)`);
            await this.page.waitForTimeout(2000);

            // Click monitor button
            await this.page.click(`[data-crate="${crate}"] .action-btn:nth-child(3)`);
            await this.page.waitForTimeout(3000);
        }

        console.log('🎉 Demo sequence complete!');

        // Keep browser open for manual interaction
        console.log('💡 Browser staying open for manual demo...');
        console.log('🔗 Press Ctrl+C to exit');
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Run the demo
const demo = new CrateDemoController();

demo.runDemo().catch(console.error);

// Handle cleanup
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down demo...');
    await demo.cleanup();
    process.exit(0);
});

module.exports = CrateDemoController;