import type { CollectionConfig, CollectionSlug } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { slugField } from '@/fields/slug'
import { validateYouTubeUrl } from '@/lib/validators'

import { triggerGenerateRecipeNitritions } from './hooks/triggerGenerateRecipeNitritions'
import { handlePublishedDate } from './hooks/handlePublishedDate'
import { cleanupRecipeNutritionOnDelete } from './hooks/cleanupRecipeNutritionOnDelete'
import { cleanupRecipeNutritionOnUnpublish } from './hooks/cleanupRecipeNutritionOnUnpublish'
import { triggerTranslateRecipe } from './hooks/triggerTranslateRecipe'

export const Recipes: CollectionConfig = {
  slug: 'recipes',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    tags: true,
    meta: {
      image: true,
      description: true,
    },
  },
  labels: {
    singular: 'Recipe',
    plural: 'Recipes',
  },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Recipe System',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'media',
      label: 'Media',
      type: 'group',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'youtubeUrls',
          type: 'array',
          label: 'YouTube Video URLs',
          admin: {
            description: 'Add one or more YouTube URLs (watch or youtu.be). Optional.',
          },
          required: false,
          fields: [
            {
              name: 'url',
              type: 'text',
              required: true,
              validate: validateYouTubeUrl,
            },
          ],
        },
        {
          name: 'images',
          type: 'upload',
          relationTo: 'media' satisfies CollectionSlug,
          label: 'Images',
          required: false,
          hasMany: true,
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'description',
              type: 'richText',
              localized: true,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
            },
            {
              name: 'ingredients',
              label: 'Ingredients',
              type: 'array',
              required: true,
              minRows: 2,
              fields: [
                {
                  name: 'amount',
                  type: 'text',
                  label: 'Amount',
                  required: false,
                },
                {
                  name: 'unit',
                  type: 'select',
                  label: 'Unit',
                  required: false,
                  defaultValue: 'g',
                  options: [
                    { label: 'Gram', value: 'g' },
                    { label: 'Kilogram', value: 'kg' },
                    { label: 'Milliliter', value: 'ml' },
                    { label: 'Liter', value: 'l' },
                    { label: 'Teaspoon', value: 'tsp' },
                    { label: 'Tablespoon', value: 'tbsp' },
                    { label: 'Cup', value: 'cup' },
                    { label: 'Small Piece', value: 'smallPiece' },
                    { label: 'Medium Piece', value: 'mediumPiece' },
                    { label: 'Large Piece', value: 'largePiece' },
                  ],
                },
                {
                  name: 'ingredient',
                  type: 'relationship',
                  relationTo: 'ingredients',
                  localized: true,
                  required: true,
                  label: 'Ingredient',
                },
              ],
            },
            {
              name: 'directions',
              label: 'Directions',
              type: 'array',
              required: true,
              fields: [
                {
                  name: 'direction',
                  type: 'text',
                  localized: true,
                  label: 'Direction',
                },
              ],
            },
          ],
        },
        {
          label: 'Meta',
          fields: [
            {
              name: 'relatedRecipes',
              type: 'relationship',
              relationTo: 'recipes',
              hasMany: true,
            },
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [handlePublishedDate],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    slugField('name', { collection: 'recipes' }),
    {
      name: 'tags',
      label: 'Tags',
      type: 'relationship',
      relationTo: 'recipe-tags',
      hasMany: true,
      required: false,
      admin: {
        position: 'sidebar',
        appearance: 'select',
        isSortable: true,
      },
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 100, // Optimal live preview
      },
      schedulePublish: true,
      validate: false, // Don't validate drafts
    },
    maxPerDoc: 50,
  },
  hooks: {
    beforeDelete: [cleanupRecipeNutritionOnDelete],
    afterChange: [triggerGenerateRecipeNitritions, triggerTranslateRecipe],
    beforeChange: [cleanupRecipeNutritionOnUnpublish],
  },
}

export default Recipes
