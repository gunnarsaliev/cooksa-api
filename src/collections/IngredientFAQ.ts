import type { CollectionConfig } from 'payload'
import { lexicalEditor, UploadFeature } from '@payloadcms/richtext-lexical'

// Shared lexical editor configuration
const richTextEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    UploadFeature({
      collections: {
        media: {
          fields: [
            {
              name: 'alt',
              type: 'text',
            },
          ],
        },
      },
    }),
  ],
})

export const IngredientFAQ: CollectionConfig = {
  slug: 'ingredient-faq',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'ingredient', 'updatedAt'],
  },
  access: {
    // Public can read all FAQ
    read: () => true,
    // Only authenticated users can create/update/delete
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'ingredient',
      type: 'relationship',
      relationTo: 'ingredients',
      required: true,
      hasMany: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
      editor: richTextEditor,
    },
    {
      name: 'order',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Order in which the Q&A appears (lower numbers first)',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
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
            // Auto-populate publishedBy when published
            if (req?.user && data?.isPublished && (operation === 'create' || operation === 'update')) {
              return req.user.id
            }
            return value
          },
        ],
      },
    },
  ],
  timestamps: true,
}
