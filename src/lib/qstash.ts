import { Client } from '@upstash/qstash'
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
export const QSTASH_ENDPOINTS = {
  NUTRITION: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/qstash/nutrition`,
  TRANSLATION: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/qstash/translation`,
} as const

// Verify QStash signature for Next.js App Router
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

    // Get the body as text for signature verification
    const body = await request.text()

    // Reconstruct the request body for the handler
    ;(request as any)._body = body

    const isValid = await verifySignature({
      signature,
      body,
      currentSigningKey,
      nextSigningKey,
    })

    return isValid
  } catch (error) {
    console.error('❌ Error verifying QStash signature:', error)
    return false
  }
}

// Import the verifySignature function from QStash
async function verifySignature({
  signature,
  body,
  currentSigningKey,
  nextSigningKey,
}: {
  signature: string
  body: string
  currentSigningKey: string
  nextSigningKey: string
}): Promise<boolean> {
  const encoder = new TextEncoder()

  const verify = async (key: string) => {
    const keyData = encoder.encode(key)
    const [signatureVersion, signatureValue] = signature.split(',')

    if (!signatureValue) {
      return false
    }

    const signatureData = encoder.encode(signatureValue)
    const bodyData = encoder.encode(body)

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )

    return await crypto.subtle.verify('HMAC', cryptoKey, signatureData, bodyData)
  }

  try {
    return await verify(currentSigningKey)
  } catch {
    return await verify(nextSigningKey)
  }
}
