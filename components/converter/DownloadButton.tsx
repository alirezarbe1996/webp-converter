'use client'

import { useCallback, useState } from 'react'
import { cn } from '@/lib/cn'

interface DownloadButtonProps {
  blobUrl:  string
  filename: string
}

export function DownloadButton({ blobUrl, filename }: DownloadButtonProps) {
  const [clicked, setClicked] = useState(false)

  const handleDownload = useCallback(() => {
    const a = document.createElement('a')
    a.href     = blobUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Brief "Downloaded!" feedback
    setClicked(true)
    setTimeout(() => setClicked(false), 2000)
  }, [blobUrl, filename])

  return (
    <div aria-live="polite" aria-atomic="true">
      <button
        type="button"
        onClick={handleDownload}
        className={cn(
          'w-full flex items-center justify-center gap-2.5',
          'rounded-xl px-5 py-3.5 text-sm font-semibold',
          'transition-all duration-200 outline-none',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500',
          clicked
            ? 'bg-emerald-500 dark:bg-emerald-600 text-white shadow-[0_4px_16px_-4px_rgba(16,185,129,0.5)] scale-[0.99]'
            : 'bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white shadow-[0_4px_16px_-4px_rgba(99,102,241,0.5)] hover:shadow-[0_6px_20px_-4px_rgba(99,102,241,0.6)] hover:scale-[1.01] active:scale-[0.99]',
        )}
        aria-label={clicked ? `${filename} downloaded` : `Download ${filename}`}
      >
        {clicked ? (
          <>
            <CheckIcon className="w-4 h-4" />
            Downloaded
          </>
        ) : (
          <>
            <DownloadIcon className="w-4 h-4" />
            Download WebP
          </>
        )}
      </button>

      {/* Screen-reader announcement */}
      {clicked && (
        <span className="sr-only">
          {filename} has been downloaded.
        </span>
      )}
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 3v9m0 0-3-3m3 3 3-3M4 14v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 10.5l4 4 7-8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
