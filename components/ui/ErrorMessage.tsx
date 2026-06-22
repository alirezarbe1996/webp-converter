import { ErrorCode, ERROR_MESSAGES } from '@/types/converter'

interface ErrorMessageProps {
  code: ErrorCode
}

export function ErrorMessage({ code }: ErrorMessageProps) {
  const message = ERROR_MESSAGES[code] ?? 'Something went wrong. Please try again.'

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl px-4 py-3.5 bg-red-50/80 dark:bg-red-950/40 border border-red-200/70 dark:border-red-800/50"
    >
      {/* Icon */}
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        className="shrink-0 mt-px text-red-500 dark:text-red-400"
      >
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 6v4M10 13.5v.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>

      {/* Message */}
      <p className="text-sm leading-snug text-red-700 dark:text-red-300">
        {message}
      </p>
    </div>
  )
}
