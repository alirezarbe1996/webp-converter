import { ErrorCode, ValidationResult } from '@/types/converter'

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25 MB

/**
 * MIME types we accept.
 * The canvas API can decode all of these on every major browser.
 */
const ACCEPTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/webp',
  'image/avif',
])

/**
 * Human-readable label for the upload zone helper text.
 * Kept in sync with ACCEPTED_MIME_TYPES above.
 */
export const ACCEPTED_EXTENSIONS = 'JPG, JPEG, PNG, GIF, BMP, TIFF, WEBP, AVIF'

/**
 * The `accept` attribute value for <input type="file">.
 */
export const INPUT_ACCEPT = [...ACCEPTED_MIME_TYPES].join(',')

/**
 * Validates a File before we attempt conversion.
 *
 * Checks (in order):
 *  1. MIME type is in the accepted set
 *  2. File size is within the 25 MB cap
 *
 * @param file - The File object from the input or drop event
 * @returns    - { ok: true, file } or { ok: false, code: ErrorCode }
 */
export function validate(file: File): ValidationResult {
  // Normalise: browsers sometimes report 'image/jpg' instead of 'image/jpeg'
  const mime = file.type.toLowerCase()

  if (!ACCEPTED_MIME_TYPES.has(mime)) {
    return { ok: false, code: ErrorCode.UNSUPPORTED_TYPE }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, code: ErrorCode.FILE_TOO_LARGE }
  }

  return { ok: true, file }
}
