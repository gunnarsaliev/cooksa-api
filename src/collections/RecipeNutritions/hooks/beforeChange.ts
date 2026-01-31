import { PayloadRequest } from 'payload'
import { RecipeNutrition } from '@/payload-types'

// Helper function to round numbers to 2 decimal places
const roundToTwoDecimals = (value: number | null | undefined): number | null | undefined => {
    if (typeof value === 'number') {
        return Math.round(value * 100) / 100
    }
    return value
}

// Helper function to round all numeric fields in an object
const roundNumericFields = (data: Partial<RecipeNutrition>): Partial<RecipeNutrition> => {
    if (!data || typeof data !== 'object') return data

    const numericFields = [
        'calories', 'protein', 'fat', 'saturatedFat', 'transFat', 'polyunsaturatedFat',
        'monounsaturatedFat', 'cholesterol', 'carbohydrates', 'fiber', 'sugars',
        'addedSugars', 'sodium', 'potassium', 'calcium', 'iron', 'vitaminA',
        'vitaminC', 'vitaminD', 'vitaminE', 'vitaminK', 'magnesium', 'zinc',
        'phosphorus', 'folate', 'niacin', 'riboflavin', 'thiamin', 'vitaminB6',
        'vitaminB12', 'biotin', 'pantothenicAcid', 'selenium', 'copper', 'manganese',
        'chromium', 'molybdenum', 'iodine', 'chloride'
    ] as const

    const roundedData = { ...data }
    numericFields.forEach(field => {
        if (roundedData[field] !== undefined && roundedData[field] !== null) {
            roundedData[field] = roundToTwoDecimals(roundedData[field]) as number | undefined
        }
    })

    return roundedData
}

export const beforeChangeHook = async ({ data, req }: { data: Partial<RecipeNutrition>; req: PayloadRequest }) => {
    if (data.recipeSlug) {
        try {
            const recipeDoc = await req.payload.find({
                collection: 'recipes',
                where: { slug: { equals: data.recipeSlug } },
                limit: 1,
            })
            if (recipeDoc.docs.length > 0) {
                const recipe = recipeDoc.docs[0]
                if (recipe?.name) {
                    data.recipeName = recipe.name
                }
                const slug = recipe?.slug
                if (slug) {
                    if (typeof slug === 'string') {
                        data.recipeSlugEn = slug
                    } else if (typeof slug === 'object' && 'en' in slug) {
                        data.recipeSlugEn = (slug as Record<string, string>).en
                    }
                }
            }
        } catch (error) {
            console.warn(`Could not find recipe with slug ${data.recipeSlug} for recipe nutrition creation:`, error)
            // Don't throw the error, just continue without setting recipeName and recipeSlugEn
        }
    }

    // Set lastCalculated to current date
    data.lastCalculated = new Date().toISOString()

    // Round all numeric fields to 2 decimal places
    return roundNumericFields(data)
}
