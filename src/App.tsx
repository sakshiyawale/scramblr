import { useState } from 'react'
import { ValueProvider, useValue } from './context/ValueContext'
import { GameProvider } from './context/GameContext'
import { GameScreen } from './components/Game/GameScreen'
import { Window1Prompt } from './components/Prompt/Window1Prompt'
import { Window2Prompt } from './components/Prompt/Window2Prompt'
import { Window3Prompt } from './components/Prompt/Window3Prompt'
import { UpgradeModal } from './components/Prompt/UpgradeModal'
import { ExperimentStats } from './components/Dashboard/ExperimentStats'
import { ProfileSetup } from './components/Profile/ProfileSetup'
import { PLANS } from './lib/value-engine'
import { createProfile, getStoredProfile, initialsFor, type Profile } from './lib/profile'

function ProfileBadge({ name, onReset }: { name: string; onReset: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2"
        title={name}
      >
        <span className="grid place-items-center w-7 h-7 rounded-full bg-arcade-cyan text-arcade-bg text-[11px] font-arcade">
          {initialsFor(name)}
        </span>
        <span className="hidden md:inline font-display text-sm text-white/80">{name}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-30 w-44 rounded-lg bg-arcade-panel border-2 border-arcade-cyan shadow-neon p-2 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onReset()
            }}
            className="font-display text-left text-xs text-white/80 hover:text-arcade-pink px-2 py-2 rounded"
          >
            ↺ Reset my score
          </button>
        </div>
      )}
    </div>
  )
}

function AppShell({ profile }: { profile: Profile }) {
  const { value, activeWindow, dismissActiveWindow, onGameEnd, onHintUsed, convert, upgradePlan, resetAll } = useValue()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  function handleResetMyScore() {
    if (window.confirm('Reset your score, VP, and history? This cannot be undone.')) {
      resetAll()
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b-2 border-white/10">
        <h1 className="font-arcade text-arcade-cyan text-sm sm:text-base drop-shadow-neon">
          🔤 SCRAM<span className="text-arcade-pink">BLR</span>
        </h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <ProfileBadge name={profile.name} onReset={handleResetMyScore} />
          <span className="hidden sm:inline font-arcade text-[9px] text-white/40 border border-white/20 rounded px-2 py-1">
            {PLANS[value.plan].label}
          </span>
          <button
            type="button"
            onClick={() => setShowDashboard(true)}
            className="font-arcade text-[9px] sm:text-[10px] px-3 py-2 rounded-lg border-2 border-arcade-cyan text-arcade-cyan hover:bg-arcade-cyan hover:text-arcade-bg transition-colors"
          >
            📊 Stats
          </button>
          <button
            type="button"
            onClick={() => setShowUpgrade(true)}
            className="font-arcade text-[9px] sm:text-[10px] px-3 py-2 rounded-lg bg-arcade-pink text-white shadow-neon hover:scale-105 active:scale-95 transition-transform"
          >
            ⭐ Upgrade
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <GameProvider onGameEnd={onGameEnd} onHintUsed={onHintUsed}>
          <GameScreen onOpenUpgrade={() => setShowUpgrade(true)} playerName={profile.name} />
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
  const [profile, setProfile] = useState<Profile | null>(() => getStoredProfile())

  if (!profile) {
    return <ProfileSetup onCreate={(name) => setProfile(createProfile(name))} />
  }

  return (
    <ValueProvider key={profile.id} userId={profile.id}>
      <AppShell profile={profile} />
    </ValueProvider>
  )
}
