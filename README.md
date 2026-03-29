# PopClip Studio

A web-based visual builder for creating PopClip extensions powered by AI.

## Features

- **AI Provider Selection** - OpenAI, Anthropic, Gemini, OpenRouter, or custom endpoints
- **Prompt Editor** - Write system prompts with quick templates (Summarize, Bullet List, Fix Grammar, etc.)
- **Live Testing** - Test your extension with real AI calls directly in the browser
- **One-Click Export** - Download a ready-to-install `.popclipext` package
- **Light/Dark Theme** - Follows system preference or manual toggle

## Privacy & Security

- API keys are stored only in browser memory and never sent to any server
- All AI requests go directly from your browser to the provider's API over HTTPS
- Exported extensions do not contain your API key

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
