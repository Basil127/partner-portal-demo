import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { config } from '../../config/config.js';

// OpenRouter provider — use .chat() for Chat Completions API
const openrouter = createOpenRouter({
	apiKey: config.ai.openrouterApiKey
});

export function getModel(modelId?: string) {
	return openrouter.chat(modelId || config.ai.openrouterModel || 'openai/gpt-oss-120b:free');
}
