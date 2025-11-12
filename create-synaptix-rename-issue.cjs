#!/usr/bin/env node
/**
 * Create Linear issue for incremental Synaptix rename
 */

require('dotenv').config();
const { LinearClient } = require('@linear/sdk');

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const TEAM_ID = '979acadf-8301-459e-9e51-bf3c1f60e496';

if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY not set. Add it to your .env file.');
  process.exit(1);
}

const client = new LinearClient({ apiKey: LINEAR_API_KEY });

async function createRenameIssue() {
  try {
    console.log('🏷️  Creating Synaptix Rename Issue...');

    // Verify connection first
    const me = await client.viewer;
    console.log(`✅ Connected as: ${me.name || me.email}`);

    const result = await client.createIssue({
      teamId: TEAM_ID,
      title: 'Incremental Synaptix Rename - Refactor When Touching Crates',
      description: `# Gradual Synaptix Brand Migration

## Strategy
Rename from "Cognetix" → "Synaptix" **incrementally** - only when touching a crate for other work (QA, Smart Crate updates, bug fixes).

## Naming Rules
- **New code**: Always use \`synaptix-*\` prefix
- **Customer-facing**: Synaptix Plasma, Synaptix Core, Synaptix Memory Fabric
- **Internal stable code**: Keep \`cognetix\` to avoid breaking changes
- **Linear team**: Keep "CognetixALPHA (COG)" for stability

## Refactor Targets (When Touched)
- [ ] \`ctas7-plasma\` → \`synaptix-plasma\`
- [ ] \`cognetix-abe\` → \`synaptix-abe\`
- [ ] \`Cognitive Tactics Engine\` → \`Synaptix Tactics Engine\`
- [ ] Frontend references: "Cognetix" → "Synaptix"
- [ ] API endpoints: \`/cognetix/*\` → \`/synaptix/*\` (with alias)
- [ ] Documentation: Update customer-facing docs only

## Implementation
**DO NOT do mass rename!** Only rename when:
1. Doing QA on a crate
2. Updating Smart Crate
3. Fixing bugs
4. Adding features
5. Touching imports/dependencies

## Tracking
Add subtask for each crate renamed:
- Document old name
- Document new name
- Update imports
- Update tests
- Update docs

## Priority
🟡 **LOW** - This happens organically over time, not a blocker.
`,
      priority: 3 // Normal priority
    });

    console.log(`✅ Issue created: COG-${result.issue.number}`);
    console.log(`🔗 URL: https://linear.app/cognetixalpha/issue/COG-${result.issue.number}`);

  } catch (error) {
    console.error('❌ Failed to create issue:', error.message);
  }
}

createRenameIssue();
