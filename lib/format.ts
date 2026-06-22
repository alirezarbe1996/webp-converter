/**
 * Formats a byte count into a human-readable string.
 * e.g. 1_048_576 → "1.0 MB"
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/**
 * Returns the percentage reduction from `original` to `converted`.
 * Capped at 0 so we never show a negative saving.
 * e.g. 1000, 600 → 40.0
 */
export function calcSavingsPercent(original: number, converted: number): number {
  if (original === 0) return 0
  const pct = ((original - converted) / original) * 100
  return Math.max(0, Math.round(pct * 10) / 10)
}

/**
 * Replaces the extension of the original filename with .webp.
 * e.g. "photo.png" → "photo.webp"
 *      "image.tar.gz" → "image.tar.webp"  (only the last extension)
 */
export function makeDownloadName(originalName: string): string {
  const dotIndex = originalName.lastIndexOf('.')
  const base = dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName
  return `${base}.webp`
}

/**
 * Returns the uppercased extension from a filename or MIME type.
 * e.g. "photo.jpeg" → "JPEG"
 *      "image/png"  → "PNG"
 */
export function getFormatLabel(nameOrMime: string): string {
  // MIME type
  if (nameOrMime.includes('/')) {
    return nameOrMime.split('/')[1].toUpperCase()
  }
  // Filename
  const dot = nameOrMime.lastIndexOf('.')
  if (dot !== -1) return nameOrMime.slice(dot + 1).toUpperCase()
  return nameOrMime.toUpperCase()
}
