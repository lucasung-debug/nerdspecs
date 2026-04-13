// @TASK P2-R5-T2 - LLM Provider Tests
// @TEST tests/llm.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockProvider } from '../src/llm/mock-provider.js';
import { createLLMProvider } from '../src/llm/index.js';
import { generateProjectSummary } from '../src/generators/summary.js';
import type { SummaryContext } from '../src/llm/provider.js';

const BLOCKLIST = ['algorithm', 'API endpoint', 'middleware', 'singleton', 'instantiate', 'refactor', 'transpile'];

const sampleContext: SummaryContext = {
  project_name: 'my-store',
  primary_language: 'TypeScript',
  framework: 'express',
  dependencies: ['commander', 'chalk', 'ora'],
  entry_file: 'src/index.ts',
  motivation: 'sell products online',
};

describe('MockProvider', () => {
  const mock = new MockProvider();

  it('generateSummary returns a non-empty string', async () => {
    const result = await mock.generateSummary(sampleContext);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('generateSummary contains the project name', async () => {
    const result = await mock.generateSummary(sampleContext);
    expect(result).toContain(sampleContext.project_name);
  });

  it('generateSummary passes non-developer-friendly keyword check', async () => {
    const result = await mock.generateSummary(sampleContext);
    for (const word of BLOCKLIST) {
      expect(result.toLowerCase()).not.toContain(word.toLowerCase());
    }
  });

  it('generatePainPoints returns exactly 3 items', async () => {
    const points = await mock.generatePainPoints('web application');
    expect(points).toHaveLength(3);
  });

  it('generatePainPoints returns non-empty strings', async () => {
    const points = await mock.generatePainPoints('sell products online');
    points.forEach((p) => expect(p.length).toBeGreaterThan(0));
  });

  it('generateSummary includes framework clause when framework provided', async () => {
    const result = await mock.generateSummary(sampleContext);
    expect(result).toContain('express');
  });

  it('generateSummary works without optional fields', async () => {
    const minimal: SummaryContext = {
      project_name: 'bare-project',
      primary_language: 'JavaScript',
      dependencies: [],
    };
    const result = await mock.generateSummary(minimal);
    expect(result).toContain('bare-project');
  });
});

describe('createLLMProvider', () => {
  let savedAnthropicKey: string | undefined;
  let savedOpenAIKey: string | undefined;

  beforeEach(() => {
    savedAnthropicKey = process.env['ANTHROPIC_API_KEY'];
    savedOpenAIKey = process.env['OPENAI_API_KEY'];
    delete process.env['ANTHROPIC_API_KEY'];
    delete process.env['CLAUDE_API_KEY'];
    delete process.env['OPENAI_API_KEY'];
  });

  afterEach(() => {
    if (savedAnthropicKey !== undefined) process.env['ANTHROPIC_API_KEY'] = savedAnthropicKey;
    if (savedOpenAIKey !== undefined) process.env['OPENAI_API_KEY'] = savedOpenAIKey;
  });

  it('returns MockProvider when no API keys are set', async () => {
    const provider = await createLLMProvider();
    const result = await provider.generateSummary(sampleContext);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('generateProjectSummary', () => {
  it('returns summary and tech_stack_description', async () => {
    const mock = new MockProvider();
    const result = await generateProjectSummary(mock, sampleContext);
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('tech_stack_description');
  });

  it('tech_stack_description includes primary language', async () => {
    const mock = new MockProvider();
    const result = await generateProjectSummary(mock, sampleContext);
    expect(result.tech_stack_description).toContain(sampleContext.primary_language);
  });

  it('tech_stack_description includes framework when provided', async () => {
    const mock = new MockProvider();
    const result = await generateProjectSummary(mock, sampleContext);
    expect(result.tech_stack_description).toContain('express');
  });

  it('summary passes non-developer-friendly keyword check', async () => {
    const mock = new MockProvider();
    const result = await generateProjectSummary(mock, sampleContext);
    for (const word of BLOCKLIST) {
      expect(result.summary.toLowerCase()).not.toContain(word.toLowerCase());
    }
  });
});
