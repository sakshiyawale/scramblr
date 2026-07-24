import type { Difficulty } from './types'

export const WORDS_BY_TIER: Record<Difficulty, string[]> = {
  easy: [
    'GAME', 'WORD', 'RACE', 'TIME', 'PLAY', 'CLUE', 'SPIN', 'BOLD',
    'GLOW', 'NEON', 'JUMP', 'DASH', 'WILD', 'ZONE', 'FAST', 'STAR',
  ],
  medium: [
    'PUZZLE', 'ARCADE', 'STREAK', 'REWARD', 'ENGINE', 'LETTER',
    'SPRINT', 'SIGNAL', 'BONUS', 'COMBO', 'FLASH', 'ROCKET',
  ],
  hard: [
    'SCRAMBLE', 'CHAMPION', 'DASHBOARD', 'ELECTRIC', 'CASCADE',
    'GAUNTLET', 'FIREWORK', 'JACKPOT', 'OVERDRIVE', 'BOUNTY',
  ],
  expert: [
    'SUBSCRIPTION', 'ACHIEVEMENT', 'EXTRAORDINARY', 'CONSTELLATION',
    'PHENOMENON', 'INDESTRUCTIBLE', 'UNSTOPPABLE', 'MASTERMIND',
  ],
}

export function pickWord(tier: Difficulty, exclude: string[] = []): string {
  const pool = WORDS_BY_TIER[tier].filter((w) => !exclude.includes(w))
  const list = pool.length > 0 ? pool : WORDS_BY_TIER[tier]
  return list[Math.floor(Math.random() * list.length)]
}
