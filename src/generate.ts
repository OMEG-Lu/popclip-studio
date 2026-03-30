import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { ExtensionConfig } from './types'
import { DEFAULT_MODELS } from './types'

function generateConfigYaml(config: ExtensionConfig): string {
  const lines = [
    `name: ${config.name}`,
    `icon: ${config.icon}`,
    `identifier: ${config.identifier}`,
    `popclipVersion: 4615`,
    `options:`,
    `  - identifier: apikey`,
    `    label: API Key`,
    `    type: secret`,
    `    description: "API key for ${config.provider}${config.provider === 'Custom' ? ' (leave blank for local models)' : ''}"`,
  ]

  // Custom provider needs endpoint option
  if (config.provider === 'Custom') {
    lines.push(
      `  - identifier: customendpoint`,
      `    label: API Endpoint`,
      `    type: string`,
      `    description: "OpenAI-compatible endpoint"`,
      config.customEndpoint
        ? `    default value: "${config.customEndpoint}"`
        : `    description: "e.g. http://localhost:11434/v1/chat/completions"`,
    )
  }

  lines.push(`actions:`)

  const title = config.name
  const icon = config.icon

  if (config.resultMode === 'replace' || config.resultMode === 'both') {
    lines.push(
      `  - title: ${title}`,
      `    icon: ${icon}`,
      `    requirements: [text]`,
      `    shell script file: script.sh`,
      `    interpreter: /bin/bash`,
      `    after: paste-result`,
    )
  }

  if (config.resultMode === 'preview' || config.resultMode === 'both') {
    lines.push(
      `  - title: ${config.resultMode === 'both' ? title + ' (Preview)' : title}`,
      `    icon: ${config.resultMode === 'both' ? 'iconify:lucide:eye' : icon}`,
      `    requirements: [text]`,
      `    shell script file: preview.sh`,
      `    interpreter: /bin/bash`,
    )
  }

  return lines.join('\n') + '\n'
}

function generateScript(config: ExtensionConfig): string {
  const escapedPrompt = config.systemPrompt.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
  const model = config.model || DEFAULT_MODELS[config.provider]

  return `#!/bin/bash
python3 <<'PYEOF'
import json, urllib.request, os, sys

text = os.environ.get("POPCLIP_TEXT", "")
api_key = os.environ.get("POPCLIP_OPTION_APIKEY", "")
provider = "${config.provider}"
model = "${model}"
custom_endpoint = os.environ.get("POPCLIP_OPTION_CUSTOMENDPOINT", "${config.customEndpoint}").strip()

if not api_key and provider not in ("Custom",):
    sys.exit(1)

system_prompt = (
    "${escapedPrompt}"
)

def call_openai_compatible(url, headers, model, system_prompt, text):
    payload = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text}
        ],
        "temperature": 0.3
    })
    req = urllib.request.Request(url, data=payload.encode("utf-8"), headers=headers)
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
    return result["choices"][0]["message"]["content"].strip()

def call_anthropic(api_key, model, system_prompt, text):
    payload = json.dumps({
        "model": model,
        "max_tokens": 4096,
        "system": system_prompt,
        "messages": [
            {"role": "user", "content": text}
        ],
        "temperature": 0.3
    })
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload.encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01"
        }
    )
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
    return result["content"][0]["text"].strip()

def call_gemini(api_key, model, system_prompt, text):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = json.dumps({
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {"temperature": 0.3}
    })
    req = urllib.request.Request(
        url,
        data=payload.encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
    return result["candidates"][0]["content"]["parts"][0]["text"].strip()

try:
    if provider == "OpenAI":
        output = call_openai_compatible(
            "https://api.openai.com/v1/chat/completions",
            {"Content-Type": "application/json", "Authorization": "Bearer " + api_key},
            model, system_prompt, text
        )
    elif provider == "Anthropic":
        output = call_anthropic(api_key, model, system_prompt, text)
    elif provider == "Gemini":
        output = call_gemini(api_key, model, system_prompt, text)
    elif provider == "OpenRouter":
        output = call_openai_compatible(
            "https://openrouter.ai/api/v1/chat/completions",
            {"Content-Type": "application/json", "Authorization": "Bearer " + api_key},
            model, system_prompt, text
        )
    elif provider == "Custom":
        if not custom_endpoint:
            sys.exit(1)
        headers = {"Content-Type": "application/json"}
        if api_key:
            headers["Authorization"] = "Bearer " + api_key
        output = call_openai_compatible(
            custom_endpoint, headers, model, system_prompt, text
        )
    else:
        sys.exit(1)

    print(output, end="")
except Exception:
    sys.exit(1)
PYEOF
`
}

function generatePreviewScript(config: ExtensionConfig): string {
  return generateScript(config)
}

export async function exportExtension(config: ExtensionConfig) {
  const zip = new JSZip()
  const folderName = `${config.name}.popclipext`
  const folder = zip.folder(folderName)!

  folder.file('Config.yaml', generateConfigYaml(config))

  const script = generateScript(config)
  folder.file('script.sh', script, { unixPermissions: '755' })
  folder.file('preview.sh', generatePreviewScript(config), { unixPermissions: '755' })

  const blob = await zip.generateAsync({
    type: 'blob',
    platform: 'UNIX',
  })
  saveAs(blob, `${config.name}.popclipext.zip`)
}

export { generateConfigYaml, generateScript }
