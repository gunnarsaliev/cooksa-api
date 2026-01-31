import { NextRequest, NextResponse } from 'next/server'
import { verifyQStashSignature } from '@/lib/qstash'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getUSDANutritionalData } from '@/services/usda'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { nutritionalDataSchema, type NutritionalData } from '@/schemas/nutrition'
import type { IngredientNutrition } from '@/payload-types'

interface NutritionMessage {
  ingredientId: number | string
}

async function handler(request: NextRequest) {
  console.log('📦 Received nutrition processing request')

  try {
    // Parse the request body
    const body: NutritionMessage = await request.json()
    const { ingredientId } = body

    if (!ingredientId) {
      console.error('❌ No ingredient ID found in message:', body)
      return NextResponse.json({ error: 'Missing ingredient ID' }, { status: 400 })
    }

    console.log(`🔄 Processing nutrition data for ingredient ID: ${ingredientId}`)

    // Get Payload instance
    const payload = await getPayload({ config })

    // Check for existing nutritional data
    const existing = await payload.find({
      collection: 'ingredient-nutritions',
      where: { ingredient: { equals: ingredientId } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`⚠️  Nutritional data already exists for ingredient ID: ${ingredientId}`)
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    // Get ingredient data
    const ingredient = await payload.findByID({
      collection: 'ingredients',
      id: ingredientId as number,
    })

    if (!ingredient) {
      console.error(`❌ Ingredient not found with ID: ${ingredientId}`)
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 })
    }

    console.log(`📝 Processing ingredient: ${ingredient.name}`)

    // Get API keys from environment
    const usdaApiKey = process.env.USDA_API_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!usdaApiKey) {
      throw new Error('USDA_API_KEY is not configured in environment')
    }

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured in environment')
    }

    let nutritionData: Partial<NutritionalData> = {}
    let dataSource: 'usda' | 'openai' = 'openai'
    let usdaFdcId: number | undefined

    // Step 1: Try USDA API first
    console.log('🔍 Attempting to fetch nutrition data from USDA...')
    const usdaResult = await getUSDANutritionalData(ingredient.name, usdaApiKey)

    if (usdaResult && usdaResult.nutrition) {
      console.log('✅ Successfully retrieved nutrition data from USDA')
      nutritionData = usdaResult.nutrition
      dataSource = 'usda'
      usdaFdcId = usdaResult.fdcId

      // Check if we have all required core nutrients
      const hasAllCoreNutrients =
        nutritionData.calories !== undefined &&
        nutritionData.protein !== undefined &&
        nutritionData.fat !== undefined &&
        nutritionData.carbohydrates !== undefined

      if (!hasAllCoreNutrients) {
        console.log('⚠️  USDA data incomplete, falling back to OpenAI for missing nutrients...')
        // We'll supplement with OpenAI data below
      }
    } else {
      console.log('⚠️  No USDA data found, falling back to OpenAI...')
    }

    // Step 2: Fallback to OpenAI if USDA didn't work or is incomplete
    if (
      !nutritionData.calories ||
      !nutritionData.protein ||
      !nutritionData.fat ||
      !nutritionData.carbohydrates
    ) {
      console.log('🤖 Fetching nutrition data from OpenAI...')

      try {
        const result = await generateObject({
          model: openai('gpt-4o-mini'),
          schema: nutritionalDataSchema,
          prompt: `Provide detailed nutritional information per 100g for the following ingredient: "${ingredient.name}".

Include all available nutrients with accurate values based on USDA or WHO nutritional databases.

For piece weights (smallPieceWeight, mediumPieceWeight, largePieceWeight):
- Think about the smallest practical unit of this ingredient that people would use
- For example: one grain of rice (~0.02g), one slice of apple (~15g), one piece of carrot (~5g)
- Provide realistic weights in grams for small, medium, and large pieces

Respond with accurate nutritional data. Use 0 for nutrients that are not present or unknown.`,
        })

        console.log('✅ Successfully retrieved nutrition data from OpenAI')

        // If we have partial USDA data, merge it with OpenAI data (USDA takes priority)
        if (dataSource === 'usda') {
          nutritionData = {
            ...result.object,
            ...nutritionData, // USDA data overrides OpenAI
          }
          console.log('📊 Merged USDA and OpenAI nutrition data (USDA takes priority)')
        } else {
          nutritionData = result.object
          dataSource = 'openai'
        }
      } catch (error) {
        console.error('❌ Error fetching nutrition data from OpenAI:', error)
        throw error
      }
    }

    // Ensure we have the required fields
    if (
      !nutritionData.calories ||
      !nutritionData.protein ||
      !nutritionData.fat ||
      !nutritionData.carbohydrates
    ) {
      throw new Error('Failed to get complete nutritional data from both USDA and OpenAI')
    }

    // Create nutritional data record
    const nutritionalValueData: Omit<IngredientNutrition, 'id' | 'updatedAt' | 'createdAt'> &
      Partial<Pick<IngredientNutrition, 'id' | 'updatedAt' | 'createdAt'>> = {
      ingredient: ingredient.id,
      ingredientSlugEn: ingredient.slug || '',
      dataSource,
      usdaFdcId,
      calories: nutritionData.calories,
      protein: nutritionData.protein,
      fat: nutritionData.fat,
      carbohydrates: nutritionData.carbohydrates,
      saturatedFat: nutritionData.saturatedFat || 0,
      transFat: nutritionData.transFat || 0,
      polyunsaturatedFat: nutritionData.polyunsaturatedFat || 0,
      monounsaturatedFat: nutritionData.monounsaturatedFat || 0,
      cholesterol: nutritionData.cholesterol || 0,
      fiber: nutritionData.fiber || 0,
      sugars: nutritionData.sugars || 0,
      addedSugars: nutritionData.addedSugars || 0,
      sodium: nutritionData.sodium || 0,
      potassium: nutritionData.potassium || 0,
      calcium: nutritionData.calcium || 0,
      iron: nutritionData.iron || 0,
      vitaminA: nutritionData.vitaminA || 0,
      vitaminC: nutritionData.vitaminC || 0,
      vitaminD: nutritionData.vitaminD || 0,
      vitaminE: nutritionData.vitaminE || 0,
      vitaminK: nutritionData.vitaminK || 0,
      magnesium: nutritionData.magnesium || 0,
      zinc: nutritionData.zinc || 0,
      phosphorus: nutritionData.phosphorus || 0,
      folate: nutritionData.folate || 0,
      niacin: nutritionData.niacin || 0,
      riboflavin: nutritionData.riboflavin || 0,
      thiamin: nutritionData.thiamin || 0,
      vitaminB6: nutritionData.vitaminB6 || 0,
      vitaminB12: nutritionData.vitaminB12 || 0,
      biotin: nutritionData.biotin || 0,
      pantothenicAcid: nutritionData.pantothenicAcid || 0,
      selenium: nutritionData.selenium || 0,
      copper: nutritionData.copper || 0,
      manganese: nutritionData.manganese || 0,
      chromium: nutritionData.chromium || 0,
      molybdenum: nutritionData.molybdenum || 0,
      iodine: nutritionData.iodine || 0,
      chloride: nutritionData.chloride || 0,
      smallPieceWeight: nutritionData.smallPieceWeight || 0,
      mediumPieceWeight: nutritionData.mediumPieceWeight || 0,
      largePieceWeight: nutritionData.largePieceWeight || 0,
    }

    const createdNutritionalValue = await payload.create({
      collection: 'ingredient-nutritions',
      data: nutritionalValueData,
    })

    console.log(
      `✅ Nutritional data created successfully for ingredient "${ingredient.name}" (ID: ${createdNutritionalValue.id}) using ${dataSource.toUpperCase()} data`,
    )

    return NextResponse.json({
      success: true,
      message: 'Nutrition data processed successfully',
      ingredientId: ingredient.id,
      dataSource,
    })
  } catch (error) {
    console.error('❌ Error processing nutrition data:', error)

    // Return error response - QStash will retry based on its retry policy
    return NextResponse.json(
      {
        error: 'Failed to process nutrition data',
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
  return NextResponse.json({ message: 'Nutrition processing endpoint' })
}
