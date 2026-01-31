import type { Access } from 'payload'

/**
 * Only authenticated users can perform this action
 */
export const authenticated: Access = ({ req: { user } }) => {
  return Boolean(user)
}
