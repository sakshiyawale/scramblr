import type { ReactNode } from 'react'

export function PromptModal({
  children,
  onClose,
  accent = 'pink',
}: {
  children: ReactNode
  onClose: () => void
  accent?: 'pink' | 'cyan' | 'purple'
}) {
  const border = { pink: 'border-arcade-pink', cyan: 'border-arcade-cyan', purple: 'border-arcade-purple' }[accent]

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
      <div className={`relative w-full max-w-md rounded-2xl bg-arcade-panel border-4 ${border} shadow-neon-lg p-6 animate-popin`}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 font-arcade text-white/50 hover:text-white text-sm"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}
