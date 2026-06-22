import { ConversionResult } from '@/types/converter'
import { formatBytes } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'

interface ConversionStatsProps {
  result: ConversionResult
}

export function ConversionStats({ result }: ConversionStatsProps) {
  const { originalSize, convertedSize, savingsPercent } = result
  const didShrink = convertedSize < originalSize

  return (
    <div
      aria-label="Conversion results"
      className="rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 overflow-hidden"
    >
      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-slate-200/60 dark:divide-slate-700/50">
        <Stat
          label="Original"
          value={formatBytes(originalSize)}
        />
        <Stat
          label="WebP"
          value={formatBytes(convertedSize)}
        />
        <Stat
          label="Saved"
          value={`${savingsPercent}%`}
          highlight={didShrink}
        />
      </div>

      {/* Success / info banner */}
      <div className="px-4 py-2.5 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center gap-2">
        {didShrink ? (
          <>
            <CheckIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Reduced by{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatBytes(originalSize - convertedSize)}
              </span>{' '}
              ({savingsPercent}% smaller)
            </p>
            <Badge variant="success" className="ml-auto">Done</Badge>
          </>
        ) : (
          <>
            <InfoIcon className="w-4 h-4 text-blue-400 shrink-0" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The WebP is slightly larger — try lowering quality.
            </p>
            <Badge variant="info" className="ml-auto">Done</Badge>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Stat cell ────────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-3">
      <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-medium">
        {label}
      </span>
      <span
        className={
          highlight
            ? 'text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400'
            : 'text-lg font-semibold tabular-nums text-slate-700 dark:text-slate-200'
        }
      >
        {value}
      </span>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.15" />
      <path
        d="M6.5 10.5l2.5 2.5 4.5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5M10 6.5v.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}
