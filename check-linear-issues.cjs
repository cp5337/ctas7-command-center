#!/usr/bin/env node
/**
 * Check what's actually in Linear
 */

const { LinearClient } = require('@linear/sdk');

const LINEAR_API_KEY = 'YOUR_LINEAR_API_KEY';
const TEAM_ID = '979acadf-8301-459e-9e51-bf3c1f60e496';

const client = new LinearClient({ apiKey: LINEAR_API_KEY });

async function checkLinear() {
  try {
    console.log('🔍 Checking Linear status...\n');
    
    // Get team info
    const team = await client.team(TEAM_ID);
    console.log(`✅ Team: ${team.name} (${team.key})`);
    
    // Get all issues
    const issues = await client.issues({
      filter: {
        team: { id: { eq: TEAM_ID } }
      }
    });
    
    const issueList = await issues.nodes;
    console.log(`\n📊 Total Issues: ${issueList.length}`);
    
    if (issueList.length > 0) {
      console.log('\n📋 Recent Issues (Last 10):');
      issueList.slice(0, 10).forEach((issue, i) => {
        console.log(`  ${i+1}. ${team.key}-${issue.number}: ${issue.title}`);
      });
    } else {
      console.log('\n⚠️  No issues found in Linear!');
    }
    
    // Get all projects
    const projects = await client.projects({
      filter: {
        teams: { some: { id: { eq: TEAM_ID } } }
      }
    });
    
    const projectList = await projects.nodes;
    console.log(`\n📁 Total Projects/Epics: ${projectList.length}`);
    
    if (projectList.length > 0) {
      console.log('\n📁 Projects:');
      projectList.slice(0, 10).forEach((project, i) => {
        console.log(`  ${i+1}. ${project.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkLinear();

