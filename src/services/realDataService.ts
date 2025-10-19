/**
 * Real Data Service - Replace Mock Data with Live APIs
 * Integrates Linear, RepoAgent, and backend services
 */

import { Persona, Task, SystemMetric } from '../types';

// Vite environment variable (fallback provided for local/dev)
const LINEAR_API_KEY = (import.meta as any).env?.VITE_LINEAR_API_KEY || 'your_linear_api_key_here';

/**
 * Fetch real agent personas from backend or use defaults
 */
export async function getRealPersonas(): Promise<Persona[]> {
  try {
    // Try RepoAgent first
    const response = await fetch('/api/repo/agents/list', {
      timeout: 2000
    });
    
    if (response.ok) {
      const agents = await response.json();
      return agents.map((agent: any) => ({
        id: agent.id || agent.name.toLowerCase().replace(/\s+/g, '-'),
        name: agent.name,
        role: agent.role || 'AI Agent',
        model: agent.llm_provider || 'Unknown',
        avatar: agent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=random`,
        status: agent.status || 'online',
        lastSeen: 'Active',
        capabilities: agent.capabilities || []
      }));
    }
  } catch (error) {
    console.log('RepoAgent not available, returning empty personas');
  }

  // No fallback personas; only real sources allowed
  return [];
}

/**
 * Fetch real tasks from Linear
 */
export async function getRealTasks(): Promise<Task[]> {
  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': LINEAR_API_KEY
      },
      body: JSON.stringify({
        query: `
          query {
            issues(first: 20, filter: { state: { type: { nin: ["completed", "canceled"] } } }) {
              nodes {
                id
                title
                description
                priority
                state {
                  name
                  type
                }
                assignee {
                  name
                }
                dueDate
                createdAt
                updatedAt
              }
            }
          }
        `
      })
    });

    if (response.ok) {
      const data = await response.json();
      const issues = data.data?.issues?.nodes || [];
      
      return issues.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        description: issue.description || '',
        status: mapLinearStateToStatus(issue.state.type),
        priority: mapLinearPriority(issue.priority),
        assignee: issue.assignee?.name || 'Unassigned',
        dueDate: issue.dueDate || undefined,
        tags: []
      }));
    }
  } catch (error) {
    console.error('Failed to fetch Linear tasks:', error);
  }

  // Fallback to empty array (will show "No tasks" instead of mock data)
  return [];
}

function mapLinearStateToStatus(stateType: string): 'todo' | 'in-progress' | 'review' | 'done' {
  switch (stateType.toLowerCase()) {
    case 'backlog':
    case 'unstarted':
      return 'todo';
    case 'started':
      return 'in-progress';
    case 'completed':
      return 'done';
    default:
      return 'todo';
  }
}

function mapLinearPriority(priority: number): 'low' | 'medium' | 'high' | 'critical' {
  if (priority >= 1 && priority <= 2) return 'critical';
  if (priority === 3) return 'high';
  if (priority === 4) return 'medium';
  return 'low';
}

/**
 * Fetch real system metrics from backends
 */
export async function getRealMetrics(): Promise<SystemMetric[]> {
  const metrics: SystemMetric[] = [];

  // Check Hashing Service
  try {
    const response = await fetch('http://localhost:18105/health', { timeout: 1000 });
    if (response.ok) {
      const data = await response.json();
      metrics.push({
        id: 'hashing-engine',
        name: 'Hashing Engine',
        value: 100,
        unit: '%',
        trend: 'stable',
        status: 'healthy'
      });
    }
  } catch {
    metrics.push({
      id: 'hashing-engine',
      name: 'Hashing Engine',
      value: 0,
      unit: '%',
      trend: 'down',
      status: 'critical'
    });
  }

  // Check SurrealDB
  try {
    const response = await fetch('http://localhost:11451/health', { timeout: 1000 });
    metrics.push({
      id: 'surrealdb',
      name: 'SurrealDB',
      value: response.ok ? 100 : 0,
      unit: '%',
      trend: response.ok ? 'stable' : 'down',
      status: response.ok ? 'healthy' : 'critical'
    });
  } catch {
    metrics.push({
      id: 'surrealdb',
      name: 'SurrealDB',
      value: 0,
      unit: '%',
      trend: 'down',
      status: 'critical'
    });
  }

  // Check Supabase
  try {
    const response = await fetch('https://kxabqezjpglbbrjdpdmv.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4YWJxZXpqcGdsYmJyamRwZG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMjgwOTQsImV4cCI6MjA1NjkwNDA5NH0.rkf3pwovRxiYaivtEUoQ4M_Mpm1QpT3uInXMi02hga8'
      },
      timeout: 2000
    });
    metrics.push({
      id: 'supabase',
      name: 'Supabase',
      value: response.ok ? 100 : 0,
      unit: '%',
      trend: response.ok ? 'stable' : 'down',
      status: response.ok ? 'healthy' : 'warning'
    });
  } catch {
    metrics.push({
      id: 'supabase',
      name: 'Supabase',
      value: 0,
      unit: '%',
      trend: 'down',
      status: 'warning'
    });
  }

  // Check Statistical CDN
  try {
    const response = await fetch('/api/stat/health', { timeout: 1000 });
    if (response.ok) {
      metrics.push({
        id: 'statistical-cdn',
        name: 'Statistical CDN',
        value: 100,
        unit: '%',
        trend: 'stable',
        status: 'healthy'
      });
    }
  } catch {
    metrics.push({
      id: 'statistical-cdn',
      name: 'Statistical CDN',
      value: 0,
      unit: '%',
      trend: 'down',
      status: 'warning'
    });
  }

  return metrics;
}

/**
 * Initialize all real data sources
 */
export async function initializeRealData() {
  const [personas, tasks, metrics] = await Promise.all([
    getRealPersonas(),
    getRealTasks(),
    getRealMetrics()
  ]);

  return { personas, tasks, metrics };
}


