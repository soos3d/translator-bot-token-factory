# I moved my production Telegram bot to Nebius Token Factory in an evening

I run a [translation bot](https://github.com/soos3d/ai-tg-translator-bot) in live multilingual Telegram groups (English / Italian / Portuguese). It detects the language of every message and replies with translations into the other two.

[Token Factory](https://tokenfactory.nebius.com) is OpenAI-compatible, so the migration was one config change. This repo shows the actual diff, a small model comparison on my real workload, and honest notes on what the experience was like.

## The diff

```diff
 const client = new OpenAI({
-  apiKey: process.env.OPENAI_API_KEY
+  baseURL: 'https://api.tokenfactory.nebius.com/v1/',
+  apiKey: process.env.NEBIUS_API_KEY
 })
```

That's the whole migration. The bot's handlers, prompts, streaming, and token accounting didn't change — the official OpenAI Node SDK works as-is, including `stream: true` and usage reporting via `stream_options`.

## Which model?

I ran the bot's core translate call over 10 real-shaped group messages (slang and idioms included — that's where translation models actually differ) across three price tiers. Full output with per-message verdicts: [comparison/results.md](comparison/results.md).

<!-- TODO: paste summary table from comparison/results.md after the committed run -->

| Model | Tier | Median latency | Cost / 1k messages | Verdict |
|---|---|---|---|---|
| `deepseek-ai/DeepSeek-R1-0528` | large / reasoning | _pending run_ | _pending run_ | _pending_ |
| `Qwen/Qwen3-32B` | mid | _pending run_ | _pending run_ | _pending_ |
| `meta-llama/Meta-Llama-3.1-8B-Instruct` | small | _pending run_ | _pending run_ | _pending_ |

<!-- TODO: "which one I'd actually run" paragraph after reviewing translations -->

Latency and tokens are measured; quality verdicts are my own judgment (native Italian speaker, fluent in Portuguese) — a human eval, stated as such.

## Try it yourself (~2 minutes)

You need Node 20+ and a Token Factory API key ([sign up](https://tokenfactory.nebius.com), create a key).

```bash
git clone https://github.com/soos3d/translator-bot-token-factory
cd translator-bot-token-factory
npm install
cp .env.example .env   # paste your NEBIUS_API_KEY
npm run translate -- 'in bocca al lupo per il colloquio!'
```

You'll see the translation stream in, followed by timing and token usage:

```
🇬🇧 good luck with the interview!
🇮🇹 in bocca al lupo per il colloquio!
🇧🇷 boa sorte na entrevista!

⏱  first token 837 ms · total 4034 ms · 128 in / 358 out tokens
```

Try a different model with `npm run translate -- --model meta-llama/Llama-3.3-70B-Instruct "no way, really?"`.

To reproduce the comparison: `npm run compare` (runs 3 models × 10 messages sequentially, rewrites `comparison/results.md`).

## Where the code lives

All Token Factory–related code is in `src/` — two small files:

```
src/
├── client.ts      # the migration: OpenAI SDK pointed at Token Factory (~15 lines)
└── translate.ts   # the bot's core call: detect → translate → format, streaming (~100 lines)
examples/
└── translate.ts   # CLI wrapper around src/translate.ts — what you just ran
comparison/
├── messages.json  # 10 sanitized messages resembling the real workload
├── run.ts         # 3 models × 10 messages → results.md
└── results.md     # committed run, dated, prices included
```

`examples/translate.ts` and `comparison/run.ts` call the exact same `translate()` function — the comparison measures the code path the bot actually runs.

## Notes from the migration

Everything I noticed — signup friction, docs gaps, pleasant surprises — is in [NOTES.md](NOTES.md).

## What I'd try next

Token Factory supports [fine-tuning](https://docs.tokenfactory.nebius.com); a small model fine-tuned on my groups' slang would likely beat the mid-tier model at a fraction of the cost. That's the follow-up experiment.

## License

[MIT](LICENSE)
