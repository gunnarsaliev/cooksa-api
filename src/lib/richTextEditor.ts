import { lexicalEditor, UploadFeature } from '@payloadcms/richtext-lexical'

/**
 * Basic rich text editor with upload support
 * Used for standard content fields like descriptions and FAQs
 */
export const basicRichTextEditor = lexicalEditor({
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
