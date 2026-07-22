import 'dotenv/config'
import { DEFAULT_MODEL, stripThinking, translate } from '../src/translate.js'

// Usage (single quotes — zsh treats ! specially inside double quotes):
//   npm run translate -- 'che figata questo bot!'
//   npm run translate -- --model meta-llama/Llama-3.3-70B-Instruct 'no way, really?'

function parseArgs(argv: string[]): { model: string; message: string } {
  const modelFlag = argv.indexOf('--model')
  if (modelFlag === -1) {
    return { model: DEFAULT_MODEL, message: argv.join(' ') }
  }
  const model = argv[modelFlag + 1] ?? DEFAULT_MODEL
  const rest = [...argv.slice(0, modelFlag), ...argv.slice(modelFlag + 2)]
  return { model, message: rest.join(' ') }
}

const { model, message } = parseArgs(process.argv.slice(2))
const input = message || 'in bocca al lupo per il colloquio!'

console.log(`\n💬 ${input}`)
console.log(`🤖 ${model}\n`)

try {
  const result = await translate(input, {
    model,
    onToken: (token) => process.stdout.write(token)
  })

  const clean = stripThinking(result.text)
  if (clean !== result.text) {
    console.log('\n\n--- without reasoning tokens ---\n' + clean)
  }

  console.log(
    `\n\n⏱  first token ${result.timeToFirstTokenMs} ms · total ${result.totalMs} ms · ` +
      `${result.promptTokens} in / ${result.completionTokens} out tokens`
  )
} catch (error) {
  console.error('\nTranslation failed:', error instanceof Error ? error.message : error)
  process.exit(1)
}
