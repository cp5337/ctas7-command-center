// CTAS Linear Integration Service - Real Linear API Integration
export class CTASLinearService {
  private apiKey: string;
  private apiEndpoint = 'https://api.linear.app/graphql';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // GraphQL query helper
  private async query(query: string, variables?: any) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.apiKey,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }

    return data.data;
  }

  // Get CTAS teams from Linear
  async getCTASTeams() {
    const query = `
      query GetTeams {
        teams {
          nodes {
            id
            name
            key
            description
            private
          }
        }
      }
    `;

    const data = await this.query(query);
    return data.teams.nodes.filter((team: any) =>
      team.name.includes('CTAS') ||
      team.key.includes('CTAS') ||
      team.description?.includes('CTAS')
    );
  }

  // Get CTAS issues/tasks
  async getCTASIssues(first = 50) {
    const query = `
      query GetIssues($first: Int!) {
        issues(first: $first) {
          nodes {
            id
            identifier
            title
            description
            priority
            state {
              id
              name
              type
            }
            assignee {
              id
              name
              displayName
              avatarUrl
            }
            team {
              id
              name
              key
            }
            project {
              id
              name
            }
            cycle {
              id
              name
              startsAt
              endsAt
            }
            labels {
              nodes {
                id
                name
                color
              }
            }
            estimate
            dueDate
            createdAt
            updatedAt
            comments {
              nodes {
                id
              }
            }
          }
        }
      }
    `;

    const data = await this.query(query, { first });

    // Filter for CTAS-related issues
    return data.issues.nodes.filter((issue: any) =>
      issue.team?.name.includes('CTAS') ||
      issue.team?.key.includes('CTAS') ||
      issue.title.includes('CTAS') ||
      issue.labels?.nodes.some((label: any) =>
        label.name.includes('ctas') ||
        label.name.includes('domain') ||
        label.name.includes('devsecops')
      )
    );
  }

  // Get CTAS projects
  async getCTASProjects(first = 20) {
    const query = `
      query GetProjects($first: Int!) {
        projects(first: $first) {
          nodes {
            id
            name
            description
            state
            progress
            targetDate
            startDate
            completedAt
            lead {
              id
              name
              displayName
            }
            teams {
              nodes {
                id
                name
                key
              }
            }
            issues {
              nodes {
                id
                state {
                  type
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.query(query, { first });

    // Filter for CTAS projects
    return data.projects.nodes.filter((project: any) =>
      project.name.includes('CTAS') ||
      project.description?.includes('CTAS') ||
      project.teams?.nodes.some((team: any) =>
        team.name.includes('CTAS') || team.key.includes('CTAS')
      )
    );
  }

  // Get CTAS cycles
  async getCTASCycles(first = 10) {
    const query = `
      query GetCycles($first: Int!) {
        cycles(first: $first) {
          nodes {
            id
            name
            number
            startsAt
            endsAt
            completedAt
            progress
            team {
              id
              name
              key
            }
            issues {
              nodes {
                id
                state {
                  type
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.query(query, { first });

    // Filter for CTAS cycles
    return data.cycles.nodes.filter((cycle: any) =>
      cycle.team?.name.includes('CTAS') ||
      cycle.team?.key.includes('CTAS') ||
      cycle.name.includes('CTAS')
    );
  }

  // Create CTAS issue with domain and DevSecOps metadata
  async createCTASIssue({
    title,
    description,
    teamId,
    projectId,
    assigneeId,
    priority = 3,
    domain,
    devSecOpsPhase,
    qualityLevel
  }: {
    title: string;
    description: string;
    teamId: string;
    projectId?: string;
    assigneeId?: string;
    priority?: number;
    domain?: number;
    devSecOpsPhase?: string;
    qualityLevel?: string;
  }) {
    // First, get or create labels for CTAS metadata
    const labels = [];

    if (domain) {
      labels.push(`domain-${domain}`);
    }

    if (devSecOpsPhase) {
      labels.push(`phase-${devSecOpsPhase.toLowerCase()}`);
    }

    if (qualityLevel) {
      labels.push(`qa-${qualityLevel.toLowerCase()}`);
    }

    labels.push('ctas-system');

    const mutation = `
      mutation CreateIssue(
        $title: String!
        $description: String
        $teamId: String!
        $projectId: String
        $assigneeId: String
        $priority: Int
      ) {
        issueCreate(input: {
          title: $title
          description: $description
          teamId: $teamId
          projectId: $projectId
          assigneeId: $assigneeId
          priority: $priority
        }) {
          success
          issue {
            id
            identifier
            title
          }
        }
      }
    `;

    const data = await this.query(mutation, {
      title,
      description,
      teamId,
      projectId,
      assigneeId,
      priority
    });

    return data.issueCreate;
  }

  // Update issue
  async updateIssue(issueId: string, updates: any) {
    const mutation = `
      mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id
            identifier
            title
          }
        }
      }
    `;

    return await this.query(mutation, {
      id: issueId,
      input: updates
    });
  }

  // Convert Linear data to CTAS format
  convertLinearIssueToCTAS(issue: any) {
    return {
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description || '',
      status: this.mapLinearStateToStatus(issue.state?.type),
      priority: this.mapLinearPriorityToCTAS(issue.priority),
      assignee: issue.assignee ? {
        name: issue.assignee.displayName || issue.assignee.name,
        avatar: issue.assignee.avatarUrl || '👤'
      } : undefined,
      labels: issue.labels?.nodes.map((label: any) => label.name) || [],
      estimate: issue.estimate || undefined,
      team: issue.team?.name || '',
      project: issue.project?.name || undefined,
      cycle: issue.cycle?.name || undefined,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      dueDate: issue.dueDate || undefined,
      comments: issue.comments?.nodes.length || 0,
      linkedPRs: 0, // Would need GitHub integration
      automationTriggers: this.extractAutomationTriggers(issue.labels?.nodes || []),
      ctasDomain: this.extractCTASDomain(issue.labels?.nodes || []),
      devSecOpsPhase: this.extractDevSecOpsPhase(issue.labels?.nodes || []),
      qualityLevel: this.extractQualityLevel(issue.labels?.nodes || [])
    };
  }

  // Helper methods
  private mapLinearStateToStatus(stateType: string): 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done' | 'canceled' {
    switch (stateType) {
      case 'backlog': return 'backlog';
      case 'unstarted': return 'todo';
      case 'started': return 'in-progress';
      case 'completed': return 'done';
      case 'canceled': return 'canceled';
      default: return 'todo';
    }
  }

  private mapLinearPriorityToCTAS(priority: number): 'urgent' | 'high' | 'medium' | 'low' | 'no-priority' {
    if (priority === 1) return 'urgent';
    if (priority === 2) return 'high';
    if (priority === 3) return 'medium';
    if (priority === 4) return 'low';
    return 'no-priority';
  }

  private extractCTASDomain(labels: any[]): number | undefined {
    const domainLabel = labels.find(label => label.name.startsWith('domain-'));
    return domainLabel ? parseInt(domainLabel.name.split('-')[1]) : undefined;
  }

  private extractDevSecOpsPhase(labels: any[]): string | undefined {
    const phaseLabel = labels.find(label => label.name.startsWith('phase-'));
    return phaseLabel ? phaseLabel.name.split('-')[1] : undefined;
  }

  private extractQualityLevel(labels: any[]): string | undefined {
    const qaLabel = labels.find(label => label.name.startsWith('qa-'));
    return qaLabel ? qaLabel.name.toUpperCase() : undefined;
  }

  private extractAutomationTriggers(labels: any[]): string[] {
    return labels
      .filter(label => label.name.startsWith('trigger-'))
      .map(label => label.name.replace('trigger-', ''));
  }
}

// Create service instance - will only work if Linear API key is provided
export const linearService = process.env.REACT_APP_LINEAR_API_KEY
  ? new CTASLinearService(process.env.REACT_APP_LINEAR_API_KEY)
  : null;