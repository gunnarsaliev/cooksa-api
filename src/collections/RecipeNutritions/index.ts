import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { nutritionFields } from '@/fields/nutritionFields'
import { beforeChangeHook } from './hooks/beforeChange'
import { roundingNutritionValuesHook } from './hooks/afterRead'



export const RecipeNutritions: CollectionConfig = {
    slug: 'recipe-nutritions',
    access: {
        create: authenticated,
        delete: authenticated,
        read: anyone,
        update: authenticated,
    },
    admin: {
        useAsTitle: 'recipeSlug',
        group: 'Recipe System',
        defaultColumns: ['recipeSlug', 'calories', 'protein', 'carbohydrates', '_status', 'updatedAt'],
    },
    fields: [
        {
            name: 'recipeSlug',
            type: 'text',
            required: true,
            label: 'Recipe Slug',
        },
        {
            name: 'recipeName',
            type: 'text',
            label: 'Recipe Name',
            admin: { readOnly: true },
        },
        {
            name: 'recipeSlugEn',
            type: 'text',
            label: 'Recipe English Slug',
            admin: { readOnly: true },
        },
        ...nutritionFields,
        {
            name: 'lastCalculated',
            type: 'date',
            label: 'Last Calculated',
            admin: { readOnly: true },
        },
    ],
    hooks: {
        beforeChange: [beforeChangeHook],
        afterRead: [roundingNutritionValuesHook],
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

export default RecipeNutritions
