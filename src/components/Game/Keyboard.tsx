const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

export function Keyboard({
  onKey,
  onBackspace,
  onEnter,
}: {
  onKey: (letter: string) => void
  onBackspace: () => void
  onEnter: () => void
}) {
  const keyClass =
    'font-head text-xs sm:text-sm font-semibold rounded-md bg-nyt-panel border border-nyt-line text-nyt-ink hover:bg-nyt-paper transition-colors px-2 py-3 sm:px-3'

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1.5">
          {row.split('').map((letter) => (
            <button key={letter} type="button" className={keyClass} onClick={() => onKey(letter)}>
              {letter}
            </button>
          ))}
        </div>
      ))}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={onBackspace}
          className={`${keyClass} px-4 border-nyt-rust text-nyt-rust`}
        >
          DEL
        </button>
        <button
          type="button"
          onClick={onEnter}
          className={`${keyClass} px-4 border-nyt-green text-nyt-green`}
        >
          ENTER
        </button>
      </div>
    </div>
  )
}
