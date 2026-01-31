import { PayloadRequest } from 'payload'
import { IngredientNutrition } from '@/payload-types'

export const triggerDeleteIngredientNutritions = async ({ data, req }: { data: Partial<IngredientNutrition>; req: PayloadRequest }) => {
    if (data.ingredient) {
        try {
            const ingredientDoc = await req.payload.findByID({
                collection: 'ingredients',
                id: typeof data.ingredient === 'number' ? data.ingredient : data.ingredient.id,
            })
            const slug = ingredientDoc?.slug
            if (slug) {
                if (typeof slug === 'string') {
                    data.ingredientSlugEn = slug
                } else if (typeof slug === 'object' && 'en' in slug) {
                    data.ingredientSlugEn = (slug as Record<string, string>).en
                }
            }
        } catch (error) {
            console.warn(`Could not find ingredient with ID ${data.ingredient} for nutritional value creation:`, error)
            // Don't throw the error, just continue without setting ingredientSlugEn
        }
    }
    return data
}
