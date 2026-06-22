import { ErrorCode } from '@/types/converter'

const MAX_DIMENSION = 16_383 // Safari canvas limit

/**
 * Converts any browser-decodable image File into a WebP Blob.
 *
 * Steps:
 *  1. Read the file as an Object URL
 *  2. Decode into an HTMLImageElement
 *  3. Draw to a canvas (OffscreenCanvas where available, else HTMLCanvasElement)
 *  4. Export as image/webp at the requested quality
 *
 * @param file    - The source image file (any supported MIME type)
 * @param quality - 1–100; mapped to 0.01–1.00 for the canvas API
 * @returns       - A WebP Blob
 * @throws        - An ErrorCode string on any failure
 */
export async function convertToWebP(file: File, quality: number): Promise<Blob> {
  // ── 1. Decode ──────────────────────────────────────────────────────────────
  const objectUrl = URL.createObjectURL(file)

  let img: HTMLImageElement
  try {
    img = await loadImage(objectUrl)
  } catch {
    URL.revokeObjectURL(objectUrl)
    throw ErrorCode.CORRUPTED_FILE
  } finally {
    // revoke once the image element has the data in memory
    URL.revokeObjectURL(objectUrl)
  }

  // ── 2. Clamp dimensions (browser canvas limits) ────────────────────────────
  let { naturalWidth: w, naturalHeight: h } = img

  if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h)
    w = Math.floor(w * ratio)
    h = Math.floor(h * ratio)
  }

  // ── 3. Draw to canvas ──────────────────────────────────────────────────────
  const q = clampQuality(quality)

  let blob: Blob | null = null

  // Prefer OffscreenCanvas (runs off-main-thread where supported)
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(w, h)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw ErrorCode.CANVAS_UNAVAILABLE
    ctx.drawImage(img, 0, 0, w, h)
    blob = await canvas.convertToBlob({ type: 'image/webp', quality: q })
  } else {
    // HTMLCanvasElement fallback (Safari, older browsers)
    const canvas = document.createElement('canvas')
    canvas.width  = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw ErrorCode.CANVAS_UNAVAILABLE
    ctx.drawImage(img, 0, 0, w, h)
    blob = await canvasToBlob(canvas, 'image/webp', q)
  }

  if (!blob || blob.size === 0) throw ErrorCode.CONVERSION_FAILED

  // ── 4. Verify the browser actually produced WebP (not a PNG fallback) ──────
  if (blob.type !== 'image/webp') {
    // Some older Safari builds silently fall back to PNG
    throw ErrorCode.CANVAS_UNAVAILABLE
  }

  return blob
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = () => reject(new Error('Image failed to load'))
    img.crossOrigin = 'anonymous'
    img.src = src
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

function clampQuality(q: number): number {
  return Math.max(0.01, Math.min(1, q / 100))
}
