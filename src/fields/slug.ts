import { Field } from 'payload'
import { formatSlug } from '@/lib/formatSlug'

/**
 * Creates a slug field configuration with consistent formatting
 * @param useAsSlug - The field name to generate slug from
 * @param options - Additional configuration options
 */
export const slugField = (
  useAsSlug: string = 'name',
  options?: { collection?: string; position?: 'sidebar' },
): Field => {
  return {
    name: 'slug',
    type: 'text',
    admin: {
      position: options?.position || 'sidebar',
    },
    unique: true,
    index: true,
    hooks: {
      beforeValidate: [
        ({ data, siblingData }) => {
          const valueToSlugify = siblingData[useAsSlug] || data?.[useAsSlug]
          if (valueToSlugify) {
            return formatSlug(valueToSlugify)
          }
          return siblingData.slug || data?.slug
        },
      ],
    },
  }
}
