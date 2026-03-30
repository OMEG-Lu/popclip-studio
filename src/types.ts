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
  { label: 'Sparkles', value: 'iconify:lucide:sparkles', lucide: 'sparkles' },
  { label: 'Languages', value: 'iconify:lucide:languages', lucide: 'languages' },
  { label: 'Pen', value: 'iconify:lucide:pen-line', lucide: 'pen-line' },
  { label: 'List', value: 'iconify:lucide:list', lucide: 'list' },
  { label: 'Check', value: 'iconify:lucide:spell-check', lucide: 'spell-check' },
  { label: 'Book', value: 'iconify:lucide:book-open', lucide: 'book-open' },
  { label: 'Briefcase', value: 'iconify:lucide:briefcase', lucide: 'briefcase' },
  { label: 'Scissors', value: 'iconify:lucide:scissors', lucide: 'scissors' },
  { label: 'Code', value: 'iconify:lucide:code', lucide: 'code' },
  { label: 'Message', value: 'iconify:lucide:message-circle', lucide: 'message-circle' },
  { label: 'Zap', value: 'iconify:lucide:zap', lucide: 'zap' },
  { label: 'Table', value: 'iconify:lucide:table', lucide: 'table' },
  { label: 'Search', value: 'iconify:lucide:search', lucide: 'search' },
  { label: 'Lightbulb', value: 'iconify:lucide:lightbulb', lucide: 'lightbulb' },
  { label: 'Wand', value: 'iconify:lucide:wand-2', lucide: 'wand-2' },
  { label: 'Shield', value: 'iconify:lucide:shield', lucide: 'shield' },
]

export const DEFAULT_CONFIG: ExtensionConfig = {
  name: '',
  identifier: '',
  icon: 'iconify:lucide:sparkles',
  provider: 'OpenAI',
  model: '',
  customEndpoint: '',
  systemPrompt: '',
  resultMode: 'replace',
}
