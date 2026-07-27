import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Difficulty } from '../lib/types'
import { pickWord } from '../lib/words'
import { scrambleWord } from '../lib/scramble'

export const DIFFICULTY_TIERS: { id: Difficulty; unlockScore: number; timerSeconds: number; requiresPlan?: boolean }[] = [
  { id: 'easy', unlockScore: 0, timerSeconds: 15 },
  { id: 'medium', unlockScore: 5, timerSeconds: 12 },
  { id: 'hard', unlockScore: 10, timerSeconds: 10 },
  { id: 'expert', unlockScore: 15, timerSeconds: 8, requiresPlan: true },
]

function difficultyForScore(score: number): Difficulty {
  let tier: Difficulty = 'easy'
  for (const t of DIFFICULTY_TIERS) {
    if (score >= t.unlockScore && !t.requiresPlan) tier = t.id
  }
  return tier
}

export type GamePhase = 'idle' | 'playing' | 'ended'

interface GameContextShape {
  phase: GamePhase
  score: number
  answer: string
  scrambled: string
  difficulty: Difficulty
  hintsRemaining: number
  hintedLetters: number
  input: string
  setInput: (v: string) => void
  startGame: () => void
  submitAnswer: () => 'correct' | 'wrong' | null
  useHint: () => void
  timeUp: () => void
  endGame: () => void
  lastResult: 'correct' | 'wrong' | null
}

const GameContext = createContext<GameContextShape | null>(null)

export function GameProvider({
  children,
  onGameEnd,
  onHintUsed,
}: {
  children: ReactNode
  onGameEnd: (finalScore: number) => void
  onHintUsed: () => void
}) {
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [score, setScore] = useState(0)
  const [answer, setAnswer] = useState('')
  const [scrambled, setScrambled] = useState('')
  const [seenWords, setSeenWords] = useState<string[]>([])
  const [hintsRemaining, setHintsRemaining] = useState(3)
  const [hintedLetters, setHintedLetters] = useState(0)
  const [input, setInput] = useState('')
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null)

  const difficulty = difficultyForScore(score)

  const nextWord = useCallback((currentScore: number, history: string[]) => {
    const tier = difficultyForScore(currentScore)
    const word = pickWord(tier, history)
    setAnswer(word)
    setScrambled(scrambleWord(word))
    setSeenWords((prev) => [...prev.slice(-8), word])
    setHintedLetters(0)
    setInput('')
  }, [])

  const startGame = useCallback(() => {
    setScore(0)
    setHintsRemaining(3)
    setLastResult(null)
    setPhase('playing')
    // Keep the recent-word history across "Play Again" so a new game doesn't
    // immediately repeat the words from the one that just ended.
    nextWord(0, seenWords)
  }, [nextWord, seenWords])

  const endGame = useCallback(() => {
    setPhase('ended')
    onGameEnd(score)
  }, [onGameEnd, score])

  const submitAnswer = useCallback((): 'correct' | 'wrong' | null => {
    if (phase !== 'playing') return null
    const isCorrect = input.trim().toUpperCase() === answer
    setLastResult(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) {
      const newScore = score + 1
      setScore(newScore)
      nextWord(newScore, seenWords)
      return 'correct'
    }
    setPhase('ended')
    onGameEnd(score)
    return 'wrong'
  }, [phase, input, answer, score, seenWords, nextWord, onGameEnd])

  const timeUp = useCallback(() => {
    if (phase !== 'playing') return
    setLastResult('wrong')
    setPhase('ended')
    onGameEnd(score)
  }, [phase, score, onGameEnd])

  const useHint = useCallback(() => {
    if (hintsRemaining <= 0 || phase !== 'playing') return
    setHintsRemaining((h) => h - 1)
    setHintedLetters((n) => Math.min(n + 1, answer.length))
    onHintUsed()
  }, [hintsRemaining, phase, answer.length, onHintUsed])

  const ctx = useMemo<GameContextShape>(
    () => ({
      phase,
      score,
      answer,
      scrambled,
      difficulty,
      hintsRemaining,
      hintedLetters,
      input,
      setInput,
      startGame,
      submitAnswer,
      useHint,
      timeUp,
      endGame,
      lastResult,
    }),
    [phase, score, answer, scrambled, difficulty, hintsRemaining, hintedLetters, input, startGame, submitAnswer, useHint, timeUp, endGame, lastResult],
  )

  return <GameContext.Provider value={ctx}>{children}</GameContext.Provider>
}

export function useGame(): GameContextShape {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}

export function timerSecondsFor(difficulty: Difficulty): number {
  return DIFFICULTY_TIERS.find((t) => t.id === difficulty)?.timerSeconds ?? 15
}
