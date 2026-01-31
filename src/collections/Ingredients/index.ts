import type { CollectionConfig } from 'payload'
import { basicRichTextEditor } from '@/lib/richTextEditor'
import { validateUrl } from '@/lib/validators'
import { slugField } from '@/fields/slug'
import { triggerTranslateIngredient } from './hooks/triggerTranslateIngredient'
import { triggerGenerateIngredientNutritions } from './hooks/triggerGenerateIngredientNutritions'

export const Ingredients: CollectionConfig = {
  slug: 'ingredients',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt', '_status'],
  },
  access: {
    // Public can read published ingredients
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
    // Only authenticated users can create/update/delete
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
      validate: false, // Don't validate drafts
    },
    maxPerDoc: 50,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      localized: true,
    },
    slugField('name'),
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
    {
      name: 'longDescription',
      type: 'richText',
      editor: basicRichTextEditor,
      localized: true,
    },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Upload multiple images for the gallery',
      },
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'ingredient-tags',
      hasMany: true,
      admin: {
        appearance: 'select',
        isSortable: true,
      },
    },
    {
      name: 'faq',
      type: 'array',
      admin: {
        description: 'Frequently Asked Questions about this ingredient',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'answer',
          type: 'richText',
          required: true,
          editor: basicRichTextEditor,
          localized: true,
        },
      ],
    },
    {
      name: 'videoUrls',
      type: 'array',
      admin: {
        position: 'sidebar',
        description: 'Enter the URL of the video',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
          validate: validateUrl,
        },
        {
          name: 'title',
          type: 'text',
        },
      ],
    },
    {
      name: 'publishedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ value, data, req, operation }) => {
            // Auto-populate publishedBy when status changes to published
            if (
              req?.user &&
              data?._status === 'published' &&
              (operation === 'create' || operation === 'update')
            ) {
              return req.user.id
            }
            return value
          },
        ],
      },
    },
  ],
  hooks: {
    afterChange: [triggerTranslateIngredient, triggerGenerateIngredientNutritions],
  },
  timestamps: true,
}
