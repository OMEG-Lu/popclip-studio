import type { Provider } from './types'

export interface ModelInfo {
  id: string
  name: string
}

export async function fetchModels(provider: Provider, apiKey: string): Promise<ModelInfo[]> {
  switch (provider) {
    case 'OpenAI':
      return fetchOpenAIModels(apiKey)
    case 'Anthropic':
      return getAnthropicModels()
    case 'Gemini':
      return fetchGeminiModels(apiKey)
    case 'OpenRouter':
      return fetchOpenRouterModels()
    case 'Custom':
      return []
  }
}

async function fetchOpenAIModels(apiKey: string): Promise<ModelInfo[]> {
  if (!apiKey) return []
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return []
  const data = await res.json()
  const chatModels = (data.data as { id: string }[])
    .map(m => m.id)
    .filter(id =>
      id.includes('gpt') || id.includes('o1') || id.includes('o3') || id.includes('o4')
    )
    .filter(id => !id.includes('instruct') && !id.includes('realtime') && !id.includes('audio'))
    .sort()
  return chatModels.map(id => ({ id, name: id }))
}

// Anthropic doesn't have a public model listing API, so we hardcode common ones
function getAnthropicModels(): Promise<ModelInfo[]> {
  const models = [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
  ]
  return Promise.resolve(models)
}

async function fetchGeminiModels(apiKey: string): Promise<ModelInfo[]> {
  if (!apiKey) return []
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  )
  if (!res.ok) return []
  const data = await res.json()
  const models = (data.models as { name: string; displayName: string; supportedGenerationMethods: string[] }[])
    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
    .map(m => ({
      id: m.name.replace('models/', ''),
      name: m.displayName,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return models
}

async function fetchOpenRouterModels(): Promise<ModelInfo[]> {
  const res = await fetch('https://openrouter.ai/api/v1/models')
  if (!res.ok) return []
  const data = await res.json()
  const models = (data.data as { id: string; name: string }[])
    .slice(0, 100) // Limit to top 100
    .map(m => ({ id: m.id, name: m.name }))
  return models
}
