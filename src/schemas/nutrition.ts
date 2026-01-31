import { z } from 'zod'

// USDA API response schemas
export const usdaSearchResponseSchema = z.object({
  totalHits: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
  foods: z.array(
    z.object({
      fdcId: z.number(),
      description: z.string(),
      dataType: z.string(),
      foodCategory: z.string().optional(),
      score: z.number().optional(),
    })
  ),
})

export const usdaFoodDetailsSchema = z.object({
  fdcId: z.number(),
  description: z.string(),
  dataType: z.string(),
  foodNutrients: z.array(
    z.object({
      nutrient: z
        .object({
          number: z.string(),
          name: z.string(),
          unitName: z.string(),
        })
        .optional(),
      amount: z.number().optional(),
    })
  ),
})

// TypeScript types
export type USDASearchResponse = z.infer<typeof usdaSearchResponseSchema>
export type USDAFoodDetails = z.infer<typeof usdaFoodDetailsSchema>

// Nutritional data schema
export const nutritionalDataSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  fat: z.number(),
  saturatedFat: z.number().optional(),
  transFat: z.number().optional(),
  polyunsaturatedFat: z.number().optional(),
  monounsaturatedFat: z.number().optional(),
  cholesterol: z.number().optional(),
  carbohydrates: z.number(),
  fiber: z.number().optional(),
  sugars: z.number().optional(),
  addedSugars: z.number().optional(),
  sodium: z.number().optional(),
  potassium: z.number().optional(),
  calcium: z.number().optional(),
  iron: z.number().optional(),
  vitaminA: z.number().optional(),
  vitaminC: z.number().optional(),
  vitaminD: z.number().optional(),
  vitaminE: z.number().optional(),
  vitaminK: z.number().optional(),
  magnesium: z.number().optional(),
  zinc: z.number().optional(),
  phosphorus: z.number().optional(),
  folate: z.number().optional(),
  niacin: z.number().optional(),
  riboflavin: z.number().optional(),
  thiamin: z.number().optional(),
  vitaminB6: z.number().optional(),
  vitaminB12: z.number().optional(),
  biotin: z.number().optional(),
  pantothenicAcid: z.number().optional(),
  selenium: z.number().optional(),
  copper: z.number().optional(),
  manganese: z.number().optional(),
  chromium: z.number().optional(),
  molybdenum: z.number().optional(),
  iodine: z.number().optional(),
  chloride: z.number().optional(),
  smallPieceWeight: z.number().optional(),
  mediumPieceWeight: z.number().optional(),
  largePieceWeight: z.number().optional(),
})

// Nutritional data type matching our Payload schema
export type NutritionalData = {
  calories: number
  protein: number
  fat: number
  saturatedFat?: number
  transFat?: number
  polyunsaturatedFat?: number
  monounsaturatedFat?: number
  cholesterol?: number
  carbohydrates: number
  fiber?: number
  sugars?: number
  addedSugars?: number
  sodium?: number
  potassium?: number
  calcium?: number
  iron?: number
  vitaminA?: number
  vitaminC?: number
  vitaminD?: number
  vitaminE?: number
  vitaminK?: number
  magnesium?: number
  zinc?: number
  phosphorus?: number
  folate?: number
  niacin?: number
  riboflavin?: number
  thiamin?: number
  vitaminB6?: number
  vitaminB12?: number
  biotin?: number
  pantothenicAcid?: number
  selenium?: number
  copper?: number
  manganese?: number
  chromium?: number
  molybdenum?: number
  iodine?: number
  chloride?: number
  smallPieceWeight?: number
  mediumPieceWeight?: number
  largePieceWeight?: number
}

// USDA nutrient number to our field name mapping
export const USDA_NUTRIENT_MAPPING: Record<string, keyof NutritionalData> = {
  '208': 'calories', // Energy
  '203': 'protein', // Protein
  '204': 'fat', // Total lipid (fat)
  '606': 'saturatedFat', // Fatty acids, total saturated
  '605': 'transFat', // Fatty acids, total trans
  '646': 'polyunsaturatedFat', // Fatty acids, total polyunsaturated
  '645': 'monounsaturatedFat', // Fatty acids, total monounsaturated
  '601': 'cholesterol', // Cholesterol
  '205': 'carbohydrates', // Carbohydrate, by difference
  '291': 'fiber', // Fiber, total dietary
  '269': 'sugars', // Sugars, total including NLEA
  '539': 'addedSugars', // Sugars, added
  '307': 'sodium', // Sodium, Na
  '306': 'potassium', // Potassium, K
  '301': 'calcium', // Calcium, Ca
  '303': 'iron', // Iron, Fe
  '320': 'vitaminA', // Vitamin A, RAE
  '401': 'vitaminC', // Vitamin C, total ascorbic acid
  '324': 'vitaminD', // Vitamin D (D2 + D3)
  '323': 'vitaminE', // Vitamin E (alpha-tocopherol)
  '430': 'vitaminK', // Vitamin K (phylloquinone)
  '304': 'magnesium', // Magnesium, Mg
  '309': 'zinc', // Zinc, Zn
  '305': 'phosphorus', // Phosphorus, P
  '417': 'folate', // Folate, total
  '406': 'niacin', // Niacin
  '405': 'riboflavin', // Riboflavin
  '404': 'thiamin', // Thiamin
  '415': 'vitaminB6', // Vitamin B-6
  '418': 'vitaminB12', // Vitamin B-12
  '416': 'biotin', // Biotin (not standard in USDA)
  '410': 'pantothenicAcid', // Pantothenic acid
  '317': 'selenium', // Selenium, Se
  '312': 'copper', // Copper, Cu
  '315': 'manganese', // Manganese, Mn
  '313': 'chromium', // Chromium (not standard in USDA)
  '314': 'molybdenum', // Molybdenum (not standard in USDA)
  '310': 'iodine', // Iodine (not standard in USDA)
  '316': 'chloride', // Chloride (not standard in USDA)
}
