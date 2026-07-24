import { useState } from 'react'
import { ValueProvider, useValue, USER_ID } from './context/ValueContext'
import { GameProvider } from './context/GameContext'
import { GameScreen } from './components/Game/GameScreen'
import { Window1Prompt } from './components/Prompt/Window1Prompt'
import { Window2Prompt } from './components/Prompt/Window2Prompt'
import { Window3Prompt } from './components/Prompt/Window3Prompt'
import { UpgradeModal } from './components/Prompt/UpgradeModal'
import { ExperimentStats } from './components/Dashboard/ExperimentStats'
import { PLANS } from './lib/value-engine'

const PROFILE_NAME = 'Demo Player'
const PROFILE_INITIALS = PROFILE_NAME.split(' ')
  .map((w) => w[0])
  .join('')

function ProfileBadge() {
  return (
    <div className="flex items-center gap-2" title={USER_ID}>
      <span className="grid place-items-center w-7 h-7 rounded-full bg-nyt-ink text-white text-[11px] font-head font-bold">
        {PROFILE_INITIALS}
      </span>
      <span className="hidden md:inline font-body text-sm text-nyt-ink">{PROFILE_NAME}</span>
    </div>
  )
}

function AppShell() {
  const { value, activeWindow, dismissActiveWindow, onGameEnd, onHintUsed, convert, upgradePlan } = useValue()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  return (
    <div className="min-h-screen flex flex-col text-nyt-ink">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-nyt-line bg-nyt-panel">
        <h1 className="font-head font-extrabold text-nyt-ink text-lg sm:text-xl tracking-tight">
          Scram<span className="text-nyt-red">blr</span>
        </h1>
        <div className="flex items-center gap-3 sm:gap-4">
          <ProfileBadge />
          <span className="hidden sm:inline font-head text-[11px] font-semibold text-nyt-sub border border-nyt-line rounded px-2 py-1">
            {PLANS[value.plan].label}
          </span>
          <button
            type="button"
            onClick={() => setShowDashboard(true)}
            className="font-head text-xs font-semibold px-3 py-2 rounded-md border border-nyt-line text-nyt-ink hover:bg-nyt-paper transition-colors"
          >
            Stats
          </button>
          <button
            type="button"
            onClick={() => setShowUpgrade(true)}
            className="font-head text-xs font-semibold px-3 py-2 rounded-md bg-nyt-red text-white shadow-card hover:opacity-90 transition-opacity"
          >
            Upgrade
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <GameProvider onGameEnd={onGameEnd} onHintUsed={onHintUsed}>
          <GameScreen onOpenUpgrade={() => setShowUpgrade(true)} />
        </GameProvider>
      </main>

      {activeWindow === 'window1' && (
        <Window1Prompt onConvert={() => convert('window1')} onDismiss={dismissActiveWindow} />
      )}
      {activeWindow === 'window2' && (
        <Window2Prompt onConvert={(plan) => convert('window2', plan)} onDismiss={dismissActiveWindow} />
      )}
      {activeWindow === 'window3' && (
        <Window3Prompt onConvert={() => convert('window3')} onDismiss={dismissActiveWindow} />
      )}

      {showUpgrade && (
        <UpgradeModal
          currentPlan={value.plan}
          onUpgrade={(plan) => {
            upgradePlan(plan)
            setShowUpgrade(false)
          }}
          onDismiss={() => setShowUpgrade(false)}
        />
      )}

      {showDashboard && <ExperimentStats onClose={() => setShowDashboard(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <ValueProvider>
      <AppShell />
    </ValueProvider>
  )
}
