'use client'

import { useId } from 'react'
import { cn } from '@/lib/cn'

interface QualitySliderProps {
  value:    number
  onChange: (value: number) => void
  disabled?: boolean
}

export function QualitySlider({ value, onChange, disabled = false }: QualitySliderProps) {
  const sliderId = useId()

  // Map 1–100 to a descriptive label shown alongside the number
  const qualityLabel = value >= 90 ? 'Maximum' : value >= 75 ? 'High' : value >= 50 ? 'Medium' : 'Low'

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={sliderId}
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Quality
        </label>
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          >
            {qualityLabel}
          </span>
          <span
            className="text-sm font-semibold tabular-nums text-indigo-600 dark:text-indigo-400 min-w-[2.25rem] text-right"
            aria-live="polite"
            aria-atomic="true"
          >
            {value}
          </span>
        </div>
      </div>

      {/* Track + thumb */}
      <div className="relative flex items-center">
        {/* Filled track (behind the native input) */}
        <div
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 pointer-events-none transition-all duration-75"
          style={{ width: `${((value - 1) / 99) * 100}%` }}
        />

        <input
          id={sliderId}
          type="range"
          min={1}
          max={100}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={`${value} — ${qualityLabel}`}
          className={cn(
            'w-full h-1.5 rounded-full appearance-none cursor-pointer',
            'bg-slate-200 dark:bg-slate-700',
            // Thumb — webkit
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-500 dark:[&::-webkit-slider-thumb]:border-indigo-400',
            '[&::-webkit-slider-thumb]:shadow-sm',
            '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-100',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            // Thumb — moz
            '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-white',
            '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-indigo-500',
            '[&::-moz-range-thumb]:shadow-sm',
            // Focus
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-full',
            // Disabled
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between text-xs text-slate-400 dark:text-slate-600 select-none">
        <span>Smaller file</span>
        <span>Better quality</span>
      </div>
    </div>
  )
}
