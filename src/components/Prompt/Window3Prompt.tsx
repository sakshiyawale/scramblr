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
    <PromptModal onClose={onDismiss} accent="purple">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="font-arcade text-[10px] text-arcade-purple">POWER USER</span>
        <h3 className="font-display font-extrabold text-xl text-white">{def.headline}</h3>
        <p className="text-white/50 text-xs font-display">{def.rationale}</p>

        {downloading ? (
          <p className="font-arcade text-arcade-lime text-xs animate-popin">
            REDIRECTING TO {downloading === 'ios' ? 'APP STORE' : 'PLAY STORE'}… 📲
          </p>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <button
              type="button"
              onClick={() => handleDownload('ios')}
              className="font-arcade text-xs px-4 py-3 rounded-xl bg-white text-arcade-bg shadow-neon-lg hover:scale-105 active:scale-95 transition-transform"
            >
               App Store
            </button>
            <button
              type="button"
              onClick={() => handleDownload('android')}
              className="font-arcade text-xs px-4 py-3 rounded-xl bg-arcade-lime text-arcade-bg shadow-neon-lg hover:scale-105 active:scale-95 transition-transform"
            >
              ▶ Google Play
            </button>
          </div>
        )}

        <button type="button" onClick={onDismiss} className="text-white/30 text-[11px] font-display hover:text-white/60">
          Stay on web
        </button>
      </div>
    </PromptModal>
  )
}
