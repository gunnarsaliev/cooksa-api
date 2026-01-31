import type { CollectionBeforeDeleteHook } from 'payload'

export const deleteIngredientNutritions: CollectionBeforeDeleteHook = async ({ id, req }) => {
    console.log('🗑️ Deleting ingredient, cleaning up nutritional values...');

    try {
        // First, get the ingredient to find its slug
        const ingredient = await req.payload.findByID({
            collection: 'ingredients',
            id: id,
        });

        if (!ingredient || !ingredient.slug) {
            console.log('⚠️ Ingredient not found or no slug available, skipping nutritional values cleanup');
            return;
        }

        const ingredientSlug = typeof ingredient.slug === 'string' ? ingredient.slug :
            (typeof ingredient.slug === 'object' && ingredient.slug && 'en' in ingredient.slug ? (ingredient.slug as Record<string, string>).en : null);

        if (!ingredientSlug) {
            console.log('⚠️ No valid ingredient slug found, skipping nutritional values cleanup');
            return;
        }

        // Delete related nutritional value records using ingredientSlugEn
        const nutritionalValues = await req.payload.find({
            collection: 'ingredient-nutritions',
            where: { ingredientSlugEn: { equals: ingredientSlug } },
            limit: 100,
        });

        if (nutritionalValues.docs.length > 0) {
            console.log(`🗑️ Found ${nutritionalValues.docs.length} nutritional value records to delete for slug: ${ingredientSlug}`);

            for (const nutritionalValue of nutritionalValues.docs) {
                await req.payload.delete({
                    collection: 'ingredient-nutritions',
                    id: nutritionalValue.id,
                });
            }

            console.log('✅ Nutritional value records deleted successfully');
        } else {
            console.log(`ℹ️ No nutritional value records found for slug: ${ingredientSlug}`);
        }
    } catch (error) {
        console.error('❌ Error deleting related nutritional value records:', error);
        // Don't throw the error, let the deletion continue
    }
};