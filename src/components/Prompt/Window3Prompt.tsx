import { useState } from 'react'
import { WINDOWS } from '../../lib/value-engine'
import { PromptModal } from './PromptModal'

export function Window3Prompt({ onConvert, onDismiss }: { onConvert: () => void; onDismiss: () => void }) {
  const def = WINDOWS.window3
  const [downloading, setDownloading] = useState<'ios' | 'android' | null>(null)

  function handleDownload(store: 'ios' | 'android') {
    setDownloading(store)
    setTimeout(onConvert, 700)
  }

  return (
    <PromptModal onClose={onDismiss} accent="plum">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="font-head text-[11px] font-bold text-nyt-plum">POWER USER</span>
        <h3 className="font-head font-extrabold text-xl text-nyt-ink">{def.headline}</h3>
        <p className="text-nyt-sub text-xs font-body">{def.rationale}</p>

        {downloading ? (
          <p className="font-head text-nyt-green text-xs animate-popin">
            Redirecting to {downloading === 'ios' ? 'App Store' : 'Play Store'}… 📲
          </p>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <button
              type="button"
              onClick={() => handleDownload('ios')}
              className="font-head font-bold text-xs px-4 py-3 rounded-xl bg-nyt-ink text-white shadow-raised hover:opacity-90 transition-opacity"
            >
               App Store
            </button>
            <button
              type="button"
              onClick={() => handleDownload('android')}
              className="font-head font-bold text-xs px-4 py-3 rounded-xl bg-nyt-green text-white shadow-raised hover:opacity-90 transition-opacity"
            >
              ▶ Google Play
            </button>
          </div>
        )}

        <button type="button" onClick={onDismiss} className="text-nyt-sub text-[11px] font-body hover:text-nyt-ink">
          Stay on web
        </button>
      </div>
    </PromptModal>
  )
}
