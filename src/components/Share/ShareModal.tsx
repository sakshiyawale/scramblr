import { useEffect, useRef, useState } from 'react'
import { PromptModal } from '../Prompt/PromptModal'
import { canvasToBlob, renderShareCard } from '../../lib/shareCard'

export function ShareModal({
  score,
  personalBest,
  vp,
  difficulty,
  playerName,
  onClose,
  onShared,
}: {
  score: number
  personalBest: number
  vp: number
  difficulty: string
  playerName: string
  onClose: () => void
  onShared: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const awardedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    renderShareCard({ score, personalBest, vp, difficulty, playerName }).then((canvas) => {
      if (cancelled) return
      canvasRef.current = canvas
      setDataUrl(canvas.toDataURL('image/png'))
    })
    return () => {
      cancelled = true
    }
  }, [score, personalBest, vp, difficulty, playerName])

  function markShared() {
    if (awardedRef.current) return
    awardedRef.current = true
    onShared()
  }

  function handleDownload() {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'scramblr-score.png'
    a.click()
    markShared()
  }

  async function handleNativeShare() {
    const canvas = canvasRef.current
    if (!canvas) return
    const blob = await canvasToBlob(canvas)
    const shareText = `I scored ${score} on Scramblr! Can you beat me?`
    try {
      if (blob && navigator.canShare?.({ files: [new File([blob], 'scramblr-score.png', { type: 'image/png' })] })) {
        const file = new File([blob], 'scramblr-score.png', { type: 'image/png' })
        await navigator.share({ files: [file], title: 'Scramblr', text: shareText })
      } else {
        await navigator.share({ title: 'Scramblr', text: shareText, url: window.location.origin })
      }
      markShared()
    } catch {
      // User cancelled the share sheet -- not an error worth surfacing.
    }
  }

  function openIntent(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
    markShared()
  }

  const shareText = `I scored ${score} on Scramblr! Can you beat me?`
  const pageUrl = window.location.origin
  const canNativeShare = typeof navigator.share === 'function'

  return (
    <PromptModal onClose={onClose} accent="cyan">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="font-arcade text-[10px] text-arcade-cyan">SHARE YOUR SCORE</span>

        <div className="w-full rounded-lg overflow-hidden border-2 border-arcade-cyan bg-black/30 aspect-[4/5] grid place-items-center">
          {dataUrl ? (
            <img src={dataUrl} alt="Scramblr score card" className="w-full h-full object-contain" />
          ) : (
            <p className="font-display text-white/40 text-sm">Generating card…</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!dataUrl}
            className="font-arcade text-[10px] px-3 py-3 rounded-lg bg-arcade-lime text-arcade-bg shadow-neon hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
          >
            ⬇ Download
          </button>
          {canNativeShare ? (
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={!dataUrl}
              className="font-arcade text-[10px] px-3 py-3 rounded-lg bg-arcade-pink text-white shadow-neon hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
            >
              📲 Share
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openIntent(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${pageUrl}`)}`)}
              className="font-arcade text-[10px] px-3 py-3 rounded-lg bg-arcade-lime/90 text-arcade-bg shadow-neon hover:scale-105 active:scale-95 transition-transform"
            >
              WhatsApp
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 w-full">
          <button
            type="button"
            onClick={() =>
              openIntent(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`,
              )
            }
            className="font-display text-xs px-2 py-2 rounded-lg border-2 border-white/15 text-white/70 hover:border-arcade-cyan hover:text-arcade-cyan transition-colors"
          >
            X / Twitter
          </button>
          <button
            type="button"
            onClick={() => openIntent(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`)}
            className="font-display text-xs px-2 py-2 rounded-lg border-2 border-white/15 text-white/70 hover:border-arcade-cyan hover:text-arcade-cyan transition-colors"
          >
            Facebook
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="font-display text-xs px-2 py-2 rounded-lg border-2 border-white/15 text-white/70 hover:border-arcade-cyan hover:text-arcade-cyan transition-colors"
          >
            Instagram
          </button>
        </div>
        <p className="text-[10px] text-white/30 font-display">
          Instagram doesn't support sharing links directly -- download the card, then post it yourself.
        </p>
      </div>
    </PromptModal>
  )
}
