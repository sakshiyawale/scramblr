import { useEffect, useRef } from 'react'
import { useGame, timerSecondsFor, DIFFICULTY_TIERS } from '../../context/GameContext'
import { useValue } from '../../context/ValueContext'
import { Timer } from './Timer'
import { ScrambledWord } from './ScrambledWord'
import { ScoreBoard } from './ScoreBoard'
import { Keyboard } from './Keyboard'

const TIER_LABEL: Record<string, string> = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
  expert: 'EXPERT 🔒',
}

const TIER_COLOR: Record<string, string> = {
  easy: 'text-arcade-lime border-arcade-lime',
  medium: 'text-arcade-cyan border-arcade-cyan',
  hard: 'text-arcade-orange border-arcade-orange',
  expert: 'text-arcade-pink border-arcade-pink',
}

export function GameScreen({ onOpenUpgrade }: { onOpenUpgrade: () => void }) {
  const game = useGame()
  const { value, onExpertAttempted } = useValue()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [game.scrambled])

  if (game.phase === 'idle') {
    return (
      <div className="flex flex-col items-center gap-6 py-10 animate-popin">
        <h2 className="font-arcade text-arcade-pink text-2xl sm:text-3xl text-center drop-shadow-neon">
          UNSCRAMBLE RACE
        </h2>
        <p className="font-display text-white/70 text-center max-w-sm">
          Unscramble the word before the clock runs out. Get harder words the better you play.
        </p>
        <button
          type="button"
          onClick={game.startGame}
          className="font-arcade text-sm sm:text-base px-8 py-4 rounded-xl bg-arcade-lime text-arcade-bg shadow-neon-lg hover:scale-105 active:scale-95 transition-transform"
        >
          ▶ START GAME
        </button>
      </div>
    )
  }

  if (game.phase === 'ended') {
    return (
      <div className="flex flex-col items-center gap-6 py-10 animate-popin">
        <h2 className="font-arcade text-arcade-orange text-xl sm:text-2xl">GAME OVER</h2>
        <ScoreBoard score={game.score} value={value} />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={game.startGame}
            className="font-arcade text-xs sm:text-sm px-6 py-3 rounded-xl bg-arcade-cyan text-arcade-bg shadow-neon-lg hover:scale-105 active:scale-95 transition-transform"
          >
            ↻ PLAY AGAIN
          </button>
          <button
            type="button"
            onClick={onOpenUpgrade}
            className="font-arcade text-xs sm:text-sm px-6 py-3 rounded-xl bg-arcade-pink text-white shadow-neon-lg hover:scale-105 active:scale-95 transition-transform"
          >
            ⭐ UPGRADE
          </button>
        </div>
      </div>
    )
  }

  const timerSeconds = timerSecondsFor(game.difficulty)
  const nextTier = DIFFICULTY_TIERS.find((t) => t.unlockScore > game.score && !t.requiresPlan)

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto py-4">
      <div className="flex items-center justify-between w-full">
        <span className={`font-arcade text-[10px] px-2 py-1 rounded border-2 ${TIER_COLOR[game.difficulty]}`}>
          {TIER_LABEL[game.difficulty]}
        </span>
        <button
          type="button"
          onClick={() => {
            onExpertAttempted()
            onOpenUpgrade()
          }}
          className="font-arcade text-[9px] text-arcade-yellow hover:underline"
        >
          🔒 EXPERT
        </button>
      </div>

      <Timer seconds={timerSeconds} running={game.phase === 'playing'} onExpire={game.timeUp} resetKey={game.scrambled} />

      <ScoreBoard score={game.score} value={value} />

      <ScrambledWord scrambled={game.scrambled} hintedLetters={game.hintedLetters} answer={game.answer} />

      <form
        className="flex gap-2 w-full justify-center"
        onSubmit={(e) => {
          e.preventDefault()
          game.submitAnswer()
        }}
      >
        <input
          ref={inputRef}
          value={game.input}
          onChange={(e) => game.setInput(e.target.value.toUpperCase())}
          className="font-arcade text-center tracking-widest text-lg px-4 py-3 rounded-xl bg-black/50 border-4 border-arcade-cyan text-white w-56 focus:outline-none focus:shadow-neon"
          maxLength={16}
          autoComplete="off"
          spellCheck={false}
        />
      </form>

      <Keyboard
        onKey={(l) => game.setInput((game.input + l).toUpperCase())}
        onBackspace={() => game.setInput(game.input.slice(0, -1))}
        onEnter={() => game.submitAnswer()}
      />

      <button
        type="button"
        disabled={game.hintsRemaining <= 0}
        onClick={game.useHint}
        className="font-arcade text-[10px] px-4 py-2 rounded-lg bg-arcade-purple text-white border-2 border-arcade-yellow disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-neon transition-shadow"
      >
        💡 HINT ({game.hintsRemaining} left)
      </button>

      {nextTier && (
        <p className="font-display text-[11px] text-white/40">
          Score {nextTier.unlockScore} to unlock {nextTier.id.toUpperCase()} mode
        </p>
      )}
    </div>
  )
}
