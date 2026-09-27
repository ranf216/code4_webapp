const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)$/i

/**
 * Resolve a File API file id (or raw URL) into a displayable URL.
 * Follows the existing convention: {apiUrl}/files/n/{file_id}[.png]
 */
export function fileUrl(value: string | null | undefined): string {
  if (!value) return ''
  if (/^https?:\/\//.test(value)) return value
  const fileName = IMAGE_EXT.test(value) ? value : `${value}.png`
  return `${useRuntimeConfig().public.apiUrl}/files/n/${fileName}`
}
