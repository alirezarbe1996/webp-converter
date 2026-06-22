'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'

interface ImagePreviewProps {
  originalUrl:  string
  convertedUrl: string
  originalName: string
}

export function ImagePreview({ originalUrl, convertedUrl, originalName }: ImagePreviewProps) {
  // Track individual load states so we can show a shimmer until ready
  const [origLoaded, setOrigLoaded]  = useState(false)
  const [convLoaded, setConvLoaded]  = useState(false)

  return (
    <div
      aria-label="Image preview comparison"
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      <PreviewPanel
        url={originalUrl}
        label="Original"
        badgeText={getExtensionLabel(originalName)}
        badgeVariant="neutral"
        loaded={origLoaded}
        onLoad={() => setOrigLoaded(true)}
        alt={`Original: ${originalName}`}
      />
      <PreviewPanel
        url={convertedUrl}
        label="Converted"
        badgeText="WebP"
        badgeVariant="success"
        loaded={convLoaded}
        onLoad={() => setConvLoaded(true)}
        alt="Converted WebP output"
      />
    </div>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface PreviewPanelProps {
  url:          string
  label:        string
  badgeText:    string
  badgeVariant: 'neutral' | 'success'
  loaded:       boolean
  onLoad:       () => void
  alt:          string
}

function PreviewPanel({
  url,
  label,
  badgeText,
  badgeVariant,
  loaded,
  onLoad,
  alt,
}: PreviewPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Label row */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </span>
        <Badge variant={badgeVariant}>{badgeText}</Badge>
      </div>

      {/* Image frame */}
      <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center">
        {/* Shimmer while loading */}
        {!loaded && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse"
          />
        )}

        {/* Checkerboard background visible through transparent areas */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30 dark:opacity-10"
          style={{
            backgroundImage:
              'repeating-conic-gradient(#94a3b8 0% 25%, transparent 0% 50%)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          onLoad={onLoad}
          className="relative z-10 max-h-48 w-full object-contain transition-opacity duration-300"
          style={{ opacity: loaded ? 1 : 0 }}
          draggable={false}
        />
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getExtensionLabel(filename: string): string {
  const dot = filename.lastIndexOf('.')
  if (dot === -1) return 'IMG'
  return filename.slice(dot + 1).toUpperCase()
}
