import type { FieldHook } from 'payload'
import slugify from 'slugify'

export const formatSlug = (val: string, locale: string = 'en'): string => {
  if (!val || typeof val !== 'string') {
    return ''
  }
  return slugify(val, { lower: true, strict: true, locale })
}

export const formatSlugHook =
  (fallback: string): FieldHook =>
  ({ data, operation, value }) => {
    if (typeof value === 'string') {
      return formatSlug(value)
    }

    if (operation === 'create' || !data?.slug) {
      const fallbackData = data?.[fallback] || data?.[fallback]

      if (fallbackData && typeof fallbackData === 'string') {
        return formatSlug(fallbackData)
      }
    }

    return value
  }
