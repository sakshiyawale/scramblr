import { useEffect, useRef } from 'react'
import { useGame, timerSecondsFor, DIFFICULTY_TIERS } from '../../context/GameContext'
import { useValue } from '../../context/ValueContext'
import { Timer } from './Timer'
import { ScrambledWord } from './ScrambledWord'
import { ScoreBoard } from './ScoreBoard'
import { Keyboard } from './Keyboard'

const TIER_LABEL: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert 🔒',
}

const TIER_COLOR: Record<string, string> = {
  easy: 'text-nyt-green border-nyt-green',
  medium: 'text-nyt-blue border-nyt-blue',
  hard: 'text-nyt-rust border-nyt-rust',
  expert: 'text-nyt-red border-nyt-red',
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
        <h2 className="font-head font-extrabold text-nyt-ink text-2xl sm:text-3xl text-center">Scramblr</h2>
        <p className="font-body text-nyt-sub text-center max-w-sm">
          Unscramble the word before the clock runs out. Get harder words the better you play.
        </p>
        <button
          type="button"
          onClick={game.startGame}
          className="font-head font-bold text-sm sm:text-base px-8 py-4 rounded-xl bg-nyt-ink text-white shadow-raised hover:opacity-90 transition-opacity"
        >
          ▶ Start game
        </button>
      </div>
    )
  }

  if (game.phase === 'ended') {
    return (
      <div className="flex flex-col items-center gap-6 py-10 animate-popin">
        <h2 className="font-head font-extrabold text-nyt-ink text-xl sm:text-2xl">Game over</h2>
        <ScoreBoard score={game.score} value={value} />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={game.startGame}
            className="font-head font-bold text-xs sm:text-sm px-6 py-3 rounded-xl bg-nyt-ink text-white shadow-raised hover:opacity-90 transition-opacity"
          >
            ↻ Play again
          </button>
          <button
            type="button"
            onClick={onOpenUpgrade}
            className="font-head font-bold text-xs sm:text-sm px-6 py-3 rounded-xl bg-nyt-red text-white shadow-raised hover:opacity-90 transition-opacity"
          >
            ⭐ Upgrade
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
        <span className={`font-head text-[11px] font-semibold px-2 py-1 rounded border ${TIER_COLOR[game.difficulty]}`}>
          {TIER_LABEL[game.difficulty]}
        </span>
        <button
          type="button"
          onClick={() => {
            onExpertAttempted()
            onOpenUpgrade()
          }}
          className="font-head text-xs font-semibold text-nyt-gold hover:underline"
        >
          🔒 Expert
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
          className="font-head text-center tracking-widest text-lg px-4 py-3 rounded-xl bg-white border-2 border-nyt-line text-nyt-ink w-56 focus:outline-none focus:border-nyt-blue"
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
        className="font-head text-xs font-semibold px-4 py-2 rounded-lg bg-nyt-plum text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        💡 Hint ({game.hintsRemaining} left)
      </button>

      {nextTier && (
        <p className="font-body text-[11px] text-nyt-sub">
          Score {nextTier.unlockScore} to unlock {TIER_LABEL[nextTier.id]} mode
        </p>
      )}
    </div>
  )
}
