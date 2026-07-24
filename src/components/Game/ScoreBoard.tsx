import type { ValueState } from '../../lib/types'

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-nyt-panel border border-nyt-line min-w-[84px]">
      <span className="font-head text-[10px] font-semibold text-nyt-sub">{label}</span>
      <span className={`font-head text-lg font-bold ${color}`}>{value}</span>
    </div>
  )
}

export function ScoreBoard({ score, value }: { score: number; value: ValueState }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Stat label="SCORE" value={score} color="text-nyt-blue" />
      <Stat label="BEST" value={value.personalBest} color="text-nyt-red" />
      <Stat label="VP" value={value.vp} color="text-nyt-gold" />
      <Stat label="GAMES" value={value.gamesPlayed} color="text-nyt-green" />
    </div>
  )
}
