// ─── Error Codes ────────────────────────────────────────────────────────────

export enum ErrorCode {
  UNSUPPORTED_TYPE = 'UNSUPPORTED_TYPE',
  FILE_TOO_LARGE   = 'FILE_TOO_LARGE',
  CORRUPTED_FILE   = 'CORRUPTED_FILE',
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  CANVAS_UNAVAILABLE = 'CANVAS_UNAVAILABLE',
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNSUPPORTED_TYPE]:
    'That file type isn\'t supported. Please upload a JPG, PNG, GIF, BMP, TIFF, WEBP, or AVIF image.',
  [ErrorCode.FILE_TOO_LARGE]:
    'File exceeds the 25 MB limit. Try compressing it first or choose a smaller image.',
  [ErrorCode.CORRUPTED_FILE]:
    'The file couldn\'t be read. It may be corrupted or incomplete.',
  [ErrorCode.CONVERSION_FAILED]:
    'Conversion failed. This can happen with very complex images — try a different file.',
  [ErrorCode.CANVAS_UNAVAILABLE]:
    'Your browser doesn\'t support canvas-based conversion. Try Chrome, Edge, or Firefox.',
}

// ─── Status ─────────────────────────────────────────────────────────────────

export type ConversionStatus = 'idle' | 'converting' | 'done' | 'error'

// ─── Domain Models ──────────────────────────────────────────────────────────

/** The raw file the user selected, plus a preview URL we create for it. */
export interface ImageFile {
  file: File
  previewUrl: string   // object URL — caller must revoke on cleanup
  name: string
  size: number         // bytes
  mimeType: string
}

/** The output of a successful conversion. */
export interface ConversionResult {
  blob: Blob
  blobUrl: string      // object URL — caller must revoke on cleanup
  filename: string     // e.g. "photo.webp"
  originalSize: number // bytes
  convertedSize: number // bytes
  savingsPercent: number // 0–100, rounded to one decimal
}

/** Discriminated union returned by lib/validate.ts */
export type ValidationResult =
  | { ok: true;  file: File }
  | { ok: false; code: ErrorCode }

// ─── App State ───────────────────────────────────────────────────────────────

export interface AppState {
  imageFile: ImageFile | null
  quality: number              // 1–100
  status: ConversionStatus
  result: ConversionResult | null
  error: ErrorCode | null
}

export const INITIAL_STATE: AppState = {
  imageFile: null,
  quality: 95,
  status: 'idle',
  result: null,
  error: null,
}
