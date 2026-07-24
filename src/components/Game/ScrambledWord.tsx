export function ScrambledWord({ scrambled, hintedLetters, answer }: { scrambled: string; hintedLetters: number; answer: string }) {
  const hintPreview = answer.slice(0, hintedLetters)

  return (
    <div className="flex flex-col items-center gap-3 animate-popin">
      <div className="flex gap-2 flex-wrap justify-center">
        {scrambled.split('').map((letter, i) => (
          <span
            key={i}
            className="grid place-items-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-nyt-panel border-2 border-nyt-gold text-nyt-ink font-head font-bold text-xl sm:text-2xl shadow-card"
          >
            {letter}
          </span>
        ))}
      </div>
      {hintedLetters > 0 && (
        <p className="font-body text-nyt-green text-sm tracking-widest">
          HINT: {hintPreview}
          <span className="text-nyt-sub">{'_'.repeat(answer.length - hintedLetters)}</span>
        </p>
      )}
    </div>
  )
}
