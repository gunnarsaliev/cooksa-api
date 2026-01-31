import { NextRequest, NextResponse } from 'next/server'
import { verifyQStashSignature } from '@/lib/qstash'
import { translateIngredient } from '@/services/translateIngredient'
import { translateRecipe } from '@/services/translateRecipe'
import { getPayload } from 'payload'
import config from '@/payload.config'

interface TranslationMessage {
  ingredientId?: number | string
  recipeId?: number | string
  type?: 'ingredient' | 'recipe'
}

async function handler(request: NextRequest) {
  console.log('📦 Received translation processing request')

  try {
    // Parse the request body
    const body: TranslationMessage = await request.json()
    const { ingredientId, recipeId, type } = body

    // Determine the type of translation based on the message
    const translationType = type || (ingredientId ? 'ingredient' : 'recipe')
    const entityId = ingredientId || recipeId

    if (!entityId) {
      console.error('❌ No entity ID found in message:', body)
      return NextResponse.json({ error: 'Missing entity ID' }, { status: 400 })
    }

    console.log(`🔄 Processing ${translationType} translation for ID: ${entityId}`)

    // Get Payload instance
    const payload = await getPayload({ config })

    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured in environment')
    }

    // Perform the translation based on type
    if (translationType === 'ingredient') {
      await translateIngredient(entityId, payload, openaiApiKey)
      console.log(`✅ Successfully processed translation for ingredient ID: ${entityId}`)
    } else if (translationType === 'recipe') {
      await translateRecipe(entityId, payload, openaiApiKey)
      console.log(`✅ Successfully processed translation for recipe ID: ${entityId}`)
    } else {
      throw new Error(`Unknown translation type: ${translationType}`)
    }

    return NextResponse.json({
      success: true,
      message: `${translationType} translation processed successfully`,
      entityId,
      type: translationType,
    })
  } catch (error) {
    console.error('❌ Error processing translation:', error)

    // Return error response - QStash will retry based on its retry policy
    return NextResponse.json(
      {
        error: 'Failed to process translation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// Wrap the handler with QStash signature verification
export async function POST(request: NextRequest) {
  // Verify the QStash signature first
  const isValid = await verifyQStashSignature(request)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Use the original request since we need to read the body in the handler
  return handler(request)
}

export async function GET() {
  return NextResponse.json({ message: 'Translation processing endpoint' })
}
