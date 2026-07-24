export function scrambleWord(word: string): string {
  const letters = word.split('')
  let scrambled = word

  // Re-shuffle until the result actually differs from the original
  // (short words can otherwise shuffle back to themselves repeatedly).
  let attempts = 0
  do {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[letters[i], letters[j]] = [letters[j], letters[i]]
    }
    scrambled = letters.join('')
    attempts++
  } while (scrambled === word && attempts < 10)

  return scrambled
}
