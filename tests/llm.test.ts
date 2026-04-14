// @TASK P2-R5-T2 - LLM Provider Tests
// @TEST tests/llm.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockProvider } from '../src/llm/mock-provider.js';
import { createLLMProvider } from '../src/llm/index.js';
import { generateProjectSummary } from '../src/generators/summary.js';
import type { SummaryContext } from '../src/llm/provider.js';
import { ClaudeProvider } from '../src/llm/claude-provider.js';
import { OpenAIProvider } from '../src/llm/openai-provider.js';
import { buildPainPointsPrompt, buildPrompt } from '../src/llm/prompts.js';

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

describe('prompt builders', () => {
  it('adds Korean instruction when ko output is requested', () => {
    const prompt = buildPrompt(sampleContext, 'ko');
    expect(prompt).toContain('Respond entirely in Korean (한국어로 답변해주세요).');
  });

  it('adds bilingual instruction when both output is requested', () => {
    const prompt = buildPrompt(sampleContext, 'both');
    expect(prompt).toContain('Provide the response first in English, then in Korean separated by ---');
  });

  it('buildPainPointsPrompt asks for exactly three pain points', () => {
    const prompt = buildPainPointsPrompt('Help teammates explain the product faster.');
    expect(prompt).toContain('exactly 3 short pain points');
    expect(prompt).toContain('JSON array');
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
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (savedAnthropicKey !== undefined) process.env['ANTHROPIC_API_KEY'] = savedAnthropicKey;
    if (savedOpenAIKey !== undefined) process.env['OPENAI_API_KEY'] = savedOpenAIKey;
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('returns MockProvider when no API keys are set', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const provider = await createLLMProvider();
    const result = await provider.generateSummary(sampleContext);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(warn).toHaveBeenCalledWith('⚠ No API key found. Using offline mode — summaries will be template-based.');
  });
});

describe('provider retry behavior', () => {
  const originalAnthropicKey = process.env['ANTHROPIC_API_KEY'];
  const originalOpenAIKey = process.env['OPENAI_API_KEY'];

  beforeEach(() => {
    process.env['ANTHROPIC_API_KEY'] = 'test-claude-key';
    process.env['OPENAI_API_KEY'] = 'test-openai-key';
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (originalAnthropicKey === undefined) {
      delete process.env['ANTHROPIC_API_KEY'];
    } else {
      process.env['ANTHROPIC_API_KEY'] = originalAnthropicKey;
    }

    if (originalOpenAIKey === undefined) {
      delete process.env['OPENAI_API_KEY'];
    } else {
      process.env['OPENAI_API_KEY'] = originalOpenAIKey;
    }

    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('retries Claude requests once after a transient failure', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ type: 'text', text: 'Claude summary' }] }),
      } satisfies Partial<Response>);
    vi.stubGlobal('fetch', fetchMock);

    const resultPromise = new ClaudeProvider().generateSummary(sampleContext);
    await vi.runAllTimersAsync();

    await expect(resultPromise).resolves.toBe('Claude summary');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries OpenAI requests once after a transient failure', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'OpenAI summary' } }] }),
      } satisfies Partial<Response>);
    vi.stubGlobal('fetch', fetchMock);

    const resultPromise = new OpenAIProvider().generateSummary(sampleContext);
    await vi.runAllTimersAsync();

    await expect(resultPromise).resolves.toBe('OpenAI summary');
    expect(fetchMock).toHaveBeenCalledTimes(2);
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

  it('passes requested output language through to the provider', async () => {
    const provider = { generateSummary: vi.fn().mockResolvedValue('Korean summary') };
    const context: SummaryContext = { ...sampleContext, language: 'ko' };

    await generateProjectSummary(provider as any, context);

    expect(provider.generateSummary).toHaveBeenCalledWith(context, 'ko');
  });
});
