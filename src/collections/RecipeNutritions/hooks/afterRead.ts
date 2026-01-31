import { RecipeNutrition } from '@/payload-types'

// Helper function to round numbers to 2 decimal places
const roundToTwoDecimals = (value: number | null | undefined): number | null | undefined => {
    if (typeof value === 'number') {
        return Math.round(value * 100) / 100
    }
    return value
}

// Helper function to round all numeric fields in an object
const roundNumericFields = (data: RecipeNutrition): RecipeNutrition => {
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
            roundedData[field] = roundToTwoDecimals(roundedData[field]) as number
        }
    })

    return roundedData
}

export const roundingNutritionValuesHook = async ({ doc }: { doc: RecipeNutrition }) => {
    // Round all numeric fields to 2 decimal places after reading
    return roundNumericFields(doc)
}
