import type { ReactNode } from 'react'

export function PromptModal({
  children,
  onClose,
  accent = 'red',
}: {
  children: ReactNode
  onClose: () => void
  accent?: 'red' | 'blue' | 'plum'
}) {
  const border = { red: 'border-nyt-red', blue: 'border-nyt-blue', plum: 'border-nyt-plum' }[accent]

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-nyt-ink/70 p-4" role="dialog" aria-modal="true">
      <div className={`relative w-full max-w-md rounded-2xl bg-nyt-panel border-2 ${border} shadow-raised p-6 animate-popin`}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 font-head text-nyt-sub hover:text-nyt-ink text-sm"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}
