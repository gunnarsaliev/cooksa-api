import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { nutritionFields } from '@/fields/nutritionFields'
import { triggerDeleteIngredientNutritions } from './hooks/triggerDeleteIngredientNutritions'

export const IngredientNutritions: CollectionConfig = {
    slug: 'ingredient-nutritions',
    access: {
        create: authenticated,
        delete: authenticated,
        read: anyone,
        update: authenticated,
    },
    admin: {
        useAsTitle: 'ingredientSlugEn',
        group: 'Recipe System',
        defaultColumns: ['ingredientSlugEn', 'dataSource', 'calories', 'protein', 'carbohydrates', '_status', 'updatedAt'],
    },
    fields: [
        {
            name: 'ingredient',
            type: 'relationship',
            relationTo: 'ingredients',
            required: true,
            label: 'Ingredient',
        },
        {
            name: 'ingredientSlugEn',
            type: 'text',
            label: 'Ingredient English Slug',
            admin: { readOnly: true },
        },
        {
            name: 'dataSource',
            type: 'select',
            label: 'Data Source',
            required: true,
            options: [
                { label: 'USDA FoodData Central', value: 'usda' },
                { label: 'OpenAI', value: 'openai' },
            ],
            defaultValue: 'openai',
            admin: {
                position: 'sidebar',
                description: 'Source of the nutritional data',
            },
        },
        {
            name: 'usdaFdcId',
            type: 'number',
            label: 'USDA FDC ID',
            admin: {
                position: 'sidebar',
                description: 'FoodData Central ID (if data source is USDA)',
                readOnly: true,
            },
        },
        ...nutritionFields,
        {
            name: 'smallPieceWeight',
            type: 'number',
            label: 'Small Piece Weight (g)',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'mediumPieceWeight',
            type: 'number',
            label: 'Medium Piece Weight (g)',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'largePieceWeight',
            type: 'number',
            label: 'Large Piece Weight (g)',
            admin: {
                position: 'sidebar',
            },
        },
    ],
    hooks: {
        beforeChange: [triggerDeleteIngredientNutritions],
    },
    versions: {
        drafts: {
            autosave: {
                interval: 100,
            },
            schedulePublish: true,
            validate: false, // Don't validate drafts
        },
        maxPerDoc: 50,
    },
}

export default IngredientNutritions