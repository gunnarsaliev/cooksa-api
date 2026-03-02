import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import type { Recipe } from '@/payload-types'
import type { Payload } from 'payload'
import { translateText, translateRichText } from './translateIngredient'
import { formatSlug } from '@/lib/formatSlug'

/**
 * Translates an array of direction objects
 */
export async function translateDirectionsArray(
  directionsArray: Array<{ direction: string; id?: string }> | undefined,
  openaiApiKey: string,
  targetLanguage: string = 'Bulgarian',
): Promise<Array<{ direction: string; id?: string }>> {
  if (!directionsArray || !Array.isArray(directionsArray) || directionsArray.length === 0) {
    return []
  }

  const translatedDirections = await Promise.all(
    directionsArray.map(async (dir) => {
      const translatedDirection = await translateText(dir.direction, openaiApiKey, targetLanguage)

      return {
        ...dir,
        direction: translatedDirection,
      }
    }),
  )

  return translatedDirections
}

/**
 * Translates ingredients array
 * Note: The ingredient relationships themselves don't need translation,
 * but the ingredient field is localized so it needs to be preserved per locale
 */
export async function translateIngredientsArray(
  ingredientsArray:
    | Array<{
        amount?: string
        unit?: any
        ingredient: any
        id?: string
      }>
    | undefined,
  openaiApiKey: string,
  targetLanguage: string = 'Bulgarian',
): Promise<
  Array<{
    amount?: string
    unit?: any
    ingredient: any
    id?: string
  }>
> {
  if (!ingredientsArray || !Array.isArray(ingredientsArray) || ingredientsArray.length === 0) {
    return []
  }

  // For ingredients array, we need to preserve the relationships
  // The ingredient field is localized, so each locale maintains its own ingredient reference
  // We just need to return the same structure - the localized ingredient relationship
  // will be maintained by Payload's localization system
  return ingredientsArray.map((ing) => ({
    ...ing,
    // Keep the same ingredient reference - Payload handles localized relationships
    ingredient: ing.ingredient,
  }))
}

/**
 * Main function to translate a recipe to Bulgarian
 */
export async function translateRecipe(
  recipeId: number | string,
  payload: Payload,
  openaiApiKey: string,
): Promise<void> {
  console.log(`🌍 Starting translation for recipe ID: ${recipeId}`)

  try {
    // Fetch the recipe in English locale
    const recipe = await payload.findByID({
      collection: 'recipes',
      id: recipeId,
      locale: 'all',
    })

    if (!recipe) {
      throw new Error(`Recipe with ID ${recipeId} not found`)
    }

    console.log(`📝 Translating recipe: ${recipe.name}`)

    // Translate all localized fields
    const translatedName = await translateText(recipe.name, openaiApiKey)
    console.log(`✅ Translated name: ${recipe.name} → ${translatedName}`)

    // Generate Bulgarian slug from translated name
    const translatedSlug = formatSlug(translatedName, 'bg')
    console.log(`✅ Generated slug: ${translatedSlug}`)

    const translatedDescription = recipe.description
      ? await translateRichText(recipe.description, openaiApiKey)
      : undefined
    if (translatedDescription) {
      console.log(`✅ Translated description`)
    }

    const translatedDirections = recipe.directions
      ? await translateDirectionsArray(
          recipe.directions as Array<{ direction: string; id?: string }>,
          openaiApiKey,
        )
      : undefined
    if (translatedDirections && translatedDirections.length > 0) {
      console.log(`✅ Translated ${translatedDirections.length} directions`)
    }

    // For ingredients, we preserve the structure
    // The ingredient relationships are localized, so Payload handles them
    const ingredientsData = recipe.ingredients
      ? await translateIngredientsArray(
          recipe.ingredients as Array<{
            amount?: string
            unit?: any
            ingredient: any
            id?: string
          }>,
          openaiApiKey,
        )
      : undefined
    if (ingredientsData && ingredientsData.length > 0) {
      console.log(`✅ Processed ${ingredientsData.length} ingredients`)
    }

    // Update the recipe with Bulgarian translations
    await payload.update({
      collection: 'recipes',
      id: recipeId,
      locale: 'bg',
      data: {
        name: translatedName,
        slug: translatedSlug,
        description: translatedDescription,
        directions: translatedDirections,
        ingredients: ingredientsData,
      },
    })

    console.log(`✅ Successfully translated and updated recipe: ${recipe.name}`)
  } catch (error) {
    console.error(`❌ Error translating recipe ${recipeId}:`, error)
    throw error
  }
}
