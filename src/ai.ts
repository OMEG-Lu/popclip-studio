import type { Provider } from './types'

interface CallParams {
  provider: Provider
  apiKey: string
  model: string
  customEndpoint: string
  systemPrompt: string
  userText: string
}

export async function callAI(params: CallParams): Promise<string> {
  const { provider, apiKey, model, customEndpoint, systemPrompt, userText } = params

  switch (provider) {
    case 'OpenAI':
      return callOpenAICompatible(
        'https://api.openai.com/v1/chat/completions',
        { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        model || 'gpt-4o-mini',
        systemPrompt,
        userText
      )
    case 'Anthropic':
      return callAnthropic(apiKey, model || 'claude-sonnet-4-20250514', systemPrompt, userText)
    case 'Gemini':
      return callGemini(apiKey, model || 'gemini-2.0-flash', systemPrompt, userText)
    case 'OpenRouter':
      return callOpenAICompatible(
        'https://openrouter.ai/api/v1/chat/completions',
        { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        model || 'openai/gpt-4o-mini',
        systemPrompt,
        userText
      )
    case 'Custom': {
      if (!customEndpoint) throw new Error('Custom endpoint is required')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`
      return callOpenAICompatible(customEndpoint, headers, model || 'llama3', systemPrompt, userText)
    }
  }
}

async function callOpenAICompatible(
  url: string,
  headers: Record<string, string>,
  model: string,
  systemPrompt: string,
  text: string
): Promise<string> {
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.choices[0].message.content.trim()
}

async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  text: string
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }],
      temperature: 0.3,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.content[0].text.trim()
}

async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  text: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text }] }],
      generationConfig: { temperature: 0.3 },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.candidates[0].content.parts[0].text.trim()
}
