export interface ShareCardData {
  playerName: string
  score: number
  personalBest: number
  vp: number
  difficulty: string
}

const WIDTH = 1080
const HEIGHT = 1350

const COLORS = {
  bg: '#1c1230',
  panel: '#2a1f47',
  cyan: '#67e8f9',
  pink: '#f472b6',
  yellow: '#fde047',
  lime: '#a3e635',
}

async function loadFonts(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load('700 48px "Press Start 2P"'),
      document.fonts.load('400 32px "Baloo 2"'),
    ])
  } catch {
    // Fall back to default fonts if the pixel/display fonts aren't available yet.
  }
}

/** Renders a shareable score card to an offscreen canvas using plain Canvas 2D drawing -- no image assets or libraries. */
export async function renderShareCard(data: ShareCardData): Promise<HTMLCanvasElement> {
  await loadFonts()

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')!

  // Background
  const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  grad.addColorStop(0, COLORS.bg)
  grad.addColorStop(1, '#160c26')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.textAlign = 'center'

  // Title
  ctx.fillStyle = COLORS.cyan
  ctx.font = '700 54px "Press Start 2P", monospace'
  ctx.fillText('SCRAM', WIDTH / 2 - 90, 160)
  ctx.fillStyle = COLORS.pink
  ctx.fillText('BLR', WIDTH / 2 + 190, 160)

  // Scrambled letter tiles (decorative)
  const letters = 'SCRAMBLR'.split('')
  const tileSize = 84
  const gap = 14
  const totalWidth = letters.length * tileSize + (letters.length - 1) * gap
  let x = WIDTH / 2 - totalWidth / 2
  const tileColors = [COLORS.pink, COLORS.cyan, COLORS.yellow, COLORS.lime]
  letters.forEach((letter, i) => {
    const color = tileColors[i % tileColors.length]
    ctx.fillStyle = COLORS.panel
    ctx.strokeStyle = color
    ctx.lineWidth = 5
    roundRect(ctx, x, 230, tileSize, tileSize, 14)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = color
    ctx.font = '700 40px "Press Start 2P", monospace'
    ctx.fillText(letter, x + tileSize / 2, 230 + tileSize / 2 + 15)
    x += tileSize + gap
  })

  // Score
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = '400 28px "Baloo 2", sans-serif'
  ctx.fillText('FINAL SCORE', WIDTH / 2, 470)
  ctx.fillStyle = COLORS.yellow
  ctx.font = '700 160px "Press Start 2P", monospace'
  ctx.fillText(String(data.score), WIDTH / 2, 650)

  // Stat row
  const stats: [string, string, string][] = [
    ['BEST', String(data.personalBest), COLORS.pink],
    ['VP', String(data.vp), COLORS.lime],
    ['LEVEL', data.difficulty.toUpperCase(), COLORS.cyan],
  ]
  const statWidth = WIDTH / stats.length
  stats.forEach(([label, value, color], i) => {
    const cx = statWidth * i + statWidth / 2
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '400 24px "Baloo 2", sans-serif'
    ctx.fillText(label, cx, 800)
    ctx.fillStyle = color
    ctx.font = '700 44px "Press Start 2P", monospace'
    ctx.fillText(value, cx, 860)
  })

  // Player name
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '400 32px "Baloo 2", sans-serif'
  ctx.fillText(`${data.playerName} unscrambled their way here.`, WIDTH / 2, 1000)

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '400 24px "Baloo 2", sans-serif'
  ctx.fillText('Can you beat this? Play Scramblr.', WIDTH / 2, HEIGHT - 80)

  return canvas
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}
