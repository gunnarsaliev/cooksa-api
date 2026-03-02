import { Client, Receiver } from '@upstash/qstash'
import { NextRequest } from 'next/server'

let qstashClient: Client | null = null

export function getQstashClient(): Client {
  if (!qstashClient) {
    const token = process.env.QSTASH_TOKEN
    if (!token) {
      throw new Error('QSTASH_TOKEN environment variable is not set')
    }
    qstashClient = new Client({
      token,
    })
  }
  return qstashClient
}

// QStash topic names for different job types
export const QSTASH_TOPICS = {
  NUTRITION: 'nutrition-processing',
  TRANSLATION: 'translation-processing',
} as const

// API endpoints for QStash webhooks
// Strip any trailing slash from the base URL to avoid double-slash paths
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
export const QSTASH_ENDPOINTS = {
  NUTRITION: `${appUrl}/api/qstash/nutrition`,
  TRANSLATION: `${appUrl}/api/qstash/translation`,
} as const

// Verify QStash signature for Next.js App Router using the official Receiver
export async function verifyQStashSignature(request: NextRequest): Promise<boolean> {
  try {
    const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY
    const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY

    if (!currentSigningKey || !nextSigningKey) {
      console.error('❌ QStash signing keys not configured')
      return false
    }

    const signature = request.headers.get('upstash-signature')
    if (!signature) {
      console.error('❌ No Upstash signature found in headers')
      return false
    }

    // Read body as text, cache it on the request for re-use in the handler
    const body = await request.text()
    ;(request as any)._body = body

    const receiver = new Receiver({
      currentSigningKey,
      nextSigningKey,
    })

    await receiver.verify({
      signature,
      body,
      url: request.url,
    })

    return true
  } catch (error) {
    console.error('❌ QStash signature verification failed:', error)
    return false
  }
}
