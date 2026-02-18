import { createOpenAI, openai } from '@ai-sdk/openai';

// OpenAI provider (original, kept as alternative)
export function getOpenAIModel(modelId?: string) {
	return openai(modelId || 'gpt-4o-mini');
}

// OpenRouter provider (active) — use .chat() for Chat Completions API
// (default provider() returns Responses API model, which OpenRouter doesn't support)
const openrouter = createOpenAI({
	baseURL: 'https://openrouter.ai/api/v1',
	apiKey: process.env.OPENROUTER_API_KEY,
	name: 'openrouter',
});

export function getModel(modelId?: string) {
	return openrouter.chat(modelId || process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free');
}
