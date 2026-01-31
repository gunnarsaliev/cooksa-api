import { Ingredient } from '@/payload-types'
import { CollectionAfterChangeHook } from 'payload'
import { getQstashClient, QSTASH_ENDPOINTS } from '@/lib/qstash'

/**
 * Hook to trigger nutritional data generation when an ingredient is published
 * Uses Upstash QStash to process the nutrition data extraction asynchronously
 */
export const triggerGenerateIngredientNutritions: CollectionAfterChangeHook<Ingredient> = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  console.log('🚀 triggerGenerateIngredientNutritions hook started')
  console.log('📋 Operation:', operation)
  console.log('📄 Document ID:', doc.id)
  console.log('📄 Document name:', doc.name)
  console.log('📄 Current status:', doc._status)
  console.log('📄 Previous status:', previousDoc?._status)
  console.log('🌍 Locale:', req.locale)

  // Only trigger for English locale
  if (req.locale && req.locale !== 'all') {
    console.log(`⏭️  Skipping nutrition generation - not English locale (current: ${req.locale})`)
    return doc
  }

  // Only trigger on create or update operations
  if (operation !== 'create' && operation !== 'update') {
    console.log('❌ Skipping - not create or update operation')
    return doc
  }

  // Get the previous status from previousDoc
  const previousStatus = previousDoc?._status
  const currentStatus = doc._status

  console.log('📄 Previous status:', previousStatus, 'Current status:', currentStatus)

  // Only trigger if the ingredient transitioned to published
  if (currentStatus !== 'published' || previousStatus === 'published') {
    console.log('❌ Skipping - not newly published')
    return doc
  }

  console.log('✅ All conditions met, queueing nutritional data generation')

  try {
    // Get QStash client to publish message
    const qstash = getQstashClient()

    // Send message to QStash endpoint for nutrition processing
    await qstash.publishJSON({
      url: QSTASH_ENDPOINTS.NUTRITION,
      content: {
        ingredientId: doc.id,
      },
    })

    console.log(`✅ Queued nutrition data extraction for ingredient: ${doc.slug} (ID: ${doc.id})`)
  } catch (error) {
    console.error(`❌ Error queuing nutrition task for ingredient ${doc.slug}:`, error)
    // Don't throw - we don't want to fail the ingredient publish if nutrition queueing fails
  }

  return doc
}
