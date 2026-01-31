import type { CollectionBeforeDeleteHook } from 'payload'
import { Recipe, RecipeNutrition } from '@/payload-types'

export const cleanupRecipeNutritionOnDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
    console.log('🗑️ Deleting recipe, cleaning up related data...');

    try {
        // First, get the recipe to find its slug
        const recipe = await req.payload.findByID({
            collection: 'recipes',
            id: id,
        }) as Recipe | null;

        if (!recipe || !recipe.slug) {
            console.log('⚠️ Recipe not found or no slug available, skipping nutrition cleanup');
            return;
        }

        const recipeSlug = typeof recipe.slug === 'string' ? recipe.slug :
            (typeof recipe.slug === 'object' && recipe.slug && 'en' in recipe.slug ? (recipe.slug as Record<string, string>).en : null);

        if (!recipeSlug) {
            console.log('⚠️ No valid recipe slug found, skipping nutrition cleanup');
            return;
        }

        // Delete related recipe nutrition records using recipeSlug
        const recipeNutritions = await req.payload.find({
            collection: 'recipe-nutritions',
            where: { recipeSlug: { equals: recipeSlug } },
            limit: 100,
        });

        if (recipeNutritions.docs.length > 0) {
            console.log(`🗑️ Found ${recipeNutritions.docs.length} recipe nutrition records to delete for slug: ${recipeSlug}`);

            for (const nutrition of recipeNutritions.docs as RecipeNutrition[]) {
                await req.payload.delete({
                    collection: 'recipe-nutritions',
                    id: nutrition.id,
                });
            }

            console.log('✅ Recipe nutrition records deleted successfully');
        } else {
            console.log(`ℹ️ No recipe nutrition records found for slug: ${recipeSlug}`);
        }
    } catch (error) {
        console.error('❌ Error deleting related recipe nutrition records:', error);
        // Don't throw the error, let the deletion continue
    }
}
