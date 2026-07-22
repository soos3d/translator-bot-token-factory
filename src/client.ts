import OpenAI from 'openai'

// This file IS the migration. The bot previously did:
//
//   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
//
// Token Factory speaks the same API, so switching is a baseURL + key swap:

const apiKey = process.env.NEBIUS_API_KEY

if (!apiKey) {
  console.error(
    '✖ NEBIUS_API_KEY is not set.\n' +
      '  Copy .env.example to .env and paste your key from https://tokenfactory.nebius.com'
  )
  process.exit(1)
}

export const client = new OpenAI({
  baseURL: 'https://api.tokenfactory.nebius.com/v1/',
  apiKey
})
