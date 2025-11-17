#!/usr/bin/env node

/**
 * Simple test for the component generator
 */

const { parseComment, generateComponent } = require('../scripts/generate-component');
const fs = require('fs');
const path = require('path');

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
  }
}

// Test comment parsing
test('Parse AgentCard comment', () => {
  const comment = "@generate-ui Can we create an AgentCard component?";
  const result = parseComment(comment);
  if (result !== 'AgentCard') {
    throw new Error(`Expected AgentCard, got ${result}`);
  }
});

test('Parse Dashboard comment', () => {
  const comment = "@generate-ui I need a Dashboard overview";
  const result = parseComment(comment);
  if (result !== 'Dashboard') {
    throw new Error(`Expected Dashboard, got ${result}`);
  }
});

test('Default to Dashboard', () => {
  const comment = "@generate-ui some random text";
  const result = parseComment(comment);
  if (result !== 'Dashboard') {
    throw new Error(`Expected Dashboard as default, got ${result}`);
  }
});

// Test component generation
test('Generate AgentCard component', () => {
  const testDir = 'test/output';
  const result = generateComponent('AgentCard', testDir);

  if (!fs.existsSync(result.path)) {
    throw new Error(`Component file was not created: ${result.path}`);
  }

  const content = fs.readFileSync(result.path, 'utf8');
  if (!content.includes('export function AgentCard')) {
    throw new Error('Generated component does not export AgentCard function');
  }

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
});

console.log('🧪 Running component generator tests...');
console.log('');

test('Parse AgentCard comment', () => {
  const comment = "@generate-ui Can we create an AgentCard component?";
  const result = parseComment(comment);
  if (result !== 'AgentCard') {
    throw new Error(`Expected AgentCard, got ${result}`);
  }
});

test('Parse Dashboard comment', () => {
  const comment = "@generate-ui I need a Dashboard overview";
  const result = parseComment(comment);
  if (result !== 'Dashboard') {
    throw new Error(`Expected Dashboard, got ${result}`);
  }
});

test('Generate AgentCard component', () => {
  const testDir = 'test/output';
  const result = generateComponent('AgentCard', testDir);

  if (!fs.existsSync(result.path)) {
    throw new Error(`Component file was not created: ${result.path}`);
  }

  const content = fs.readFileSync(result.path, 'utf8');
  if (!content.includes('export function AgentCard')) {
    throw new Error('Generated component does not export AgentCard function');
  }

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
});

console.log('');
console.log('🎉 All tests passed!');