import type { Access } from 'payload'

/**
 * Authenticated users can read everything
 * Public users can only read published content
 */
export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) return true

  return {
    _status: {
      equals: 'published',
    },
  }
}
