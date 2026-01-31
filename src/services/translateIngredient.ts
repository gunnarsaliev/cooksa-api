import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import type { Ingredient } from '@/payload-types'
import type { Payload } from 'payload'

// Types for Lexical rich text structure
interface LexicalTextNode {
  type: 'text'
  text: string
  [key: string]: unknown
}

interface LexicalNode {
  type: string
  children?: LexicalNode[]
  [key: string]: unknown
}

interface LexicalRoot {
  root: {
    children: LexicalNode[]
    [key: string]: unknown
  }
}

/**
 * Translates a simple text field
 */
export async function translateText(
  text: string,
  openaiApiKey: string,
  targetLanguage: string = 'Bulgarian',
): Promise<string> {
  if (!text || text.trim() === '') {
    return text
  }

  const openai = createOpenAI({
    apiKey: openaiApiKey,
  })

  const { text: translatedText } = await generateText({
    model: openai('gpt-4o-mini'),
    temperature: 0.3,
    prompt: `Translate the following text to ${targetLanguage}. Only return the translation, nothing else:

${text}`,
  })

  return translatedText.trim()
}

/**
 * Recursively translates text nodes in a Lexical JSON structure
 */
async function translateLexicalNode(
  node: LexicalNode,
  openaiApiKey: string,
  targetLanguage: string,
): Promise<LexicalNode> {
  // If this is a text node, translate it
  if (node.type === 'text' && 'text' in node) {
    const textNode = node as LexicalTextNode
    const translatedText = await translateText(textNode.text, openaiApiKey, targetLanguage)
    return {
      ...node,
      text: translatedText,
    }
  }

  // If the node has children, recursively translate them
  if (node.children && Array.isArray(node.children)) {
    const translatedChildren = await Promise.all(
      node.children.map((child) => translateLexicalNode(child, openaiApiKey, targetLanguage)),
    )
    return {
      ...node,
      children: translatedChildren,
    }
  }

  // Return the node unchanged if it's not a text node and has no children
  return node
}

/**
 * Translates a Lexical rich text field
 */
export async function translateRichText(
  richText: any,
  openaiApiKey: string,
  targetLanguage: string = 'Bulgarian',
): Promise<any> {
  if (!richText || typeof richText !== 'object') {
    return richText
  }

  const lexicalContent = richText as LexicalRoot

  if (!lexicalContent.root || !Array.isArray(lexicalContent.root.children)) {
    return richText
  }

  const translatedChildren = await Promise.all(
    lexicalContent.root.children.map((child) =>
      translateLexicalNode(child, openaiApiKey, targetLanguage),
    ),
  )

  return {
    ...lexicalContent,
    root: {
      ...lexicalContent.root,
      children: translatedChildren,
    },
  }
}

/**
 * Translates an array of FAQ items
 */
export async function translateFaqArray(
  faqArray: Array<{ question: string; answer: any; id?: string }> | undefined,
  openaiApiKey: string,
  targetLanguage: string = 'Bulgarian',
): Promise<Array<{ question: string; answer: any; id?: string }>> {
  if (!faqArray || !Array.isArray(faqArray) || faqArray.length === 0) {
    return []
  }

  const translatedFaqs = await Promise.all(
    faqArray.map(async (faq) => {
      const translatedQuestion = await translateText(faq.question, openaiApiKey, targetLanguage)
      const translatedAnswer = await translateRichText(faq.answer, openaiApiKey, targetLanguage)

      return {
        ...faq,
        question: translatedQuestion,
        answer: translatedAnswer,
      }
    }),
  )

  return translatedFaqs
}

/**
 * Main function to translate an ingredient to Bulgarian
 */
export async function translateIngredient(
  ingredientId: number | string,
  payload: Payload,
  openaiApiKey: string,
): Promise<void> {
  console.log(`🌍 Starting translation for ingredient ID: ${ingredientId}`)

  try {
    // Fetch the ingredient in English locale
    const ingredient = await payload.findByID({
      collection: 'ingredients',
      id: ingredientId,
      locale: 'all',
    })

    if (!ingredient) {
      throw new Error(`Ingredient with ID ${ingredientId} not found`)
    }

    console.log(`📝 Translating ingredient: ${ingredient.name}`)

    // Translate all localized fields
    const translatedName = await translateText(ingredient.name, openaiApiKey)
    console.log(`✅ Translated name: ${ingredient.name} → ${translatedName}`)

    const translatedLongDescription = ingredient.longDescription
      ? await translateRichText(ingredient.longDescription, openaiApiKey)
      : undefined
    if (translatedLongDescription) {
      console.log(`✅ Translated long description`)
    }

    const translatedFaq = ingredient.faq
      ? await translateFaqArray(
          ingredient.faq as Array<{ question: string; answer: any; id?: string }>,
          openaiApiKey,
        )
      : undefined
    if (translatedFaq && translatedFaq.length > 0) {
      console.log(`✅ Translated ${translatedFaq.length} FAQ items`)
    }

    // Update the ingredient with Bulgarian translations
    await payload.update({
      collection: 'ingredients',
      id: ingredientId,
      locale: undefined, // Let Payload handle the locale
      data: {
        name: translatedName,
        longDescription: translatedLongDescription,
        faq: translatedFaq,
      },
    })

    console.log(`✅ Successfully translated and updated ingredient: ${ingredient.name}`)
  } catch (error) {
    console.error(`❌ Error translating ingredient ${ingredientId}:`, error)
    throw error
  }
}
