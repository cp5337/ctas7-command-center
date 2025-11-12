const express = require('express');
const { LinearClient } = require('@linear/sdk');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 15182;
const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });

// ASCII Banner
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     CTAS-7 Linear Integration Server v7.1.1              ║
║     GraphQL Wrapper for Linear API                       ║
║                                                           ║
║     Port: ${PORT}                                         ║
║     Status: ONLINE                                       ║
║     Team: CognetixALPHA (COG)                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

app.get('/health', (req, res) => {
  res.json({ status: 'online', service: 'linear-integration', port: PORT });
});

app.post('/issues/create', async (req, res) => {
  try {
    const issue = await linear.issueCreate({
      teamId: process.env.LINEAR_TEAM_ID || '979acadf-8301-459e-9e51-bf3c1f60e496',
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      estimate: req.body.estimate
    });
    res.json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/webhooks/linear', async (req, res) => {
  console.log('📥 Linear webhook:', req.body.action);
  // Route to RepoAgent Gateway or Linear Agent
  res.json({ status: 'processed' });
});

app.listen(PORT, () => {
  console.log(`✅ Linear Integration Server listening on port ${PORT}`);
});
