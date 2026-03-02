import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'System',
    defaultColumns: ['alt', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
      localized: true,
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        // height is omitted to preserve aspect ratio
        fit: 'inside',
        withoutEnlargement: true,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 80,
          },
        },
      },
      {
        name: 'card',
        width: 768,
        // height is omitted to preserve aspect ratio
        fit: 'inside',
        withoutEnlargement: true,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 80,
          },
        },
      },
      {
        name: 'large',
        width: 1920,
        // height is omitted to preserve aspect ratio
        fit: 'inside',
        withoutEnlargement: true,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 85,
          },
        },
      },
    ],
    // Removed top-level formatOptions to preserve original image format
  },
}
