import type { Access } from 'payload'

/**
 * Anyone can perform this action (public access)
 */
export const anyone: Access = () => {
  return true
}
