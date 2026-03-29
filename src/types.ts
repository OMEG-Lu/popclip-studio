export type Provider = 'OpenAI' | 'Anthropic' | 'Gemini' | 'OpenRouter' | 'Custom'

export type ResultMode = 'replace' | 'preview' | 'both'

export interface ExtensionConfig {
  name: string
  identifier: string
  icon: string
  provider: Provider
  model: string
  customEndpoint: string
  systemPrompt: string
  resultMode: ResultMode
}

export const DEFAULT_MODELS: Record<Provider, string> = {
  OpenAI: 'gpt-4o-mini',
  Anthropic: 'claude-sonnet-4-20250514',
  Gemini: 'gemini-2.0-flash',
  OpenRouter: 'openai/gpt-4o-mini',
  Custom: 'llama3',
}

export const PROVIDER_COLORS: Record<Provider, string> = {
  OpenAI: '#10a37f',
  Anthropic: '#d4a27f',
  Gemini: '#4285f4',
  OpenRouter: '#c084fc',
  Custom: '#8888a0',
}

export const ICON_PRESETS = [
  { label: 'List', value: 'symbol:list.bullet', lucide: 'list' },
  { label: 'Pen', value: 'symbol:pencil', lucide: 'pen-tool' },
  { label: 'Sparkle', value: 'symbol:sparkles', lucide: 'sparkles' },
  { label: 'Globe', value: 'symbol:globe', lucide: 'globe' },
  { label: 'Chat', value: 'symbol:bubble.left', lucide: 'message-circle' },
  { label: 'Code', value: 'symbol:chevron.left.forwardslash.chevron.right', lucide: 'code' },
  { label: 'Wand', value: 'symbol:wand.and.stars', lucide: 'wand-2' },
  { label: 'Book', value: 'symbol:book', lucide: 'book-open' },
  { label: 'Bolt', value: 'symbol:bolt.fill', lucide: 'zap' },
  { label: 'Check', value: 'symbol:checkmark.circle', lucide: 'check-circle' },
  { label: 'Arrow', value: 'symbol:arrow.right.circle', lucide: 'arrow-right-circle' },
  { label: 'Table', value: 'symbol:tablecells', lucide: 'table' },
]

export const DEFAULT_CONFIG: ExtensionConfig = {
  name: '',
  identifier: '',
  icon: 'symbol:wand.and.stars',
  provider: 'OpenAI',
  model: '',
  customEndpoint: '',
  systemPrompt: '',
  resultMode: 'replace',
}
