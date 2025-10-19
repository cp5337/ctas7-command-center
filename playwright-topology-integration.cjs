// Playwright + Network Topology Designer Integration
// 🎯 Crate interactions create live network diagrams

const { chromium } = require('playwright');
const fs = require('fs');

class TopologyIntegratedDemo {
    constructor() {
        this.browser = null;
        this.cratePage = null;
        this.topologyPage = null;
        this.repoAgentUrl = 'http://localhost:15180';
        this.networkData = {
            nodes: [],
            connections: [],
            crates: new Map()
        };
    }

    async initialize() {
        console.log('🌐 Initializing Topology + Crate Demo...');

        this.browser = await chromium.launch({
            headless: false,
            slowMo: 300
        });

        // Create two pages: Crate demo + Topology designer
        this.cratePage = await this.browser.newPage();
        this.topologyPage = await this.browser.newPage();

        await this.cratePage.setViewportSize({ width: 1920, height: 1080 });
        await this.topologyPage.setViewportSize({ width: 1920, height: 1080 });

        console.log('✅ Browser with dual pages launched');
    }

    async setupCrateDemo() {
        console.log('🎯 Setting up crate demo interface...');

        const crateHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CTAS-7 Crate Control</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            padding: 20px;
            background: rgba(0, 255, 136, 0.1);
            border-bottom: 1px solid #00ff88;
        }

        .header h1 {
            color: #00ff88;
            font-size: 2rem;
            margin-bottom: 10px;
        }

        .status {
            color: #aaa;
            font-size: 0.9rem;
        }

        .crate-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            padding: 20px;
            flex: 1;
        }

        .crate-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 25px;
            border: 2px solid transparent;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .crate-card:hover {
            transform: translateY(-3px);
            border-color: var(--crate-color);
            box-shadow: 0 10px 25px rgba(0, 255, 136, 0.2);
        }

        .crate-card.active {
            border-color: var(--crate-color);
            box-shadow: 0 0 20px var(--crate-color);
            animation: pulse 1s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }

        .crate-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .crate-name {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--crate-color);
        }

        .crate-count {
            font-size: 2.5rem;
            font-weight: bold;
            color: var(--crate-color);
        }

        .crate-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .action-btn {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 6px;
            background: var(--crate-color);
            color: #000;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .action-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        }

        .action-btn:active {
            transform: scale(0.95);
        }

        .network-status {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #00ff88;
            border-radius: 8px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #00ff88;
            max-width: 300px;
        }

        .network-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #00ff88;
            margin-right: 8px;
            animation: blink 2s infinite;
        }

        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 CTAS-7 Crate Control Center</h1>
        <div class="status">
            <span class="network-indicator"></span>
            Connected to RepoAgent • Network Topology: Live
        </div>
    </div>

    <div class="crate-grid">
        <div class="crate-card" style="--crate-color: #00ff88" data-crate="smart-crates">
            <div class="crate-header">
                <div class="crate-name">Smart Crates</div>
                <div class="crate-count">24</div>
            </div>
            <div class="crate-actions">
                <button class="action-btn" onclick="executeCrateAction('smart-crates', 'test')">Test</button>
                <button class="action-btn" onclick="executeCrateAction('smart-crates', 'deploy')">Deploy</button>
                <button class="action-btn" onclick="executeCrateAction('smart-crates', 'monitor')">Monitor</button>
            </div>
        </div>

        <div class="crate-card" style="--crate-color: #00ccff" data-crate="qa-certified">
            <div class="crate-header">
                <div class="crate-name">QA Certified</div>
                <div class="crate-count">18</div>
            </div>
            <div class="crate-actions">
                <button class="action-btn" onclick="executeCrateAction('qa-certified', 'test')">Test</button>
                <button class="action-btn" onclick="executeCrateAction('qa-certified', 'deploy')">Deploy</button>
                <button class="action-btn" onclick="executeCrateAction('qa-certified', 'monitor')">Monitor</button>
            </div>
        </div>

        <div class="crate-card" style="--crate-color: #88ccff" data-crate="wasm-ready">
            <div class="crate-header">
                <div class="crate-name">WASM Ready</div>
                <div class="crate-count">20</div>
            </div>
            <div class="crate-actions">
                <button class="action-btn" onclick="executeCrateAction('wasm-ready', 'test')">Test</button>
                <button class="action-btn" onclick="executeCrateAction('wasm-ready', 'deploy')">Deploy</button>
                <button class="action-btn" onclick="executeCrateAction('wasm-ready', 'monitor')">Monitor</button>
            </div>
        </div>

        <div class="crate-card" style="--crate-color: #ffcc00" data-crate="ports-assigned">
            <div class="crate-header">
                <div class="crate-name">Ports Assigned</div>
                <div class="crate-count">16</div>
            </div>
            <div class="crate-actions">
                <button class="action-btn" onclick="executeCrateAction('ports-assigned', 'test')">Test</button>
                <button class="action-btn" onclick="executeCrateAction('ports-assigned', 'deploy')">Deploy</button>
                <button class="action-btn" onclick="executeCrateAction('ports-assigned', 'monitor')">Monitor</button>
            </div>
        </div>
    </div>

    <div class="network-status" id="networkStatus">
        <div>📡 Network Topology: Live</div>
        <div>🔗 Active Connections: 0</div>
        <div>⚡ Data Flow: Ready</div>
    </div>

    <script>
        let networkConnections = 0;

        async function executeCrateAction(crateName, action) {
            const card = document.querySelector('[data-crate="' + crateName + '"]');
            card.classList.add('active');

            // Update network status
            networkConnections++;
            document.getElementById('networkStatus').innerHTML =
                '<div>📡 Network Topology: Live</div>' +
                '<div>🔗 Active Connections: ' + networkConnections + '</div>' +
                '<div>⚡ Data Flow: ' + action.toUpperCase() + '</div>' +
                '<div>🎯 Crate: ' + crateName + '</div>';

            console.log('TOPOLOGY_UPDATE:', {
                crate: crateName,
                action: action,
                timestamp: new Date().toISOString(),
                connections: networkConnections
            });

            // Simulate network activity
            await new Promise(resolve => setTimeout(resolve, 2000));

            card.classList.remove('active');
        }

        // Auto-demo sequence
        setTimeout(() => {
            console.log('🎬 Starting auto-demo sequence...');
            executeCrateAction('smart-crates', 'test');
        }, 2000);
    </script>
</body>
</html>`;

        const crateFile = '/tmp/ctas7-crate-control.html';
        fs.writeFileSync(crateFile, crateHTML);

        await this.cratePage.goto(`file://${crateFile}`);
        console.log('✅ Crate control interface loaded');
    }

    async setupTopologyDesigner() {
        console.log('🌐 Setting up network topology designer...');

        // Load your existing topology designer
        const topologyPath = '/Users/cp5337/Downloads/network_topology_designer_2.html';

        try {
            await this.topologyPage.goto(`file://${topologyPath}`);
            console.log('✅ Network topology designer loaded');

            // Wait for the designer to be ready
            await this.topologyPage.waitForLoadState('networkidle');

            // Inject integration script
            await this.topologyPage.addScriptTag({
                content: `
                    // Integration with crate demo
                    let crateNodes = new Map();

                    function addCrateNode(crateName, action) {
                        const nodeId = crateName + '_' + action;
                        const colors = {
                            'smart-crates': '#00ff88',
                            'qa-certified': '#00ccff',
                            'wasm-ready': '#88ccff',
                            'ports-assigned': '#ffcc00'
                        };

                        // Add node to topology if it doesn't exist
                        if (!crateNodes.has(nodeId)) {
                            const node = {
                                id: nodeId,
                                label: crateName + '\\n' + action,
                                color: colors[crateName] || '#ffffff',
                                x: Math.random() * 600 + 100,
                                y: Math.random() * 400 + 100
                            };

                            crateNodes.set(nodeId, node);

                            // Add to network diagram (if network.js is available)
                            if (typeof addNode === 'function') {
                                addNode(node);
                            }

                            console.log('🌐 Added network node:', nodeId);
                        }

                        // Create connection between nodes
                        createCrateConnection(nodeId);
                    }

                    function createCrateConnection(fromNodeId) {
                        // Connect to previous node if exists
                        const nodeIds = Array.from(crateNodes.keys());
                        if (nodeIds.length > 1) {
                            const prevNodeId = nodeIds[nodeIds.length - 2];

                            if (typeof addConnection === 'function') {
                                addConnection(prevNodeId, fromNodeId);
                            }

                            console.log('🔗 Created connection:', prevNodeId, '->', fromNodeId);
                        }
                    }

                    // Listen for topology updates from crate demo
                    console.log('🎯 Topology designer ready for crate integration');
                `
            });

        } catch (error) {
            console.log('⚠️ Could not load topology designer, creating embedded version...');
            await this.createEmbeddedTopology();
        }
    }

    async createEmbeddedTopology() {
        const embeddedTopologyHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CTAS-7 Network Topology</title>
    <style>
        body {
            background: linear-gradient(135deg, #0a0a0a, #1a1a2e);
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            height: 100vh;
        }

        .topology-container {
            width: 100%;
            height: calc(100vh - 40px);
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            border: 1px solid #00ff88;
            position: relative;
            overflow: hidden;
        }

        .node {
            position: absolute;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            line-height: 1.2;
            color: #000;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid #fff;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .node:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
        }

        .connection {
            position: absolute;
            height: 2px;
            background: linear-gradient(90deg, #00ff88, #00ccff);
            opacity: 0.7;
            animation: pulse-connection 2s infinite;
        }

        @keyframes pulse-connection {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
        }

        .topology-header {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 100;
        }

        .topology-header h2 {
            color: #00ff88;
            margin-bottom: 10px;
        }

        .topology-stats {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #00ff88;
            z-index: 100;
        }
    </style>
</head>
<body>
    <div class="topology-container" id="topologyContainer">
        <div class="topology-header">
            <h2>🌐 CTAS-7 Network Topology</h2>
            <div>Real-time crate network visualization</div>
        </div>

        <div class="topology-stats" id="topologyStats">
            <div>📊 Nodes: <span id="nodeCount">0</span></div>
            <div>🔗 Connections: <span id="connectionCount">0</span></div>
            <div>⚡ Status: <span id="networkStatus">Ready</span></div>
        </div>
    </div>

    <script>
        let nodes = new Map();
        let connections = [];
        let nodeCount = 0;

        const colors = {
            'smart-crates': '#00ff88',
            'qa-certified': '#00ccff',
            'wasm-ready': '#88ccff',
            'ports-assigned': '#ffcc00'
        };

        function addNode(crateName, action) {
            const nodeId = crateName + '_' + action;
            nodeCount++;

            const node = document.createElement('div');
            node.className = 'node';
            node.id = nodeId;
            node.style.backgroundColor = colors[crateName] || '#ffffff';
            node.style.left = (150 + (nodeCount * 120)) + 'px';
            node.style.top = (150 + Math.sin(nodeCount) * 100) + 'px';
            node.textContent = crateName.replace('-', '\\n') + '\\n' + action;

            document.getElementById('topologyContainer').appendChild(node);
            nodes.set(nodeId, node);

            // Update stats
            document.getElementById('nodeCount').textContent = nodes.size;
            document.getElementById('networkStatus').textContent = 'Active';

            console.log('🌐 Added topology node:', nodeId);

            // Create connection to previous node
            if (nodeCount > 1) {
                createConnection();
            }

            // Animate node appearance
            node.style.opacity = '0';
            node.style.transform = 'scale(0)';
            setTimeout(() => {
                node.style.opacity = '1';
                node.style.transform = 'scale(1)';
            }, 100);
        }

        function createConnection() {
            const nodeElements = Array.from(nodes.values());
            if (nodeElements.length >= 2) {
                const fromNode = nodeElements[nodeElements.length - 2];
                const toNode = nodeElements[nodeElements.length - 1];

                const fromRect = fromNode.getBoundingClientRect();
                const toRect = toNode.getBoundingClientRect();
                const containerRect = document.getElementById('topologyContainer').getBoundingClientRect();

                const fromX = fromRect.left - containerRect.left + fromRect.width / 2;
                const fromY = fromRect.top - containerRect.top + fromRect.height / 2;
                const toX = toRect.left - containerRect.left + toRect.width / 2;
                const toY = toRect.top - containerRect.top + toRect.height / 2;

                const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
                const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;

                const connection = document.createElement('div');
                connection.className = 'connection';
                connection.style.width = distance + 'px';
                connection.style.left = fromX + 'px';
                connection.style.top = fromY + 'px';
                connection.style.transform = 'rotate(' + angle + 'deg)';
                connection.style.transformOrigin = '0 50%';

                document.getElementById('topologyContainer').appendChild(connection);
                connections.push(connection);

                document.getElementById('connectionCount').textContent = connections.length;

                console.log('🔗 Created topology connection');
            }
        }

        // Listen for crate actions
        console.log('🎯 Network topology ready for crate integration');

        // Demo sequence
        setTimeout(() => addNode('smart-crates', 'test'), 2000);
        setTimeout(() => addNode('qa-certified', 'deploy'), 4000);
        setTimeout(() => addNode('wasm-ready', 'monitor'), 6000);
        setTimeout(() => addNode('ports-assigned', 'test'), 8000);
    </script>
</body>
</html>`;

        const topologyFile = '/tmp/ctas7-network-topology.html';
        fs.writeFileSync(topologyFile, embeddedTopologyHTML);

        await this.topologyPage.goto(`file://${topologyFile}`);
        console.log('✅ Embedded network topology created');
    }

    async monitorCrateInteractions() {
        console.log('👁️ Monitoring crate interactions for topology updates...');

        // Listen for console messages from crate demo
        this.cratePage.on('console', async (msg) => {
            const text = msg.text();

            if (text.startsWith('TOPOLOGY_UPDATE:')) {
                try {
                    const data = JSON.parse(text.replace('TOPOLOGY_UPDATE:', ''));
                    console.log('🎯 Crate interaction detected:', data);

                    // Update topology designer
                    await this.topologyPage.evaluate((crateData) => {
                        if (typeof addNode === 'function') {
                            addNode(crateData.crate, crateData.action);
                        }
                    }, data);

                } catch (error) {
                    console.log('⚠️ Could not parse topology update:', error);
                }
            }
        });
    }

    async runIntegratedDemo() {
        console.log('🚀 Starting integrated demo...');

        await this.initialize();
        await this.setupCrateDemo();
        await this.setupTopologyDesigner();
        await this.monitorCrateInteractions();

        console.log('✅ Integrated demo running!');
        console.log('🎯 Crate interactions will automatically create network topology');
        console.log('💡 Browser windows staying open for interaction...');

        // Auto-sequence for demo
        setTimeout(async () => {
            console.log('🎬 Starting automated sequence...');

            const crates = ['smart-crates', 'qa-certified', 'wasm-ready', 'ports-assigned'];
            const actions = ['test', 'deploy', 'monitor'];

            for (let i = 0; i < crates.length; i++) {
                const crate = crates[i];
                const action = actions[i % actions.length];

                await this.cratePage.evaluate((crateName, actionName) => {
                    executeCrateAction(crateName, actionName);
                }, crate, action);

                await new Promise(resolve => setTimeout(resolve, 3000));
            }

        }, 5000);
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Run the integrated demo
const demo = new TopologyIntegratedDemo();

demo.runIntegratedDemo().catch(console.error);

// Handle cleanup
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down integrated demo...');
    await demo.cleanup();
    process.exit(0);
});

module.exports = TopologyIntegratedDemo;