import { slugField as payloadSlugField, Field } from 'payload'
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
  return payloadSlugField({
    useAsSlug,
    position: options?.position || 'sidebar',
    slugify: ({ valueToSlugify }) => {
      return formatSlug(valueToSlugify)
    },
    overrides: (field) => {
      // Find the actual slug text field (second field in the row)
      const slugTextField = field.fields[1]
      if (slugTextField && slugTextField.type === 'text') {
        slugTextField.unique = true
      }
      return field
    },
  })
}
