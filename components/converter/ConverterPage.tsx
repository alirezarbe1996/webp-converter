'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useImageConverter, useImageFile } from '@/hooks/useImageConverter'
import { UploadZone }       from './UploadZone'
import { ImagePreview }     from './ImagePreview'
import { QualitySlider }    from './QualitySlider'
import { ConversionStats }  from './ConversionStats'
import { DownloadButton }   from './DownloadButton'
import { Spinner }          from '@/components/ui/Spinner'
import { ErrorMessage }     from '@/components/ui/ErrorMessage'
import { Card }             from '@/components/ui/Card'
import { INITIAL_STATE }    from '@/types/converter'

const DEBOUNCE_MS = 150

export function ConverterPage() {
  const [quality, setQuality] = useState<number>(INITIAL_STATE.quality)

  const { imageFile, setFile, clearFile }           = useImageFile()
  const { status, result, error, convert, reset }   = useImageConverter()

  // ── Debounced auto-reconvert when quality changes after a file is loaded ───
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerConvert = useCallback(
    (q: number) => {
      if (!imageFile) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        convert(imageFile.file, q)
      }, DEBOUNCE_MS)
    },
    [imageFile, convert],
  )

  // Auto-convert whenever a new file is selected
  useEffect(() => {
    if (imageFile) {
      convert(imageFile.file, quality)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFileSelected = useCallback(
    (file: File) => {
      reset()
      setFile(file)
    },
    [reset, setFile],
  )

  const handleQualityChange = useCallback(
    (q: number) => {
      setQuality(q)
      triggerConvert(q)
    },
    [triggerConvert],
  )

  const handleReset = useCallback(() => {
    reset()
    clearFile()
  }, [reset, clearFile])

  // ── Derived ───────────────────────────────────────────────────────────────
  const isConverting = status === 'converting'
  const isDone       = status === 'done'
  const isError      = status === 'error'
  const showControls = !!imageFile && !isError

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl space-y-4">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center space-y-1 pb-2"
        >
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            WebP Converter
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Convert and optimize images to WebP instantly — entirely in your browser.
          </p>
        </motion.header>

        {/* ── Main Card ───────────────────────────────────────────────────── */}
        <Card>

          {/* Upload Zone — always visible */}
          <UploadZone
            onFileSelected={handleFileSelected}
            hasFile={!!imageFile}
            fileName={imageFile?.name}
            fileSize={imageFile?.size}
            fileMime={imageFile?.mimeType}
            onReset={handleReset}
          />

          {/* Controls — appear once a file is loaded */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                key="controls"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-5 border-t border-slate-200/60 dark:border-slate-700/60 space-y-5">
                  <QualitySlider
                    value={quality}
                    onChange={handleQualityChange}
                    disabled={isConverting}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading state */}
          <AnimatePresence>
            {isConverting && (
              <motion.div
                key="spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-3 py-6 text-slate-500 dark:text-slate-400"
              >
                <Spinner size={20} />
                <span className="text-sm">Converting…</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error state */}
          <AnimatePresence>
            {isError && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="pt-4"
              >
                <ErrorMessage code={error} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {isDone && result && imageFile && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="pt-5 border-t border-slate-200/60 dark:border-slate-700/60 space-y-5"
              >
                {/* Side-by-side previews */}
                <ImagePreview
                  originalUrl={imageFile.previewUrl}
                  convertedUrl={result.blobUrl}
                  originalName={imageFile.name}
                />

                {/* Stats */}
                <ConversionStats result={result} />

                {/* Download */}
                <DownloadButton
                  blobUrl={result.blobUrl}
                  filename={result.filename}
                />
              </motion.div>
            )}
          </AnimatePresence>

        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 pb-4">
          Your images never leave your device.
        </p>
      </div>
    </main>
  )
}
