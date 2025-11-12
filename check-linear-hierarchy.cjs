#!/usr/bin/env node
/**
 * Check Linear hierarchy structure
 * Initiative → Project → Issue → Sub-issue
 */

require('dotenv').config();
const { LinearClient } = require('@linear/sdk');

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const TEAM_ID = '979acadf-8301-459e-9e51-bf3c1f60e496';

if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY not set. Add it to your .env file or export the variable before running this script.');
  process.exit(1);
}

const client = new LinearClient({ apiKey: LINEAR_API_KEY });

async function checkHierarchy() {
  try {
    console.log('🔍 Checking Linear Hierarchy...\n');

    console.log('📊 LINEAR HIERARCHY STRUCTURE:');
    console.log('  Initiative (highest level - multi-project)');
    console.log('    ↓');
    console.log('  Project/Epic (collection of issues)');
    console.log('    ↓');
    console.log('  Issue (individual task) ← 255 char description limit!');
    console.log('    ↓');
    console.log('  Sub-issue (subtask)\n');

    // Get what we actually created
    console.log('=' .repeat(60));
    console.log('WHAT WE CREATED:\n');

    // Check Projects (we called these "epics")
    console.log('📁 PROJECTS (what we called "epics"):');
    const projectsResult = await client.client.rawRequest(`
      query {
        team(id: "${TEAM_ID}") {
          projects(first: 20, orderBy: createdAt) {
            nodes {
              id
              name
              description
              state
              issuesCount: issues {
                nodes {
                  id
                  title
                }
              }
            }
          }
        }
      }
    `);

    const projects = projectsResult.data.team.projects.nodes;
    console.log(`  Total: ${projects.length}`);

    if (projects.length > 0) {
      console.log('\n  Recent Projects:');
      projects.slice(0, 5).forEach((proj, i) => {
        const issueCount = proj.issuesCount.nodes.length;
        console.log(`    ${i+1}. ${proj.name.substring(0, 60)}...`);
        console.log(`       State: ${proj.state}, Issues: ${issueCount}`);
        if (proj.description) {
          console.log(`       Description: ${proj.description.substring(0, 80)}...`);
        }
      });
    }

    // Check Issues
    console.log('\n📋 ISSUES:');
    const issuesResult = await client.client.rawRequest(`
      query {
        team(id: "${TEAM_ID}") {
          issues(first: 20, orderBy: createdAt) {
            nodes {
              id
              identifier
              title
              description
              parent {
                id
                identifier
                title
              }
              project {
                id
                name
              }
              children {
                nodes {
                  id
                  identifier
                  title
                }
              }
            }
          }
        }
      }
    `);

    const issues = issuesResult.data.team.issues.nodes;
    console.log(`  Total: ${issues.length}`);

    // Analyze structure
    const topLevel = issues.filter(i => !i.parent);
    const withParent = issues.filter(i => i.parent);
    const withChildren = issues.filter(i => i.children.nodes.length > 0);
    const inProject = issues.filter(i => i.project);

    console.log(`\n  Structure Analysis:`);
    console.log(`    Top-level issues (no parent): ${topLevel.length}`);
    console.log(`    Sub-issues (have parent): ${withParent.length}`);
    console.log(`    Issues with children: ${withChildren.length}`);
    console.log(`    Issues in projects: ${inProject.length}`);

    // Show examples
    console.log('\n  Example Top-Level Issues:');
    topLevel.slice(0, 3).forEach((issue, i) => {
      console.log(`    ${i+1}. ${issue.identifier}: ${issue.title.substring(0, 50)}...`);
      if (issue.project) {
        console.log(`       Project: ${issue.project.name.substring(0, 40)}`);
      }
      if (issue.children.nodes.length > 0) {
        console.log(`       Children: ${issue.children.nodes.length} sub-issues`);
      }
    });

    // Check for description length issues
    console.log('\n⚠️  DESCRIPTION LENGTH CHECK:');
    const longDescriptions = issues.filter(i => i.description && i.description.length > 255);
    console.log(`  Issues with descriptions >255 chars: ${longDescriptions.length}`);

    if (longDescriptions.length > 0) {
      console.log('  (These would fail if we tried to create them)');
    }

    console.log('\n' + '='.repeat(60));
    console.log('RECOMMENDED STRUCTURE:\n');
    console.log('✅ Initiative: "CTAS-7 Discovery & Framework Generation"');
    console.log('   ↓');
    console.log('✅ Project: "Discovery Scripts Phase"');
    console.log('   ↓');
    console.log('✅ Issue: "Extract Caldera Operations" (parent)');
    console.log('   ↓');
    console.log('✅ Sub-issue: "Parse YAML files"');
    console.log('✅ Sub-issue: "Generate manifest"');
    console.log('\n❌ WRONG (what we did):');
    console.log('   Project: "File: /long/path/name.py" ← Too long for project name!');
    console.log('   Issue: *long description* ← Too long for issue description!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      error.errors.forEach(e => console.error('  ', e.message));
    }
  }
}

checkHierarchy();
