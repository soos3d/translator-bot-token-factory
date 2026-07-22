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

| Model | Tier | Median TTFT | Median total | Avg tokens out/msg | Cost / 1k messages | Verdict |
|---|---|---|---|---|---|---|
| `deepseek-ai/DeepSeek-V4-Pro` | large / flagship | 726 ms | 1700 ms | 59 | $0.43 | **Best quality and fastest — the one I run** |
| `Qwen/Qwen3-32B` | mid | 305 ms | 10406 ms | 402 | $0.13 | **Solid but slow (thinking mode) and stumbles on idioms** |
| `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` | small / cheap | 5504 ms | 5974 ms | 688 | $0.17 | **Cheap on paper, literal in practice** |

**The one I'd actually run: `deepseek-ai/DeepSeek-V4-Pro`** — and not for the reason I expected. The flagship turned out to be the *fastest* option, because it's the only one of the three that doesn't burn hundreds of reasoning tokens before answering — Qwen3-32B and Nemotron think so much that the real cost gap collapses to $0.13–0.17 vs $0.43 per 1,000 messages. It's also the only one translating idiom-for-idiom: "it's not rocket science" became *"não é bicho de sete cabeças"*, while Qwen translated "lol" literally as *"rido"* and Nemotron slipped a Spanish word into a Portuguese line. For a real-time group chat, ~3× the price for ~6× less latency and clearly better slang is an easy call at these absolute numbers.

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
🇮🇹 in bocca al lupo per il colloquio!
🇬🇧 Break a leg for your interview!
🇧🇷 Boa sorte na entrevista!

⏱  first token 945 ms · total 1394 ms · 122 in / 38 out tokens
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

- **The OpenAI compatibility is real.** Streaming, usage reporting via `stream_options`, error shapes — the official Node SDK worked without touching anything except the client constructor.
- **No public models/pricing page.** The model list lives behind the API (`GET /v1/models`) and prices behind the console login, so you can't price out a workload before signing up — and there's no stable URL to cite prices from, which is why [comparison/results.md](comparison/results.md) date-stamps them.
- **The catalog rotates fast.** The model used in the official quickstart (`deepseek-ai/DeepSeek-R1-0528`) was no longer in the catalog when I ran the comparison. `comparison/run.ts` preflights every model ID against `/v1/models` and prints the live catalog if one is missing — expect churn and pin accordingly.
- **Watch out for reasoning tokens.** Several catalog models think before answering; those tokens are invisible in a chat reply but fully billed, and for short translations they can dominate the cost.

## What I'd try next

Token Factory supports [fine-tuning](https://docs.tokenfactory.nebius.com); a small model fine-tuned on my groups' slang would likely beat the mid-tier model at a fraction of the cost. That's the follow-up experiment.

## License

[MIT](LICENSE)
