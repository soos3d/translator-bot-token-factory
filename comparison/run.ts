import 'dotenv/config'
import { readFile, writeFile } from 'node:fs/promises'
import { setTimeout as sleep } from 'node:timers/promises'
import { client } from '../src/client.js'
import { stripThinking, translate, type TranslationResult } from '../src/translate.js'

// 3 models × 10 messages → comparison/results.md
// Deliberately small and sequential: this is a feel-check, not a benchmark.

// Prices are hand-copied and WILL drift. Re-check before trusting the cost column.
const PRICES_DATE = '2026-07-21'
const PRICES_SOURCE = 'https://tokenfactory.nebius.com/organization/prices'

interface ModelConfig {
  id: string
  tier: string
  inputPerMTok: number
  outputPerMTok: number
}

const MODELS: ModelConfig[] = [
  {
    id: 'deepseek-ai/DeepSeek-R1-0528',
    tier: 'large / reasoning',
    inputPerMTok: 0.8, // TODO: confirm on prices page
    outputPerMTok: 2.4 // TODO: confirm on prices page
  },
  {
    id: 'Qwen/Qwen3-32B',
    tier: 'mid',
    inputPerMTok: 0.1,
    outputPerMTok: 0.3
  },
  {
    id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    tier: 'small',
    inputPerMTok: 0.03, // TODO: confirm on prices page
    outputPerMTok: 0.09 // TODO: confirm on prices page
  }
]

interface Message {
  id: number
  lang: string
  text: string
}

interface RunResult {
  message: Message
  result: TranslationResult
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function costPer1kMessages(runs: RunResult[], model: ModelConfig): number {
  const totalCost = runs.reduce(
    (sum, { result }) =>
      sum +
      (result.promptTokens * model.inputPerMTok + result.completionTokens * model.outputPerMTok) /
        1_000_000,
    0
  )
  return (totalCost / runs.length) * 1000
}

async function checkModelsAvailable(): Promise<void> {
  const available = new Set<string>()
  for await (const model of client.models.list()) {
    available.add(model.id)
  }
  const missing = MODELS.filter((m) => !available.has(m.id))
  if (missing.length > 0) {
    const catalog = [...available].sort().join('\n  ')
    throw new Error(
      `Not in the current catalog: ${missing.map((m) => m.id).join(', ')}\n` +
        `Pick a replacement from:\n  ${catalog}`
    )
  }
}

function buildResultsMarkdown(allRuns: Map<string, RunResult[]>, messages: Message[]): string {
  const summaryRows = MODELS.map((model) => {
    const runs = allRuns.get(model.id) ?? []
    if (runs.length === 0) {
      return `| \`${model.id}\` | ${model.tier} | — | — | — | — | _all runs failed_ |`
    }
    const latencies = runs.map((r) => r.result.totalMs)
    const ttfts = runs.map((r) => r.result.timeToFirstTokenMs)
    const avgOut = Math.round(
      runs.reduce((sum, r) => sum + r.result.completionTokens, 0) / runs.length
    )
    const cost = costPer1kMessages(runs, model)
    return (
      `| \`${model.id}\` | ${model.tier} | ${Math.round(median(ttfts))} ms | ` +
      `${Math.round(median(latencies))} ms | ${avgOut} | $${cost.toFixed(2)} | _pending_ |`
    )
  })

  const priceRows = MODELS.map(
    (m) => `| \`${m.id}\` | $${m.inputPerMTok.toFixed(2)} | $${m.outputPerMTok.toFixed(2)} |`
  )

  const perMessage = messages.map((message) => {
    const translations = MODELS.map((model) => {
      const run = allRuns.get(model.id)?.find((r) => r.message.id === message.id)
      if (!run) return `**${model.id}** — _failed_`
      const clean = stripThinking(run.result.text)
      return [
        `**\`${model.id}\`** (${run.result.totalMs} ms, ${run.result.completionTokens} tokens out)`,
        '',
        '```',
        clean,
        '```',
        '',
        'Verdict: _pending author review_'
      ].join('\n')
    })
    return [`### ${message.id}. \`${message.lang}\` — "${message.text}"`, '', ...translations].join(
      '\n\n'
    )
  })

  return [
    '# Model comparison — translation workload',
    '',
    `Run date: **${new Date().toISOString().slice(0, 10)}** · ${messages.length} messages × ${MODELS.length} models, sequential, streaming.`,
    '',
    'Latency and tokens are measured; cost is computed from the prices below;',
    'quality verdicts are human judgment by the author (native Italian, fluent Portuguese).',
    '',
    '## Summary',
    '',
    '| Model | Tier | Median TTFT | Median total | Avg tokens out/msg | Cost / 1k messages | Verdict |',
    '|---|---|---|---|---|---|---|',
    ...summaryRows,
    '',
    'Note: DeepSeek-R1 output includes reasoning tokens — hidden from the chat reply but fully billed.',
    '',
    `## Prices used (as of ${PRICES_DATE})`,
    '',
    `Source: ${PRICES_SOURCE}`,
    '',
    '| Model | Input / MTok | Output / MTok |',
    '|---|---|---|',
    ...priceRows,
    '',
    '## Translations',
    '',
    ...perMessage,
    ''
  ].join('\n')
}

async function main(): Promise<void> {
  const messages: Message[] = JSON.parse(
    await readFile(new URL('./messages.json', import.meta.url), 'utf8')
  )

  await checkModelsAvailable()

  const allRuns = new Map<string, RunResult[]>()

  for (const model of MODELS) {
    console.log(`\n▶ ${model.id}`)
    const runs: RunResult[] = []
    for (const message of messages) {
      try {
        const result = await translate(message.text, { model: model.id })
        runs.push({ message, result })
        console.log(`  ${message.id}. ${result.totalMs} ms · ${result.completionTokens} tokens out`)
      } catch (error) {
        console.error(`  ${message.id}. failed:`, error instanceof Error ? error.message : error)
      }
      await sleep(300) // stay polite, no rate-limit games
    }
    allRuns.set(model.id, runs)
  }

  const markdown = buildResultsMarkdown(allRuns, messages)
  const outPath = new URL('./results.md', import.meta.url)
  await writeFile(outPath, markdown)
  console.log('\n✅ wrote comparison/results.md — now add the human verdicts')
}

try {
  await main()
} catch (error) {
  console.error('Comparison run failed:', error instanceof Error ? error.message : error)
  process.exit(1)
}
