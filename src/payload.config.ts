import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Countries } from './collections/Countries'
import { IngredientFAQ } from './collections/IngredientFAQ'
import { IngredientTags } from './collections/IngredientTags'
import { Ingredients } from './collections/Ingredients'
import { RecipeTags } from './collections/RecipeTags'
import { Recipes } from './collections/Recipes'
import { IngredientNutritions } from './collections/IngredientNutritions'
import { RecipeNutritions } from './collections/RecipeNutritions'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const r2Storage = s3Storage({
  collections: {
    media: {
      disableLocalStorage: true,
      prefix: 'media',
      generateFileURL: ({ filename, prefix }) =>
        `https://${process.env.R2_BUCKET}.${process.env.R2_ENDPOINT}/${prefix}/${filename}`,
    },
  },
  bucket: process.env.R2_BUCKET || '',
  config: {
    endpoint: `https://${process.env.R2_ENDPOINT}` || '',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    region: 'auto',
    forcePathStyle: true,
  },
})

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  localization: {
    locales: ['en', 'bg'],
    defaultLocale: 'en',
    fallback: true,
  },
  collections: [
    Users,
    Media,
    Countries,
    IngredientFAQ,
    IngredientTags,
    Ingredients,
    RecipeTags,
    Recipes,
    IngredientNutritions,
    RecipeNutritions,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [r2Storage],
})
