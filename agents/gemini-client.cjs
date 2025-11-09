#!/usr/bin/env node
/**
 * Gemini API Client for Marcus and Elena
 * Pay-per-use, no ongoing costs
 */

const https = require('https');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_FLASH_MODEL = process.env.GEMINI_FLASH_MODEL || 'gemini-2.0-flash-exp';
const GEMINI_PRO_MODEL = process.env.GEMINI_PRO_MODEL || 'gemini-2.0-pro-exp';

/**
 * Call Gemini API (pay-per-token)
 * @param {string} prompt - The prompt to send
 * @param {object} options - Options
 * @param {string} options.model - Model to use (flash or pro)
 * @param {string} options.agent - Agent name (marcus or elena)
 * @param {number} options.maxTokens - Max output tokens
 * @returns {Promise<string>} - Response text
 */
async function callGemini(prompt, options = {}) {
  const model = options.model === 'pro' ? GEMINI_PRO_MODEL : GEMINI_FLASH_MODEL;
  const agent = options.agent || 'unknown';
  const maxTokens = options.maxTokens || 8192;

  if (!GEMINI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY not set. Get one from https://aistudio.google.com/app/apikey');
  }

  console.log(`[${agent}] Calling Gemini ${model}...`);
  console.log(`[${agent}] Prompt length: ${prompt.length} chars`);

  const requestBody = JSON.stringify({
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
    }
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.error(`[${agent}] Gemini API error: ${res.statusCode}`);
          console.error(data);
          reject(new Error(`Gemini API error: ${res.statusCode}`));
          return;
        }

        try {
          const response = JSON.parse(data);
          const text = response.candidates[0].content.parts[0].text;
          
          // Log token usage for cost tracking
          if (response.usageMetadata) {
            const inputTokens = response.usageMetadata.promptTokenCount;
            const outputTokens = response.usageMetadata.candidatesTokenCount;
            const totalTokens = response.usageMetadata.totalTokenCount;
            
            // Calculate cost (Flash pricing)
            const inputCost = (inputTokens / 1000000) * 0.075;
            const outputCost = (outputTokens / 1000000) * 0.30;
            const totalCost = inputCost + outputCost;
            
            console.log(`[${agent}] Tokens: ${inputTokens} in, ${outputTokens} out, ${totalTokens} total`);
            console.log(`[${agent}] Cost: $${totalCost.toFixed(4)} (input: $${inputCost.toFixed(4)}, output: $${outputCost.toFixed(4)})`);
          }
          
          console.log(`[${agent}] Response length: ${text.length} chars`);
          resolve(text);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(requestBody);
    req.end();
  });
}

/**
 * Marcus: Analyze architecture with 2M context
 */
async function marcusAnalyze(prompt, usePro = false) {
  return callGemini(prompt, {
    model: usePro ? 'pro' : 'flash',
    agent: 'Marcus',
    maxTokens: 8192
  });
}

/**
 * Elena: Creative/marketing analysis with 2M context
 */
async function elenaAnalyze(prompt, usePro = false) {
  return callGemini(prompt, {
    model: usePro ? 'pro' : 'flash',
    agent: 'Elena',
    maxTokens: 8192
  });
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const agent = args[0]; // 'marcus' or 'elena'
  const prompt = args.slice(1).join(' ');

  if (!agent || !prompt) {
    console.log('Usage: node gemini-client.cjs <marcus|elena> <prompt>');
    console.log('Example: node gemini-client.cjs marcus "Analyze CTAS architecture"');
    process.exit(1);
  }

  const analyze = agent === 'marcus' ? marcusAnalyze : elenaAnalyze;
  
  analyze(prompt)
    .then(response => {
      console.log('\n--- Response ---');
      console.log(response);
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}

module.exports = { callGemini, marcusAnalyze, elenaAnalyze };

