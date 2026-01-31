import { Recipe } from '@/payload-types'
import { CollectionAfterChangeHook } from 'payload'
import { getQstashClient, QSTASH_ENDPOINTS } from '@/lib/qstash'

export const triggerTranslateRecipe: CollectionAfterChangeHook<Recipe> = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  // Only trigger task for published recipes in English locale
  if (doc._status !== 'published') {
    return doc
  }
  if (req.locale && req.locale !== 'all') {
    console.log(`⏭️  Skipping translation - not English locale (current: ${req.locale})`)
    return doc
  }
  if (operation !== 'create' && operation !== 'update') {
    return doc
  }

  // Queue translation only on publish transition:
  // - create where status is published
  // - update where previous status was not published and current is published
  if (operation === 'update' && previousDoc && previousDoc._status === 'published') {
    return doc
  }

  try {
    // Get QStash client to publish message
    const qstash = getQstashClient()

    // Send message to QStash endpoint for translation processing
    await qstash.publishJSON({
      url: QSTASH_ENDPOINTS.TRANSLATION,
      content: {
        recipeId: doc.id,
        type: 'recipe',
      },
    })

    console.log(`✅ Queued translation task for recipe: ${doc.name} (ID: ${doc.id})`)
  } catch (error) {
    console.error(`❌ Error queuing translation task for recipe ${doc.name || doc.id}:`, error)
    // Don't throw - we don't want to fail the recipe publish if translation queueing fails
  }

  return doc
}
