import { Ingredient } from '@/payload-types'
import { CollectionAfterChangeHook } from 'payload'
import { getQstashClient, QSTASH_ENDPOINTS } from '@/lib/qstash'

export const triggerTranslateIngredient: CollectionAfterChangeHook<Ingredient> = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  // Only trigger task for published ingredients in English locale
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
  // Only on publish transition: create as published or update transitioning to published
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
        ingredientId: doc.id,
        type: 'ingredient',
      },
    })

    console.log(`✅ Queued translation task for ingredient: ${doc.slug} (ID: ${doc.id})`)
  } catch (error) {
    console.error(`❌ Error queuing translation task for ingredient ${doc.slug}:`, error)
    // Don't throw - we don't want to fail the ingredient publish if translation queueing fails
  }

  return doc
}
