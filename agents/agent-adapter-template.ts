/**
 * CTAS-7 Agent Adapter Template
 * Lightweight Node.js wrapper for LLM APIs to enable agent mesh NOW
 * 
 * Phase 1: Get agents operational with API wrappers
 * Phase 2: Migrate to full Rust implementations
 */

import express, { Express, Request, Response } from 'express';
import { Server, ServerCredentials, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

interface AgentConfig {
  name: string;
  agentId: string;
  httpPort: number;
  grpcPort: number;
  systemPrompt: string;
  apiProvider: 'claude' | 'gpt' | 'gemini' | 'grok';
  apiKey: string;
  specialization: string[];
}

interface TaskRequest {
  task: string;
  context?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

interface TaskResponse {
  agent: string;
  agentId: string;
  response: string;
  timestamp: string;
  processingTimeMs: number;
}

class AgentAdapter {
  private httpServer: Express;
  private grpcServer: Server;
  private llmClient: any;
  private startTime: Date;

  constructor(private config: AgentConfig) {
    this.httpServer = express();
    this.grpcServer = new Server();
    this.startTime = new Date();
    this.initializeLLM();
    this.setupRoutes();
  }

  private initializeLLM() {
    switch (this.config.apiProvider) {
      case 'claude':
        this.llmClient = new Anthropic({ apiKey: this.config.apiKey });
        break;
      case 'gemini':
        // TODO: Add Google Gemini client
        console.warn(`⚠️  Gemini client not yet implemented for ${this.config.name}`);
        break;
      case 'grok':
        // TODO: Add xAI Grok client
        console.warn(`⚠️  Grok client not yet implemented for ${this.config.name}`);
        break;
      case 'gpt':
        // TODO: Add OpenAI GPT client
        console.warn(`⚠️  GPT client not yet implemented for ${this.config.name}`);
        break;
    }
  }

  private setupRoutes() {
    // Middleware
    this.httpServer.use(express.json());
    this.httpServer.use((req, res, next) => {
      console.log(`[${this.config.name}] ${req.method} ${req.path}`);
      next();
    });

    // Health endpoint
    this.httpServer.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        agent_id: this.config.agentId,
        agent_name: this.config.name,
        specialization: this.config.specialization,
        ports: {
          http: this.config.httpPort,
          grpc: this.config.grpcPort
        },
        api_provider: this.config.apiProvider,
        uptime_seconds: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
        timestamp: new Date().toISOString()
      });
    });

    // Task dispatch endpoint
    this.httpServer.post('/agents/dispatch', async (req: Request, res: Response) => {
      try {
        const taskRequest: TaskRequest = req.body;
        const startTime = Date.now();
        
        const response = await this.processTask(taskRequest);
        
        res.json({
          ...response,
          processingTimeMs: Date.now() - startTime
        });
      } catch (error: any) {
        console.error(`[${this.config.name}] Error processing task:`, error);
        res.status(500).json({
          error: 'Task processing failed',
          message: error.message,
          agent: this.config.name
        });
      }
    });

    // Capabilities endpoint
    this.httpServer.get('/capabilities', (req: Request, res: Response) => {
      res.json({
        agent: this.config.name,
        agent_id: this.config.agentId,
        specialization: this.config.specialization,
        system_prompt: this.config.systemPrompt,
        api_provider: this.config.apiProvider,
        endpoints: [
          'GET /health',
          'POST /agents/dispatch',
          'GET /capabilities'
        ]
      });
    });
  }

  private async processTask(taskRequest: TaskRequest): Promise<TaskResponse> {
    const { task, context, priority } = taskRequest;

    if (!this.llmClient) {
      throw new Error(`LLM client not initialized for ${this.config.apiProvider}`);
    }

    // Build context-enhanced prompt
    let fullPrompt = task;
    if (context) {
      fullPrompt = `Context: ${JSON.stringify(context)}\n\nTask: ${task}`;
    }

    // Call LLM (Claude implementation)
    if (this.config.apiProvider === 'claude') {
      const response = await this.llmClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: this.config.systemPrompt,
        messages: [{ role: 'user', content: fullPrompt }]
      });

      return {
        agent: this.config.name,
        agentId: this.config.agentId,
        response: response.content[0].text,
        timestamp: new Date().toISOString(),
        processingTimeMs: 0 // Will be filled by caller
      };
    }

    throw new Error(`Provider ${this.config.apiProvider} not yet implemented`);
  }

  async start() {
    // Start HTTP server
    this.httpServer.listen(this.config.httpPort, () => {
      console.log(`✅ ${this.config.name} (${this.config.agentId})`);
      console.log(`   HTTP: http://localhost:${this.config.httpPort}`);
      console.log(`   gRPC: grpc://localhost:${this.config.grpcPort}`);
      console.log(`   Provider: ${this.config.apiProvider}`);
      console.log(`   Specialization: ${this.config.specialization.join(', ')}`);
    });

    // TODO: Start gRPC server
    // For now, just log that it's planned
    console.log(`   ⏳ gRPC server (${this.config.grpcPort}) - Coming soon\n`);
  }
}

export { AgentAdapter, AgentConfig, TaskRequest, TaskResponse };

