import type { CollectionAfterChangeHook } from 'payload';
import type { Recipe, RecipeNutrition } from '@/payload-types';

/**
 * RECIPE NUTRITION CALCULATION FORMULA
 *
 * This implementation follows the standard EuroFIR formula for calculating recipe nutrition
 * from ingredient nutrition data:
 *
 * For each nutrient X (e.g., protein, fat, carbs, vitamins, minerals):
 *
 * Step 1: Calculate total nutrient content in the recipe
 * Total Nutrient X = Σ(Nutrient X per 100g of ingredient_i × Weight of ingredient_i in grams)
 *
 * Step 2: Calculate nutrient content per 100g of final recipe
 * Nutrient X per 100g of recipe = (Total Nutrient X / Total recipe weight in grams) × 100
 *
 * Mathematical representation:
 *
 * Nutrient X per 100g = (Σ(Nutrient X per 100g_i × Weight_i) / Total Weight) × 100
 *
 * Where:
 * - Nutrient X per 100g_i = nutrient value per 100g of ingredient i
 * - Weight_i = actual weight of ingredient i used in the recipe (in grams)
 * - Total Weight = sum of all ingredient weights
 *
 * This formula ensures:
 * 1. Proportional contribution of each ingredient based on its weight
 * 2. Standardized output per 100g for easy comparison
 * 3. Accurate representation of nutrient density in the final recipe
 *
 * Note: This calculation assumes no nutrient loss during cooking (retention factor = 1.0).
 * For more precise calculations, retention factors can be applied to each ingredient.
 */

import { PayloadRequest } from 'payload'

// Helper function to convert units to grams for calculation
async function convertToGrams(amount: number, unit: string, ingredientId?: string, req?: PayloadRequest): Promise<number> {
    const conversionFactors: Record<string, number> = {
        'g': 1,
        'kg': 1000,
        'ml': 1, // Assuming 1ml = 1g for most ingredients
        'l': 1000,
        'tsp': 5, // Approximate: 1 tsp = 5g
        'tbsp': 15, // Approximate: 1 tbsp = 15g
        'cup': 240, // Approximate: 1 cup = 240g
        'OldValue1': 1, // Fallback
        'OldValue2': 1, // Fallback
    };

    // For piece units, fetch the actual ingredient weight data
    if (['smallPiece', 'mediumPiece', 'largePiece'].includes(unit) && ingredientId && req) {
        try {
            // First get the ingredient to find its slug
            const ingredientDoc = await req.payload.findByID({
                collection: 'ingredients',
                id: ingredientId,
            });

            if (ingredientDoc) {
                // Then find the ingredient nutrition data
                const nutritionDoc = await req.payload.find({
                    collection: 'ingredient-nutritions',
                    where: { ingredient: { equals: ingredientId } },
                    limit: 1,
                });

                if (nutritionDoc.docs.length > 0) {
                    const nutrition = nutritionDoc.docs[0];
                    const weightField = unit === 'smallPiece' ? 'smallPieceWeight' :
                        unit === 'mediumPiece' ? 'mediumPieceWeight' : 'largePieceWeight';

                    const weight = nutrition[weightField];
                    if (weight && typeof weight === 'number' && weight > 0) {
                        console.log(`⚖️ Using actual ${unit} weight for ingredient ${ingredientId}: ${weight}g`);
                        return amount * weight;
                    } else {
                        console.log(`⚠️ No ${weightField} found for ingredient ${ingredientId}, using default`);
                    }
                }
            }
        } catch (error) {
            console.error(`❌ Error fetching ingredient weight data for ${ingredientId}:`, error);
        }
    }

    // Fallback to default values for piece units
    const pieceDefaults: Record<string, number> = {
        'smallPiece': 100, // Default piece weight
        'mediumPiece': 200, // Default piece weight
        'largePiece': 300, // Default piece weight
    };

    const factor = conversionFactors[unit] || pieceDefaults[unit] || 1;
    return amount * factor;
}

// Helper function to calculate total recipe weight
async function calculateTotalRecipeWeight(ingredients: Recipe['ingredients'], req: PayloadRequest): Promise<number> {
    let total = 0;
    for (const ingredient of ingredients) {
        const amount = parseFloat(ingredient.amount || '0') || 0;
        const unit = ingredient.unit || 'g';
        const ingredientId = typeof ingredient.ingredient === 'number' ? ingredient.ingredient.toString() : undefined;
        const weightInGrams = await convertToGrams(amount, unit, ingredientId, req);
        total += weightInGrams;
    }
    return total;
}

/**
 * Calculate nutrition per 100g of recipe using the EuroFIR formula
 *
 * Formula: Nutrient per 100g = (Total Nutrient / Total Weight) × 100
 *
 * @param totalNutrition - Object containing total nutrient values for the recipe
 * @param totalWeight - Total weight of all ingredients in grams
 * @returns Object with nutrient values per 100g of recipe
 */
function calculateNutritionPer100g(totalNutrition: Record<string, number>, totalWeight: number): Record<string, number> {
    const nutritionPer100g: Record<string, number> = {};

    // Validate total weight
    if (totalWeight <= 0) {
        console.warn('⚠️ Invalid total weight for nutrition calculation:', totalWeight);
        return totalNutrition; // Return original values if weight is invalid
    }

    for (const [key, value] of Object.entries(totalNutrition)) {
        if (typeof value === 'number') {
            // Apply the EuroFIR formula: (Total Nutrient / Total Weight) × 100
            const nutrientPer100g = (value / totalWeight) * 100;

            // Validate the result
            if (!isNaN(nutrientPer100g) && isFinite(nutrientPer100g)) {
                nutritionPer100g[key] = Math.round(nutrientPer100g * 100) / 100; // Round to 2 decimal places
            } else {
                console.warn(`⚠️ Invalid nutrition per 100g calculation for ${key}: ${nutrientPer100g}`);
                nutritionPer100g[key] = 0;
            }
        } else {
            nutritionPer100g[key] = value;
        }
    }

    return nutritionPer100g;
}

/**
 * Validate nutrition data and log calculation summary
 *
 * @param totalNutrition - Total nutrition values
 * @param nutritionPer100g - Nutrition per 100g values
 * @param totalWeight - Total recipe weight
 * @param processedIngredients - Number of ingredients processed
 */
function validateAndLogNutritionCalculation(
    totalNutrition: Record<string, number>,
    nutritionPer100g: Record<string, number>,
    totalWeight: number,
    processedIngredients: number
): void {
    console.log('📊 Nutrition Calculation Summary:');
    console.log(`   • Total recipe weight: ${totalWeight}g`);
    console.log(`   • Ingredients processed: ${processedIngredients}`);

    // Validate key nutrients
    const keyNutrients = ['calories', 'protein', 'fat', 'carbohydrates'];
    for (const nutrient of keyNutrients) {
        if (nutritionPer100g[nutrient] !== undefined) {
            console.log(`   • ${nutrient}: ${nutritionPer100g[nutrient]} per 100g`);
        }
    }

    // Validate that total nutrition makes sense
    const totalCalories = totalNutrition.calories || 0;
    const expectedCalories = (nutritionPer100g.protein * 4) + (nutritionPer100g.fat * 9) + (nutritionPer100g.carbohydrates * 4);
    const calorieDifference = Math.abs(totalCalories - expectedCalories);

    if (calorieDifference > 50) { // Allow 50 calorie tolerance
        console.warn(`⚠️ Calorie calculation discrepancy: ${calorieDifference} calories`);
    }
}

export const triggerGenerateRecipeNitritions: CollectionAfterChangeHook<Recipe> = async ({ doc, req, operation }) => {
    console.log('🚀 triggerGenerateRecipeNitritions hook started');
    console.log('📋 Operation:', operation);
    console.log('📄 Document ID:', doc.id);
    console.log('📄 Document name:', doc.name);
    console.log('📄 Published at:', doc.publishedAt);
    console.log('📄 Status:', doc._status);
    console.log('🌍 Locale:', req.locale);

    // Only trigger when recipe is published
    if (!doc.publishedAt || doc._status !== 'published') {
        console.log('❌ Skipping - recipe not published');
        return doc;
    }

    // Only trigger for English locale
    if (req.locale && req.locale !== 'en') {
        console.log(`⏭️  Skipping recipe nutrition generation - not English locale (current: ${req.locale})`);
        return doc;
    }

    console.log('✅ Recipe is published, proceeding with nutrition calculation');

    // Execute the recipe nutrition calculation with a delay to ensure transaction is committed
    setTimeout(async () => {
        console.log('🔄 Starting delayed recipe nutrition calculation');
        try {
            console.log('🔍 Checking for existing recipe nutrition...');
            // Check if recipe nutrition already exists for this recipe
            const existing = await req.payload.find({
                collection: 'recipe-nutritions',
                where: { recipeSlug: { equals: doc.slug } },
                limit: 1,
            });
            console.log('📊 Existing recipe nutrition found:', existing.docs.length);

            // Check if this is a first version edit (recipe was never published before)
            // We can determine this by checking if the recipe has a publishedAt date
            // and if it's the first time we're seeing this recipe being published
            const isFirstTimePublishing = doc.publishedAt && existing.docs.length === 0;
            const isEditingPublishedRecipe = doc.publishedAt && existing.docs.length > 0;

            if (existing.docs.length > 0 && !isEditingPublishedRecipe) {
                console.log('❌ Skipping - recipe nutrition already exists and this is not an edit of a published recipe');
                return;
            }

            if (isFirstTimePublishing) {
                console.log('🆕 First time publishing recipe, creating nutrition record...');
            } else if (isEditingPublishedRecipe) {
                console.log('🔄 Editing published recipe, updating nutrition record...');
            }

            // Recalculate nutrition (same logic for both create and update)
            if (!doc.ingredients || doc.ingredients.length === 0) {
                console.log('⚠️ No ingredients found in recipe, skipping calculation');
                return;
            }

            // Calculate total recipe weight
            const totalWeight = await calculateTotalRecipeWeight(doc.ingredients, req);
            console.log('⚖️ Total recipe weight:', totalWeight, 'g');

            if (totalWeight <= 0) {
                console.log('⚠️ Invalid total weight, skipping calculation');
                return;
            }

            // Initialize total nutrition
            const totalNutrition: Record<string, number> = {
                calories: 0,
                protein: 0,
                fat: 0,
                saturatedFat: 0,
                transFat: 0,
                polyunsaturatedFat: 0,
                monounsaturatedFat: 0,
                cholesterol: 0,
                carbohydrates: 0,
                fiber: 0,
                sugars: 0,
                addedSugars: 0,
                sodium: 0,
                potassium: 0,
                calcium: 0,
                iron: 0,
                vitaminA: 0,
                vitaminC: 0,
                vitaminD: 0,
                vitaminE: 0,
                vitaminK: 0,
                magnesium: 0,
                zinc: 0,
                phosphorus: 0,
                folate: 0,
                niacin: 0,
                riboflavin: 0,
                thiamin: 0,
                vitaminB6: 0,
                vitaminB12: 0,
                biotin: 0,
                pantothenicAcid: 0,
                selenium: 0,
                copper: 0,
                manganese: 0,
                chromium: 0,
                molybdenum: 0,
                iodine: 0,
                chloride: 0,
            };

            let processedIngredients = 0;
            let skippedIngredients = 0;

            // Process each ingredient
            for (const recipeIngredient of doc.ingredients) {
                if (!recipeIngredient.ingredient) {
                    console.log('⚠️ Skipping ingredient without ID');
                    skippedIngredients++;
                    continue;
                }

                try {
                    // Get ingredient nutritional values
                    const ingredientNutrition = await req.payload.find({
                        collection: 'ingredient-nutritions',
                        where: { ingredient: { equals: recipeIngredient.ingredient } },
                        limit: 1,
                    });

                    if (ingredientNutrition.docs.length === 0) {
                        console.log(`⚠️ No nutritional data found for ingredient ID: ${recipeIngredient.ingredient}`);
                        skippedIngredients++;
                        continue;
                    }

                    const nutrition = ingredientNutrition.docs[0];
                    const amount = parseFloat(recipeIngredient.amount || '0') || 0;
                    const unit = (recipeIngredient.unit as string) || 'g';
                    const weightInGrams = await convertToGrams(amount, unit, String(recipeIngredient.ingredient), req);

                    console.log(`📊 Processing ingredient: ${amount}${unit} (${weightInGrams}g)`);

                    // Add nutrition values proportionally using the EuroFIR formula
                    for (const [key, value] of Object.entries(nutrition)) {
                        if (typeof value === 'number' && key in totalNutrition) {
                            // Apply the formula: (Nutrient per 100g × Weight in grams) / 100
                            const nutritionPer100g = value;
                            const contribution = (nutritionPer100g / 100) * weightInGrams;

                            // Validate the contribution is a valid number
                            if (!isNaN(contribution) && isFinite(contribution)) {
                                totalNutrition[key] += contribution;
                            } else {
                                console.warn(`⚠️ Invalid nutrition contribution for ${key}: ${contribution}`);
                            }
                        }
                    }

                    processedIngredients++;

                } catch (error) {
                    console.error(`❌ Error processing ingredient ${recipeIngredient.ingredient || 'unknown'}:`, error);
                    skippedIngredients++;
                }
            }

            console.log(`📊 Nutrition calculation complete: ${processedIngredients} ingredients processed, ${skippedIngredients} skipped`);
            console.log('📊 Total nutrition calculated:', totalNutrition);

            // Calculate nutrition per 100g of recipe using EuroFIR formula
            const nutritionPer100g = calculateNutritionPer100g(totalNutrition, totalWeight);
            console.log('📊 Nutrition per 100g:', nutritionPer100g);

            // Validate and log the calculation results
            validateAndLogNutritionCalculation(totalNutrition, nutritionPer100g, totalWeight, processedIngredients);

            if (isFirstTimePublishing) {
                console.log('💾 Creating recipe nutrition record...');
                console.log('🔗 Recipe ID:', doc.id);
                console.log('🔗 Recipe slug:', doc.slug);

                // Create the recipe nutrition record
                const recipeNutritionData = {
                    recipeSlug: typeof doc.slug === 'string' ? doc.slug : '',
                    recipeName: doc.name,
                    recipeSlugEn: typeof doc.slug === 'string' ? doc.slug : '',
                    calories: nutritionPer100g.calories,
                    protein: nutritionPer100g.protein,
                    fat: nutritionPer100g.fat,
                    carbohydrates: nutritionPer100g.carbohydrates,
                    saturatedFat: nutritionPer100g.saturatedFat,
                    transFat: nutritionPer100g.transFat,
                    polyunsaturatedFat: nutritionPer100g.polyunsaturatedFat,
                    monounsaturatedFat: nutritionPer100g.monounsaturatedFat,
                    cholesterol: nutritionPer100g.cholesterol,
                    fiber: nutritionPer100g.fiber,
                    sugars: nutritionPer100g.sugars,
                    addedSugars: nutritionPer100g.addedSugars,
                    sodium: nutritionPer100g.sodium,
                    potassium: nutritionPer100g.potassium,
                    calcium: nutritionPer100g.calcium,
                    iron: nutritionPer100g.iron,
                    vitaminA: nutritionPer100g.vitaminA,
                    vitaminC: nutritionPer100g.vitaminC,
                    vitaminD: nutritionPer100g.vitaminD,
                    vitaminE: nutritionPer100g.vitaminE,
                    vitaminK: nutritionPer100g.vitaminK,
                    magnesium: nutritionPer100g.magnesium,
                    zinc: nutritionPer100g.zinc,
                    phosphorus: nutritionPer100g.phosphorus,
                    folate: nutritionPer100g.folate,
                    niacin: nutritionPer100g.niacin,
                    riboflavin: nutritionPer100g.riboflavin,
                    thiamin: nutritionPer100g.thiamin,
                    vitaminB6: nutritionPer100g.vitaminB6,
                    vitaminB12: nutritionPer100g.vitaminB12,
                    biotin: nutritionPer100g.biotin,
                    pantothenicAcid: nutritionPer100g.pantothenicAcid,
                    selenium: nutritionPer100g.selenium,
                    copper: nutritionPer100g.copper,
                    manganese: nutritionPer100g.manganese,
                    chromium: nutritionPer100g.chromium,
                    molybdenum: nutritionPer100g.molybdenum,
                    iodine: nutritionPer100g.iodine,
                    chloride: nutritionPer100g.chloride,
                };

                const createdRecipeNutrition = await req.payload.create({
                    collection: 'recipe-nutritions',
                    data: recipeNutritionData,
                });

                console.log('✅ Recipe nutrition created successfully:', createdRecipeNutrition.id);
                req.payload.logger.info(`Recipe nutrition calculated for recipe: ${doc.name} (ID: ${doc.id})`);
            } else if (isEditingPublishedRecipe) {
                console.log('💾 Updating recipe nutrition record...');
                console.log('🔗 Recipe ID:', doc.id);
                console.log('🔗 Recipe slug:', doc.slug);

                const existingNutrition = existing.docs[0];

                // Update the existing recipe nutrition record
                const updatedRecipeNutritionData: Partial<RecipeNutrition> = {
                    recipeName: doc.name,
                    recipeSlugEn: typeof doc.slug === 'string' ? doc.slug : '',
                    calories: nutritionPer100g.calories,
                    protein: nutritionPer100g.protein,
                    fat: nutritionPer100g.fat,
                    carbohydrates: nutritionPer100g.carbohydrates,
                    saturatedFat: nutritionPer100g.saturatedFat,
                    transFat: nutritionPer100g.transFat,
                    polyunsaturatedFat: nutritionPer100g.polyunsaturatedFat,
                    monounsaturatedFat: nutritionPer100g.monounsaturatedFat,
                    cholesterol: nutritionPer100g.cholesterol,
                    fiber: nutritionPer100g.fiber,
                    sugars: nutritionPer100g.sugars,
                    addedSugars: nutritionPer100g.addedSugars,
                    sodium: nutritionPer100g.sodium,
                    potassium: nutritionPer100g.potassium,
                    calcium: nutritionPer100g.calcium,
                    iron: nutritionPer100g.iron,
                    vitaminA: nutritionPer100g.vitaminA,
                    vitaminC: nutritionPer100g.vitaminC,
                    vitaminD: nutritionPer100g.vitaminD,
                    vitaminE: nutritionPer100g.vitaminE,
                    vitaminK: nutritionPer100g.vitaminK,
                    magnesium: nutritionPer100g.magnesium,
                    zinc: nutritionPer100g.zinc,
                    phosphorus: nutritionPer100g.phosphorus,
                    folate: nutritionPer100g.folate,
                    niacin: nutritionPer100g.niacin,
                    riboflavin: nutritionPer100g.riboflavin,
                    thiamin: nutritionPer100g.thiamin,
                    vitaminB6: nutritionPer100g.vitaminB6,
                    vitaminB12: nutritionPer100g.vitaminB12,
                    biotin: nutritionPer100g.biotin,
                    pantothenicAcid: nutritionPer100g.pantothenicAcid,
                    selenium: nutritionPer100g.selenium,
                    copper: nutritionPer100g.copper,
                    manganese: nutritionPer100g.manganese,
                    chromium: nutritionPer100g.chromium,
                    molybdenum: nutritionPer100g.molybdenum,
                    iodine: nutritionPer100g.iodine,
                    chloride: nutritionPer100g.chloride,
                };

                const updatedRecipeNutrition = await req.payload.update({
                    collection: 'recipe-nutritions',
                    id: existingNutrition.id,
                    data: updatedRecipeNutritionData,
                });

                console.log('✅ Recipe nutrition updated successfully:', updatedRecipeNutrition.id);
                req.payload.logger.info(`Recipe nutrition updated for recipe: ${doc.name} (ID: ${doc.id})`);
            }
        } catch (error) {
            console.error('❌ Error in triggerRecipeCalculator:', error);
            req.payload.logger.error(`Error in triggerRecipeCalculator: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, 5000); // 5 second delay to ensure transaction is committed

    console.log('🏁 Hook execution completed, returning document');
    return doc;
};
