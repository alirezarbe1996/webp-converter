import { ErrorCode } from '@/types/converter'

const MAX_DIMENSION = 16_383 // Safari canvas hard limit

// ─── WebP support probe ───────────────────────────────────────────────────────
let _webpSupported: boolean | null = null

async function isWebPSupported(): Promise<boolean> {
  if (_webpSupported !== null) return _webpSupported

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    canvas.toBlob(
        (blob) => {
          _webpSupported = blob !== null && blob.type === 'image/webp'
          resolve(_webpSupported)
        },
        'image/webp',
        0.5,
    )
  })
}

/**
 * Converts any browser-decodable image File into a WebP Blob.
 *
 * Three-tier conversion path chosen at runtime:
 *   1. OffscreenCanvas              — Chrome / Edge (off main thread)
 *   2. HTMLCanvasElement + WebP     — Safari 16+, Firefox
 *   3. @jsquash/webp WASM encoder   — Safari < 16, any browser failing tiers 1–2
 *
 * @param file    - Source image file (any supported MIME type)
 * @param quality - 1–100
 * @returns       - A WebP Blob
 * @throws        - An ErrorCode string on any failure
 */
export async function convertToWebP(file: File, quality: number): Promise<Blob> {
  const q = clampQuality(quality)

  // ── 1. Decode image ────────────────────────────────────────────────────────
  const objectUrl = URL.createObjectURL(file)
  let img: HTMLImageElement
  try {
    img = await loadImage(objectUrl)
  } catch {
    throw ErrorCode.CORRUPTED_FILE
  } finally {
    URL.revokeObjectURL(objectUrl)
  }

  // ── 2. Clamp dimensions ────────────────────────────────────────────────────
  let { naturalWidth: w, naturalHeight: h } = img
  if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h)
    w = Math.floor(w * ratio)
    h = Math.floor(h * ratio)
  }

  // ── 3a. OffscreenCanvas — Chrome / Edge ────────────────────────────────────
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      const canvas = new OffscreenCanvas(w, h)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h)
        const blob = await canvas.convertToBlob({ type: 'image/webp', quality: q })
        if (blob?.type === 'image/webp' && blob.size > 0) return blob
      }
    } catch {
      // fall through
    }
  }

  // ── 3b. HTMLCanvasElement — Safari 16+, Firefox ───────────────────────────
  const webpOk = await isWebPSupported()
  if (webpOk) {
    try {
      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h)
        const blob = await canvasToBlob(canvas, 'image/webp', q)
        if (blob?.type === 'image/webp' && blob.size > 0) return blob
      }
    } catch {
      // fall through
    }
  }

  // ── 3c. @jsquash/webp WASM — Safari < 16, universal fallback ──────────────
  try {
    const blob = await encodeWithJsquash(img, w, h, quality)
    if (blob && blob.size > 0) return blob
  } catch {
    // jSquash failed — surface a clear error
    throw ErrorCode.CONVERSION_FAILED
  }

  throw ErrorCode.CONVERSION_FAILED
}

// ─── jSquash WASM encoder ─────────────────────────────────────────────────────

async function encodeWithJsquash(
    img: HTMLImageElement,
    w: number,
    h: number,
    quality: number,
): Promise<Blob> {
  // Dynamic import — WASM module is only loaded when actually needed,
  // so users on Chrome/Safari 16+ pay zero cost for this code path.
  const { encode } = await import('@jsquash/webp')

  // Draw to a canvas to get ImageData — jSquash needs raw RGBA pixels
  const canvas = document.createElement('canvas')
  canvas.width  = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no context')
  ctx.drawImage(img, 0, 0, w, h)
  const imageData = ctx.getImageData(0, 0, w, h)

  // encode() returns a Uint8Array of the WebP binary
  const uint8 = await encode(imageData, { quality })
  return new Blob([uint8], { type: 'image/webp' })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
