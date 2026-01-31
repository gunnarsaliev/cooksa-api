import type { Field } from 'payload'

/**
 * Standard nutrition fields shared across both RecipeNutritions and IngredientNutritions collections
 * All values are per 100g serving unless otherwise specified
 */
export const nutritionFields: Field[] = [
  {
    name: 'calories',
    type: 'number',
    label: 'Calories per 100g (kcal)',
    required: true,
    admin: {
      position: 'sidebar',
    },
  },
  {
    name: 'protein',
    type: 'number',
    label: 'Protein (g)',
    required: true,
    admin: {
      position: 'sidebar',
    },
  },
  {
    name: 'fat',
    type: 'number',
    label: 'Total Fat (g)',
    required: true,
    admin: {
      position: 'sidebar',
    },
  },
  {
    name: 'saturatedFat',
    type: 'number',
    label: 'Saturated Fat (g)',
  },
  {
    name: 'transFat',
    type: 'number',
    label: 'Trans Fat (g)',
  },
  {
    name: 'polyunsaturatedFat',
    type: 'number',
    label: 'Polyunsaturated Fat (g)',
  },
  {
    name: 'monounsaturatedFat',
    type: 'number',
    label: 'Monounsaturated Fat (g)',
  },
  {
    name: 'cholesterol',
    type: 'number',
    label: 'Cholesterol (mg)',
  },
  {
    name: 'carbohydrates',
    type: 'number',
    label: 'Total Carbohydrates (g)',
    required: true,
    admin: {
      position: 'sidebar',
    },
  },
  {
    name: 'fiber',
    type: 'number',
    label: 'Dietary Fiber (g)',
  },
  {
    name: 'sugars',
    type: 'number',
    label: 'Sugars (g)',
  },
  {
    name: 'addedSugars',
    type: 'number',
    label: 'Added Sugars (g)',
  },
  {
    name: 'sodium',
    type: 'number',
    label: 'Sodium (mg)',
  },
  {
    name: 'potassium',
    type: 'number',
    label: 'Potassium (mg)',
  },
  {
    name: 'calcium',
    type: 'number',
    label: 'Calcium (mg)',
  },
  {
    name: 'iron',
    type: 'number',
    label: 'Iron (mg)',
  },
  {
    name: 'vitaminA',
    type: 'number',
    label: 'Vitamin A (IU)',
  },
  {
    name: 'vitaminC',
    type: 'number',
    label: 'Vitamin C (mg)',
  },
  {
    name: 'vitaminD',
    type: 'number',
    label: 'Vitamin D (IU)',
  },
  {
    name: 'vitaminE',
    type: 'number',
    label: 'Vitamin E (mg)',
  },
  {
    name: 'vitaminK',
    type: 'number',
    label: 'Vitamin K (mcg)',
  },
  {
    name: 'magnesium',
    type: 'number',
    label: 'Magnesium (mg)',
  },
  {
    name: 'zinc',
    type: 'number',
    label: 'Zinc (mg)',
  },
  {
    name: 'phosphorus',
    type: 'number',
    label: 'Phosphorus (mg)',
  },
  {
    name: 'folate',
    type: 'number',
    label: 'Folate (mcg)',
  },
  {
    name: 'niacin',
    type: 'number',
    label: 'Niacin (mg)',
  },
  {
    name: 'riboflavin',
    type: 'number',
    label: 'Riboflavin (mg)',
  },
  {
    name: 'thiamin',
    type: 'number',
    label: 'Thiamin (mg)',
  },
  {
    name: 'vitaminB6',
    type: 'number',
    label: 'Vitamin B6 (mg)',
  },
  {
    name: 'vitaminB12',
    type: 'number',
    label: 'Vitamin B12 (mcg)',
  },
  {
    name: 'biotin',
    type: 'number',
    label: 'Biotin (mcg)',
  },
  {
    name: 'pantothenicAcid',
    type: 'number',
    label: 'Pantothenic Acid (mg)',
  },
  {
    name: 'selenium',
    type: 'number',
    label: 'Selenium (mcg)',
  },
  {
    name: 'copper',
    type: 'number',
    label: 'Copper (mg)',
  },
  {
    name: 'manganese',
    type: 'number',
    label: 'Manganese (mg)',
  },
  {
    name: 'chromium',
    type: 'number',
    label: 'Chromium (mcg)',
  },
  {
    name: 'molybdenum',
    type: 'number',
    label: 'Molybdenum (mcg)',
  },
  {
    name: 'iodine',
    type: 'number',
    label: 'Iodine (mcg)',
  },
  {
    name: 'chloride',
    type: 'number',
    label: 'Chloride (mg)',
  },
]
