import { client } from './client.js'

// The bot's core call: detect the language of a group message and reply with
// translations into the other two group languages, in a fixed Telegram-ready
// format. Streaming, with timing + token usage captured for the comparison.

export const DEFAULT_MODEL = 'Qwen/Qwen3-32B'

const SYSTEM_PROMPT = `You are the translation engine of a Telegram group chat where people write in English, Italian and Portuguese.

For every message:
1. Detect the source language.
2. Translate it into the other two languages.
3. Translate meaning, not words — keep slang, idioms and tone natural.

Reply in exactly this format, nothing else:

🇬🇧 <text in English>
🇮🇹 <text in Italian>
🇧🇷 <text in Portuguese>

For the line matching the source language, repeat the original message unchanged.`

export interface TranslationResult {
  text: string
  model: string
  timeToFirstTokenMs: number
  totalMs: number
  promptTokens: number
  completionTokens: number
}

export interface TranslateOptions {
  model?: string
  onToken?: (token: string) => void
}

export async function translate(
  message: string,
  options: TranslateOptions = {}
): Promise<TranslationResult> {
  const model = options.model ?? DEFAULT_MODEL
  const startedAt = performance.now()

  const stream = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: message }
    ],
    stream: true,
    stream_options: { include_usage: true }
  })

  let text = ''
  let firstTokenAt: number | null = null
  let promptTokens = 0
  let completionTokens = 0

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? ''
    if (token) {
      firstTokenAt ??= performance.now()
      text += token
      options.onToken?.(token)
    }
    // Usage arrives on the final chunk when stream_options.include_usage is set
    if (chunk.usage) {
      promptTokens = chunk.usage.prompt_tokens
      completionTokens = chunk.usage.completion_tokens
    }
  }

  const finishedAt = performance.now()

  return {
    text: text.trim(),
    model,
    timeToFirstTokenMs: Math.round((firstTokenAt ?? finishedAt) - startedAt),
    totalMs: Math.round(finishedAt - startedAt),
    promptTokens,
    completionTokens
  }
}

// Reasoning models (e.g. DeepSeek-R1) prepend their chain of thought in a
// <think> block. Strip it for display — but note the tokens are still billed.
export function stripThinking(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
}
