import { useState } from 'react'
import { AppProvider, useApp } from './store'
import Navigation from './components/Navigation'
import Onboarding from './components/Onboarding'
import Dashboard from './pages/Dashboard'
import FocusTimer from './pages/FocusTimer'
import Tasks from './pages/Tasks'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'
import type { Page } from './types'

function AppShell() {
  const [page, setPage] = useState<Page>('dashboard')
  const { data } = useApp()

  const [onboarded, setOnboarded] = useState(() =>
    Boolean(localStorage.getItem('flowtime-onboarded'))
  )

  const handleOnboardingDone = () => {
    localStorage.setItem('flowtime-onboarded', '1')
    setOnboarded(true)
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />
      case 'timer':     return <FocusTimer onNavigate={setPage} />
      case 'tasks':     return <Tasks />
      case 'stats':     return <Statistics />
      case 'settings':  return <Settings />
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf7f4' }}>
      {!onboarded && <Onboarding onDone={handleOnboardingDone} />}

      {/* Subtle warm background texture */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: [
          'radial-gradient(ellipse 70% 50% at 15% -5%, rgba(126,87,194,0.06) 0%, transparent 55%)',
          'radial-gradient(ellipse 50% 40% at 90% 105%, rgba(236,64,122,0.04) 0%, transparent 50%)',
        ].join(', '),
      }} />

      <Navigation current={page} onNavigate={setPage} userName={data.settings.userName} />

      <main
        key={page}
        className="animate-fade-up"
        style={{ minHeight: '100vh', paddingLeft: 'clamp(0px,5vw,220px)', position: 'relative', zIndex: 1 }}
      >
        {renderPage()}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
