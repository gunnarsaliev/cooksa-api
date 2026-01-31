import type { CollectionBeforeChangeHook } from 'payload'
import { Recipe, RecipeNutrition } from '@/payload-types'

export const cleanupRecipeNutritionOnUnpublish: CollectionBeforeChangeHook<Recipe> = async ({ data, req, operation }) => {
    // Handle recipe unpublishing - delete nutrition records when recipe is unpublished
    if (operation === 'update' && data._status === 'draft') {
        console.log('📝 Recipe being unpublished, cleaning up nutrition records...');

        try {
            // Find existing nutrition records for this recipe
            const recipeNutritions = await req.payload.find({
                collection: 'recipe-nutritions',
                where: { recipeSlug: { equals: data.slug } },
                limit: 100,
            });

            if (recipeNutritions.docs.length > 0) {
                console.log(`🗑️ Found ${recipeNutritions.docs.length} recipe nutrition records to delete for unpublished recipe`);

                for (const nutrition of recipeNutritions.docs as RecipeNutrition[]) {
                    await req.payload.delete({
                        collection: 'recipe-nutritions',
                        id: nutrition.id,
                    });
                }

                console.log('✅ Recipe nutrition records deleted for unpublished recipe');
            }
        } catch (error) {
            console.error('❌ Error deleting recipe nutrition records for unpublished recipe:', error);
            // Don't throw the error, let the update continue
        }
    }
}
