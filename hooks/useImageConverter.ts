'use client'

import { useCallback, useRef, useState } from 'react'
import { convertToWebP } from '@/lib/convert'
import { validate } from '@/lib/validate'
import { calcSavingsPercent, makeDownloadName } from '@/lib/format'
import {
  ConversionResult,
  ConversionStatus,
  ErrorCode,
  ImageFile,
} from '@/types/converter'

interface UseImageConverterReturn {
  status: ConversionStatus
  result: ConversionResult | null
  error: ErrorCode | null
  /** Begin conversion. Validates first; sets state throughout. */
  convert: (file: File, quality: number) => Promise<void>
  /** Reset to idle, revoke object URLs, clear all state. */
  reset: () => void
}

export function useImageConverter(): UseImageConverterReturn {
  const [status, setStatus] = useState<ConversionStatus>('idle')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError]   = useState<ErrorCode | null>(null)

  // Track object URLs so we can revoke them on reset / unmount
  const blobUrlRef = useRef<string | null>(null)

  const convert = useCallback(async (file: File, quality: number) => {
    // ── Validate ──────────────────────────────────────────────────────────────
    const validation = validate(file)
    if (!validation.ok) {
      setError(validation.code)
      setStatus('error')
      return
    }

    // ── Reset any prior result ────────────────────────────────────────────────
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setResult(null)
    setError(null)
    setStatus('converting')

    // ── Convert ───────────────────────────────────────────────────────────────
    try {
      const blob    = await convertToWebP(file, quality)
      const blobUrl = URL.createObjectURL(blob)
      blobUrlRef.current = blobUrl

      const conversionResult: ConversionResult = {
        blob,
        blobUrl,
        filename: makeDownloadName(file.name),
        originalSize:   file.size,
        convertedSize:  blob.size,
        savingsPercent: calcSavingsPercent(file.size, blob.size),
      }

      setResult(conversionResult)
      setStatus('done')
    } catch (err) {
      const code =
        typeof err === 'string' && Object.values(ErrorCode).includes(err as ErrorCode)
          ? (err as ErrorCode)
          : ErrorCode.CONVERSION_FAILED

      setError(code)
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [])

  return { status, result, error, convert, reset }
}

/**
 * Separate hook for managing the ImageFile state (preview URL lifecycle).
 * Used by ConverterPage alongside useImageConverter.
 */
export function useImageFile() {
  const [imageFile, setImageFile] = useState<ImageFile | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  const setFile = useCallback((file: File) => {
    // Revoke the previous preview to avoid memory leaks
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    const previewUrl = URL.createObjectURL(file)
    previewUrlRef.current = previewUrl

    setImageFile({
      file,
      previewUrl,
      name:     file.name,
      size:     file.size,
      mimeType: file.type,
    })
  }, [])

  const clearFile = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setImageFile(null)
  }, [])

  return { imageFile, setFile, clearFile }
}
