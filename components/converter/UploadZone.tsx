'use client'

import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { validate, ACCEPTED_EXTENSIONS, INPUT_ACCEPT } from '@/lib/validate'
import { formatBytes, getFormatLabel } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'

interface UploadZoneProps {
  onFileSelected: (file: File) => void
  hasFile:   boolean
  fileName?: string
  fileSize?: number
  fileMime?: string
  onReset:   () => void
}

export function UploadZone({
  onFileSelected,
  hasFile,
  fileName,
  fileSize,
  fileMime,
  onReset,
}: UploadZoneProps) {
  const inputRef  = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragError, setDragError]   = useState<string | null>(null)

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragError(null)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (!file) return

      const result = validate(file)
      if (!result.ok) {
        setDragError('That file type isn\'t supported.')
        return
      }
      setDragError(null)
      onFileSelected(file)
    },
    [onFileSelected],
  )

  // ── Input change ──────────────────────────────────────────────────────────
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const result = validate(file)
      if (result.ok) onFileSelected(file)
      // Reset input so selecting the same file again fires onChange
      e.target.value = ''
    },
    [onFileSelected],
  )

  // ── Keyboard: Space / Enter opens the picker ───────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        inputRef.current?.click()
      }
    },
    [],
  )

  // ── Render: file loaded state ─────────────────────────────────────────────
  if (hasFile && fileName && fileSize != null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 rounded-xl px-4 py-3.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50"
      >
        {/* File icon */}
        <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/60">
          <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
            {fileName}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatBytes(fileSize)}
            </span>
            {fileMime && (
              <Badge variant="neutral">{getFormatLabel(fileMime)}</Badge>
            )}
          </div>
        </div>

        {/* Replace button */}
        <button
          type="button"
          onClick={onReset}
          aria-label="Remove file and upload a different image"
          className="shrink-0 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          Change
        </button>
      </motion.div>
    )
  }

  // ── Render: empty / drop state ────────────────────────────────────────────
  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image — click or drag and drop"
        aria-describedby="upload-hint"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3',
          'rounded-xl border-2 border-dashed px-6 py-12 cursor-pointer',
          'transition-all duration-200 outline-none',
          'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          isDragging
            ? 'border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30 scale-[1.01]'
            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40',
        )}
      >
        {/* Upload icon */}
        <motion.div
          animate={isDragging ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800"
        >
          <UploadIcon className="w-7 h-7 text-slate-400 dark:text-slate-500" />
        </motion.div>

        {/* Copy */}
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {isDragging ? 'Drop to convert' : 'Drop an image here'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            or <span className="text-indigo-500 dark:text-indigo-400 font-medium">click to browse</span>
          </p>
        </div>

        {/* Hidden input */}
        <input
          ref={inputRef}
          id="file-upload"
          type="file"
          accept={INPUT_ACCEPT}
          onChange={handleInputChange}
          className="sr-only"
          aria-label="Upload image file"
        />
      </div>

      {/* Supported formats hint + drag error */}
      <div className="flex items-center justify-between px-1">
        <p
          id="upload-hint"
          className="text-xs text-slate-400 dark:text-slate-600"
        >
          {ACCEPTED_EXTENSIONS} · up to 25 MB
        </p>
        {dragError && (
          <p role="alert" className="text-xs text-red-500 dark:text-red-400">
            {dragError}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Inline SVG icons (no extra icon package needed) ─────────────────────────

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5M12 3v11m0-11-3.5 3.5M12 3l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 15l5-5 4 4 3-3 6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
