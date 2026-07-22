# Model comparison — translation workload

Run date: **2026-07-22** · 10 messages × 3 models, sequential, streaming.

Latency and tokens are measured; cost is computed from the prices below;
quality verdicts are human judgment by the author (native Italian, fluent Portuguese).

## Summary

| Model | Tier | Median TTFT | Median total | Avg tokens out/msg | Cost / 1k messages | Verdict |
|---|---|---|---|---|---|---|
| `deepseek-ai/DeepSeek-V4-Pro` | large / flagship | 726 ms | 1700 ms | 59 | $0.43 | **Best quality and fastest — the one I run** |
| `Qwen/Qwen3-32B` | mid | 305 ms | 10406 ms | 402 | $0.13 | **Solid but slow (thinking mode) and stumbles on idioms** |
| `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` | small / cheap | 5504 ms | 5974 ms | 688 | $0.17 | **Cheap on paper, literal in practice** |

Note: Qwen3-32B and Nemotron-3-Nano think before answering — those reasoning tokens are hidden from the chat reply but fully billed, which is why their token counts dwarf DeepSeek-V4-Pro’s.

## Prices used (as of 2026-07-21)

Source: https://openrouter.ai/provider/nebius (Nebius provider listing; verify against the console prices page)

| Model | Input / MTok | Output / MTok |
|---|---|---|
| `deepseek-ai/DeepSeek-V4-Pro` | $1.75 | $3.50 |
| `Qwen/Qwen3-32B` | $0.10 | $0.30 |
| `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` | $0.06 | $0.24 |

## Translations

### 1. `it` — "in bocca al lupo per il colloquio di domani, spacca tutto!"



**`deepseek-ai/DeepSeek-V4-Pro`** (5561 ms, 57 tokens out)

```
🇬🇧 Break a leg for tomorrow’s interview, smash it!
🇮🇹 in bocca al lupo per il colloquio di domani, spacca tutto!
🇧🇷 Boa sorte na entrevista de amanhã, arrasa!
```

Verdict: Perfect — idiom mapped to 'break a leg', and 'arrasa!' is exactly what a Brazilian would say.

**`Qwen/Qwen3-32B`** (13606 ms, 476 tokens out)

```
🇮🇹 in bocca al lupo per il colloquio di domani, spacca tutto!  
🇬🇧 Break a leg for tomorrow's interview, crush it all!  
🇧🇷 Boa sorte na entrevista de amanhã, arrasa tudo!
```

Verdict: Good — 'crush it all' is slightly off, but everything is usable.

**`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`** (18635 ms, 603 tokens out)

```
🇬🇧 Good luck with tomorrow's interview, smash it!  
🇮🇹 in bocca al lupo per il colloquio di domani, spacca tutto!  
🇧🇷 Boa sorte na entrevista de amanhã, arrasa!
```

Verdict: Good — plain 'good luck' loses the idiom, but all three lines read naturally.
### 2. `en` — "ngl this update is a game changer, props to the devs"



**`deepseek-ai/DeepSeek-V4-Pro`** (1821 ms, 67 tokens out)

```
🇬🇧 ngl this update is a game changer, props to the devs
🇮🇹 non scherzo, questo aggiornamento è una svolta, complimenti agli sviluppatori
🇧🇷 na moral, essa atualização mudou o jogo, parabéns aos devs
```

Verdict: Best of the three — 'na moral… mudou o jogo' nails the Brazilian slang register.

**`Qwen/Qwen3-32B`** (8778 ms, 277 tokens out)

```
🇬🇧 ngl this update is a game changer, props to the devs  
🇮🇹 non sto esagerando, questo aggiornamento è un vero salto di qualità, complimenti agli sviluppatori  
🇧🇷 cara essa atualização é uma verdadeira revolução, parabéns pro time de devs
```

Verdict: Good — a touch wordy in Italian, but the register is right.

**`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`** (18523 ms, 586 tokens out)

```
🇬🇧 ngl this update is a game changer, props to the devs
🇮🇹 da dire, questo aggiornamento è un vero cambiamento di gioco, props agli sviluppatori
🇧🇷 debo sinceramente, essa atualização é um divisor de águas, props aos devs
```

Verdict: Fail — 'cambiamento di gioco' is a calque, 'props' left untranslated, and 'debo sinceramente' is Spanish, not Portuguese.
### 3. `pt` — "pois é, deu ruim de novo... fazer o quê né"



**`deepseek-ai/DeepSeek-V4-Pro`** (1700 ms, 59 tokens out)

```
🇧🇷 pois é, deu ruim de novo... fazer o quê né
🇬🇧 well, it went wrong again... what can you do, right?
🇮🇹 già, è andata male di nuovo... che ci vuoi fare, no?
```

Verdict: Excellent — 'che ci vuoi fare, no?' is exactly the Italian shrug of resignation.

**`Qwen/Qwen3-32B`** (12639 ms, 365 tokens out)

```
🇧🇷 pois é, deu ruim de novo... fazer o quê né  
🇬🇧 Well, it's messed up again... what can you do, right?  
🇮🇹 Ecco, è andato male di nuovo... che si può fare, no?
```

Verdict: OK — 'Ecco' misses the resigned tone of 'pois é'; a bit stiff.

**`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`** (11803 ms, 937 tokens out)

```
🇬🇧 Well, it went wrong again... what can we do, huh?
🇮🇹 Be', è andato male di nuovo... cosa facciamo, eh?
🇧🇷 pois é, deu ruim de novo... fazer o quê né
```

Verdict: Meh — 'cosa facciamo, eh?' turns resignation into asking for a plan; meaning shifted.
### 4. `it` — "ma va là, non ci credo manco morto"



**`deepseek-ai/DeepSeek-V4-Pro`** (4863 ms, 49 tokens out)

```
🇮🇹 ma va là, non ci credo manco morto
🇬🇧 no way, I don’t buy it at all
🇧🇷 ah, para, não acredito nem morto
```

Verdict: Excellent — 'I don't buy it at all' and 'não acredito nem morto' both land.

**`Qwen/Qwen3-32B`** (8903 ms, 335 tokens out)

```
🇮🇹 ma va là, non ci credo manco morto
🇬🇧 But come on, I don't even believe it when I'm dead
🇧🇷 Mas vai lá, nem acredito mesmo morto
```

Verdict: Fail — 'I don't even believe it when I'm dead' is word-for-word nonsense, and 'Mas vai lá' is a false friend.

**`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`** (6460 ms, 837 tokens out)

```
🇬🇧 but seriously, I can't even believe it, not even dead.  
🇮🇹 ma va là, non ci credo manco morto  
🇧🇷 mas sério, nem acredito nem morto
```

Verdict: Weak — 'not even dead' is literal English; the Portuguese is passable.
### 5. `en` — "it's not rocket science, just read the docs lol"



**`deepseek-ai/DeepSeek-V4-Pro`** (1423 ms, 60 tokens out)

```
🇬🇧 it's not rocket science, just read the docs lol
🇮🇹 non ci vuole un genio, basta leggere la documentazione ahah
🇧🇷 não é bicho de sete cabeças, é só ler a documentação kkkk
```

Verdict: The showcase — 'não é bicho de sete cabeças' is idiom-for-idiom, and the laughter is localized (ahah / kkkk).

**`Qwen/Qwen3-32B`** (20014 ms, 766 tokens out)

```
🇬🇧 it's not rocket science, just read the docs lol  
🇮🇹 Non è un gran mistero, leggi solo la documentazione, rido  
🇧🇷 Não é complicado, apenas leia a documentação, kkk
```

Verdict: Fail on register — translated 'lol' literally as 'rido' ('I laugh'), which no Italian has ever typed.

**`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`** (3592 ms, 464 tokens out)

```
🇬🇧 it's not rocket science, just read the docs lol
🇮🇹 non è scienza spaziale, basta leggere la documentazione lol
🇧🇷 não é ciência espacial, só ler a documentação lol
```

Verdict: Literal — 'scienza spaziale' / 'ciência espacial' are calques, 'lol' left as-is.
### 6. `pt` — "tô morrendo de rir, esse meme é muito bom kkkk"



**`deepseek-ai/DeepSeek-V4-Pro`** (13411 ms, 62 tokens out)

```
🇧🇷 tô morrendo de rir, esse meme é muito bom kkkk
🇬🇧 I'm dying of laughter, this meme is so good haha
🇮🇹 Sto morendo dal ridere, questo meme è troppo bello ahahah
```

Verdict: Excellent — laughter localized in both targets. Its one slow answer of the run (13.4 s), though.

**`Qwen/Qwen3-32B`** (7593 ms, 268 tokens out)

```
🇧🇷 tô morrendo de rir, esse meme é muito bom kkkk  
🇬🇧 I'm dying of laughter, this meme is super good hahaha  
🇮🇹 Sto morendo dal ridere, questo meme è fantastico hahaha
```

Verdict: Good — kept 'hahaha' instead of the Italian 'ahahah'; cosmetic.

**`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`** (5487 ms, 771 tokens out)

```
🇬🇧 I'm dying laughing, that meme is so good lol
🇮🇹 Sto morendo dal ridere, questo meme è troppo figo kkk
🇧🇷 tô morrendo de rir, esse meme é muito bom kkkk
```

Verdict: OK — leaving 'kkk' in the Italian line is the tell that a machine wrote it.
### 7. `it` — "oggi non me ne va dritta una, giornata da dimenticare"



**`deepseek-ai/DeepSeek-V4-Pro`** (1574 ms, 64 tokens out)

```
🇬🇧 Today, nothing’s going right for me—one of those days to forget.
🇮🇹 oggi non me ne va dritta una, giornata da dimenticare
🇧🇷 Hoje nada está dando certo pra mim, dia daqueles pra esquecer.
```

Verdict: Excellent — both targets sound like a native venting.

**`Qwen/Qwen3-32B`** (7745 ms, 308 tokens out)

```
🇮🇹 oggi non me ne va dritta una, giornata da dimenticare  
🇬🇧 Today, nothing is going right, it's a day to forget  
🇧🇷 Hoje nada está saindo certo, é um dia para esquecer
```

Verdict: Good, slightly flat.

**`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`** (5370 ms, 746 tokens out)

```
🇬🇧 Today everything's going wrong, a day I'd rather forget.
🇮🇹 oggi non me ne va dritta una, giornata da dimenticare
🇧🇷 Hoje nada está indo certo, um dia para esquecer.
```

Verdict: Good — 'a day I'd rather forget' is a nice touch.
### 8. `en` — "heads up: server maintenance tonight, back up your stuff"



**`deepseek-ai/DeepSeek-V4-Pro`** (1498 ms, 66 tokens out)

```
🇬🇧 heads up: server maintenance tonight, back up your stuff
🇮🇹 avviso: manutenzione del server stasera, fate un backup dei vostri dati
🇧🇷 aviso: manutenção do servidor hoje à noite, façam backup dos seus dados
```

Verdict: Good — plural 'fate' / 'façam' fits a group announcement.

**`Qwen/Qwen3-32B`** (11909 ms, 464 tokens out)

```
🇬🇧 heads up: server maintenance tonight, back up your stuff  
🇮🇹 Attenzione: manutenzione del server questa sera, fai un backup delle tue cose  
🇧🇷 Aviso: manutenção no servidor hoje à noite, faça backup dos seus dados
```

Verdict: Good — singular 'fai' / 'faça' reads like a DM in a group chat; minor.

**`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`** (2832 ms, 385 tokens out)

```
🇬🇧 heads up: server maintenance tonight, back up your stuff
🇮🇹 avviso: manutenzione del server stasera, fai un backup dei tuoi file
🇧🇷 aviso: manutenção do servidor esta noite, faça backup dos seus arquivos
```

Verdict: Good.
### 9. `pt` — "bora marcar aquele churrasco no fim de semana?"



**`deepseek-ai/DeepSeek-V4-Pro`** (1363 ms, 53 tokens out)

```
🇬🇧 how about we plan that barbecue on the weekend?
🇮🇹 che ne dici di organizzare quella grigliata nel fine settimana?
🇧🇷 bora marcar aquele churrasco no fim de semana?
```

Verdict: Excellent — 'grigliata' is the right cultural translation of churrasco for Italians.

**`Qwen/Qwen3-32B`** (12537 ms, 466 tokens out)

```
🇧🇷 bora marcar aquele churrasco no fim de semana?  
🇬🇧 Let's set that barbecue for the weekend?  
🇮🇹 Andiamo a fissare quel barbecue per il weekend?
```

Verdict: Awkward — 'Let's set that barbecue for the weekend?' and 'Andiamo a fissare quel barbecue' are calques.

**`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`** (6614 ms, 1107 tokens out)

```
🇬🇧 Wanna set up that barbecue this weekend?
🇮🇹 Facciamo quel barbecue questo weekend?
🇧🇷 bora marcar aquele churrasco no fim de semana?
```

Verdict: OK — natural Italian, though the nuance of finally pinning down 'aquele churrasco' fades.
### 10. `en` — "that plot twist came out of nowhere, I'm shook"



**`deepseek-ai/DeepSeek-V4-Pro`** (1700 ms, 56 tokens out)

```
🇬🇧 that plot twist came out of nowhere, I'm shook
🇮🇹 quel colpo di scena è arrivato dal nulla, sono scioccato
🇧🇷 essa reviravolta veio do nada, tô chocado
```

Verdict: Very good — 'tô chocado' keeps the informal register.

**`Qwen/Qwen3-32B`** (7835 ms, 291 tokens out)

```
🇬🇧 that plot twist came out of nowhere, I'm shook  
🇮🇹 quel colpo di scena è sbucato dal nulla, sono sconvolto  
🇧🇷 essa reviravolta veio do nada, estou abalado
```

Verdict: Very good Italian ('sbucato dal nulla'); 'estou abalado' is a notch too formal.

**`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`** (2902 ms, 440 tokens out)

```
🇬🇧 that plot twist came out of nowhere, I'm shook  
🇮🇹 Quel colpo di scena è venuto fuori dal nulla, sono sconcertato.  
🇧🇷 Esse plot twist veio do nada, estou chocado.
```

Verdict: OK — 'sono sconcertato' is too formal for a group chat.
