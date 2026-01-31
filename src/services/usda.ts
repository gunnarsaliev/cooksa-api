import {
  usdaSearchResponseSchema,
  usdaFoodDetailsSchema,
  USDA_NUTRIENT_MAPPING,
  type USDASearchResponse,
  type USDAFoodDetails,
  type NutritionalData,
} from '@/schemas/nutrition'

const USDA_API_BASE_URL = 'https://api.nal.usda.gov/fdc/v1'

/**
 * Search for food in the USDA FoodData Central database
 * @param query - Search query (ingredient name)
 * @param apiKey - USDA API key
 * @param pageSize - Number of results to return (default: 5)
 * @returns Search results from USDA API
 */
export async function searchUSDAFood(
  query: string,
  apiKey: string,
  pageSize: number = 5
): Promise<USDASearchResponse> {
  console.log(`🔍 Searching USDA database for: "${query}"`)

  const url = new URL(`${USDA_API_BASE_URL}/foods/search`)
  url.searchParams.append('api_key', apiKey)
  url.searchParams.append('query', query)
  url.searchParams.append('pageSize', pageSize.toString())
  // Prefer Foundation Foods and SR Legacy for accurate nutritional data
  url.searchParams.append('dataType', 'Foundation,SR Legacy')

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(
        `USDA API search failed: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json() as any
    console.log(`✅ USDA search returned ${data.foods?.length || 0} results`)

    // Validate and parse response with Zod
    const validatedData = usdaSearchResponseSchema.parse(data)
    return validatedData
  } catch (error) {
    console.error('❌ Error searching USDA database:', error)
    throw error
  }
}

/**
 * Get detailed food information from USDA FoodData Central
 * @param fdcId - FoodData Central ID
 * @param apiKey - USDA API key
 * @returns Detailed food information including nutrients
 */
export async function getUSDAFoodDetails(
  fdcId: number,
  apiKey: string
): Promise<USDAFoodDetails> {
  console.log(`📊 Fetching USDA food details for FDC ID: ${fdcId}`)

  const url = new URL(`${USDA_API_BASE_URL}/food/${fdcId}`)
  url.searchParams.append('api_key', apiKey)

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(
        `USDA API details failed: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json() as any
    console.log(`✅ USDA food details retrieved for: ${data.description}`)

    // Validate and parse response with Zod
    const validatedData = usdaFoodDetailsSchema.parse(data)
    return validatedData
  } catch (error) {
    console.error('❌ Error fetching USDA food details:', error)
    throw error
  }
}

/**
 * Convert USDA unit to standard unit
 * @param value - Nutrient value
 * @param unitName - USDA unit name
 * @param targetUnit - Target unit (g, mg, mcg, IU, kcal)
 * @returns Converted value
 */
function convertUnit(
  value: number,
  unitName: string,
  targetUnit: string
): number {
  const unit = unitName.toLowerCase()

  // If units match, return as is
  if (unit === targetUnit.toLowerCase()) {
    return value
  }

  // Convert mcg to mg (1 mg = 1000 mcg)
  if (unit === 'µg' || unit === 'ug' || unit === 'mcg') {
    if (targetUnit === 'mg') {
      return value / 1000
    }
    if (targetUnit === 'mcg' || targetUnit === 'µg') {
      return value
    }
  }

  // Convert mg to g (1 g = 1000 mg)
  if (unit === 'mg' && targetUnit === 'g') {
    return value / 1000
  }

  // Convert g to mg
  if (unit === 'g' && targetUnit === 'mg') {
    return value * 1000
  }

  // IU conversions (approximations)
  if (unit === 'iu' && targetUnit === 'mcg') {
    // Vitamin A: 1 IU = 0.3 mcg retinol
    // Vitamin D: 1 IU = 0.025 mcg
    // These are approximations, keep IU as is for now
    return value
  }

  // Default: return original value if no conversion needed
  return value
}

/**
 * Map USDA nutrients to our nutritional data schema
 * @param usdaFood - USDA food details
 * @returns Nutritional data in our schema format
 */
export function mapUSDANutrients(usdaFood: USDAFoodDetails): Partial<NutritionalData> {
  console.log(`🗺️  Mapping USDA nutrients for: ${usdaFood.description}`)

  const nutritionData: Partial<NutritionalData> = {}

  // Process each nutrient from USDA data
  for (const nutrient of usdaFood.foodNutrients) {
    if (!nutrient.nutrient || nutrient.amount === undefined) {
      continue
    }

    const nutrientNumber = nutrient.nutrient.number
    const fieldName = USDA_NUTRIENT_MAPPING[nutrientNumber]

    if (!fieldName) {
      // Skip nutrients we don't track
      continue
    }

    // Get the nutrient value
    let value = nutrient.amount

    // Convert units if needed
    const unitName = nutrient.nutrient.unitName || ''

    // Determine expected unit for each field
    let expectedUnit = 'g' // default for macronutrients

    // Minerals (except for a few) are in mg
    if (
      [
        'sodium',
        'potassium',
        'calcium',
        'iron',
        'magnesium',
        'zinc',
        'phosphorus',
        'copper',
        'manganese',
        'chloride',
      ].includes(fieldName)
    ) {
      expectedUnit = 'mg'
    }

    // Some vitamins and minerals are in mcg
    if (
      [
        'folate',
        'vitaminK',
        'biotin',
        'selenium',
        'chromium',
        'molybdenum',
        'iodine',
        'vitaminB12',
      ].includes(fieldName)
    ) {
      expectedUnit = 'mcg'
    }

    // Vitamins A and D can be in IU
    if (['vitaminA', 'vitaminD'].includes(fieldName)) {
      expectedUnit = 'IU'
    }

    // Energy is in kcal
    if (fieldName === 'calories') {
      expectedUnit = 'kcal'
    }

    // Convert the value to expected unit
    value = convertUnit(value, unitName, expectedUnit)

    // Store the value
    if (value > 0) {
      nutritionData[fieldName] = value
      console.log(
        `  ✓ ${fieldName}: ${value} ${expectedUnit} (from ${nutrient.nutrient.name})`
      )
    }
  }

  // Log summary
  const fieldsPopulated = Object.keys(nutritionData).length
  console.log(`✅ Mapped ${fieldsPopulated} nutritional fields from USDA data`)

  return nutritionData
}

/**
 * Search and extract nutritional data from USDA database
 * @param ingredientName - Name of the ingredient to search
 * @param apiKey - USDA API key
 * @returns Nutritional data and FDC ID, or null if not found
 */
export async function getUSDANutritionalData(
  ingredientName: string,
  apiKey: string
): Promise<{ nutrition: Partial<NutritionalData>; fdcId: number } | null> {
  try {
    // Search for the ingredient
    const searchResults = await searchUSDAFood(ingredientName, apiKey, 5)

    if (!searchResults.foods || searchResults.foods.length === 0) {
      console.log(`⚠️  No USDA data found for: "${ingredientName}"`)
      return null
    }

    // Get the first (best match) result
    const bestMatch = searchResults.foods[0]
    console.log(`🎯 Best match: ${bestMatch.description} (FDC ID: ${bestMatch.fdcId})`)

    // Get detailed nutritional information
    const foodDetails = await getUSDAFoodDetails(bestMatch.fdcId, apiKey)

    // Map nutrients to our schema
    const nutrition = mapUSDANutrients(foodDetails)

    // Check if we got meaningful data (at least the core nutrients)
    const hasCoreNutrients =
      nutrition.calories !== undefined &&
      nutrition.protein !== undefined &&
      nutrition.fat !== undefined &&
      nutrition.carbohydrates !== undefined

    if (!hasCoreNutrients) {
      console.log(`⚠️  USDA data for "${ingredientName}" is incomplete (missing core nutrients)`)
      return null
    }

    return {
      nutrition,
      fdcId: bestMatch.fdcId,
    }
  } catch (error) {
    console.error(`❌ Error getting USDA nutritional data for "${ingredientName}":`, error)
    return null
  }
}
