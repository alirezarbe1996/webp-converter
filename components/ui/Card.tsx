import { cn } from '@/lib/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        // Base shape
        'rounded-2xl p-6 sm:p-8',
        // Glassmorphism
        'bg-white/70 dark:bg-slate-900/70',
        'backdrop-blur-xl backdrop-saturate-150',
        // Border
        'border border-white/60 dark:border-slate-700/50',
        // Shadow — layered for depth
        'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_1px_4px_-1px_rgba(0,0,0,0.04)]',
        'dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_1px_4px_-1px_rgba(0,0,0,0.2)]',
        // Spacing between children
        'flex flex-col gap-5',
        className,
      )}
    >
      {children}
    </div>
  )
}
