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
    'font-arcade text-xs sm:text-sm rounded-md bg-arcade-panel border-2 border-arcade-purple text-white/90 hover:bg-arcade-purple hover:shadow-neon transition-colors px-2 py-3 sm:px-3'

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
          className={`${keyClass} px-4 border-arcade-orange text-arcade-orange`}
        >
          DEL
        </button>
        <button
          type="button"
          onClick={onEnter}
          className={`${keyClass} px-4 border-arcade-lime text-arcade-lime`}
        >
          ENTER
        </button>
      </div>
    </div>
  )
}
