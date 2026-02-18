import { createOpenAI } from '@ai-sdk/openai';
import { config } from '../../config/config.js';

// OpenRouter provider — use .chat() for Chat Completions API
const openrouter = createOpenAI({
	baseURL: 'https://openrouter.ai/api/v1',
	apiKey: config.ai.openrouterApiKey,
	name: 'openrouter',
});

export function getModel(modelId?: string) {
	return openrouter.chat(modelId || config.ai.openrouterModel || 'openai/gpt-oss-120b:free');
}
