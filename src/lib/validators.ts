/**
 * Validates if a string is a valid URL
 * @param value - The value to validate
 * @returns true if valid, error message if invalid
 */
export const validateUrl = (value: unknown): true | string => {
  if (!value) return true

  try {
    new URL(value as string)
    return true
  } catch {
    return 'Please enter a valid URL'
  }
}

/**
 * Validates if a string is a valid YouTube URL
 * Supports both youtube.com/watch and youtu.be formats
 * @param value - The value to validate
 * @returns true if valid, error message if invalid
 */
export const validateYouTubeUrl = (value: unknown): true | string => {
  if (!value || typeof value !== 'string') {
    return 'Please provide a valid YouTube URL'
  }

  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=[\w-]{11}|youtu\.be\/[\w-]{11})(([&?].*)?)$/i

  return pattern.test(value) || 'Please provide a valid YouTube URL'
}
