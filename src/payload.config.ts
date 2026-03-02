import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { bg } from '@payloadcms/translations/languages/bg'
import { en } from '@payloadcms/translations/languages/en'
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
      // disablePayloadAccessControl is false by default
      // This keeps Payload's access control and serves files through API endpoint
      // URLs will be /api/media/static/filename instead of direct R2 URLs
      prefix: 'media',
    },
  },
  bucket: process.env.R2_BUCKET || '',
  config: {
    endpoint: process.env.R2_ENDPOINT
      ? process.env.R2_ENDPOINT.startsWith('http')
        ? process.env.R2_ENDPOINT
        : `https://${process.env.R2_ENDPOINT}`
      : '',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    region: 'auto',
    forcePathStyle: false,
  },
})

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    supportedLanguages: { en, bg },
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
    Ingredients,
    IngredientTags,
    IngredientNutritions,
    IngredientFAQ,
    Recipes,
    RecipeTags,
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
