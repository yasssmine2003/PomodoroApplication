import type { Page } from '../types'

interface NavItem { id: Page; label: string; icon: string }

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Home',     icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
  { id: 'timer',     label: 'Focus',    icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2' },
  { id: 'tasks',     label: 'Tasks',    icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { id: 'stats',     label: 'Stats',    icon: 'M18 20V10 M12 20V4 M6 20v-6' },
  { id: 'settings',  label: 'Settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
]

interface Props { current: Page; onNavigate: (p: Page) => void; userName?: string }

export default function Navigation({ current, onNavigate, userName }: Props) {
  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[220px] z-40"
        style={{ background: '#ffffff', borderRight: '1px solid rgba(126,87,194,0.1)' }}>

        {/* Logo */}
        <div className="px-6 pt-7 pb-5">
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #7e57c2, #ec407a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(126,87,194,0.35)',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <span style={{ fontFamily: 'Fraunces', fontSize: '18px', fontWeight: '400', color: '#1a1028', letterSpacing: '-0.01em' }}>
              YasFlow
            </span>
          </div>
          {userName && (
            <p style={{ fontSize: '12px', color: '#a08ccc', marginTop: '5px', fontFamily: 'Outfit' }}>
              Hi, {userName} ✦
            </p>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3">
          {NAV_ITEMS.map(item => {
            const active = item.id === current
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 mb-1 transition-all duration-200 text-left"
                style={{
                  background: active ? 'rgba(126,87,194,0.1)' : 'transparent',
                  color: active ? '#7e57c2' : '#9e8eb8',
                  fontFamily: 'Outfit', fontSize: '14px',
                  fontWeight: active ? '600' : '400',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#5c3d99' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#9e8eb8' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon.split(' M').map((d, i) => (
                    <path key={i} d={i === 0 ? d : 'M' + d} />
                  ))}
                </svg>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Tagline card */}
        <div className="px-4 pb-6">
          <div style={{ borderRadius: '14px', padding: '12px 14px', background: 'linear-gradient(135deg, rgba(126,87,194,0.08), rgba(240,98,146,0.06))', border: '1px solid rgba(126,87,194,0.12)' }}>
            <p style={{ fontSize: '11px', color: '#7e57c2', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '3px' }}>YASFLOW</p>
            <p style={{ fontSize: '12px', color: '#a08ccc' }}>Focus on what matters.</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom nav ────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around"
        style={{
          background: 'rgba(255,255,255,0.97)',
          borderTop: '1px solid rgba(126,87,194,0.1)',
          paddingTop: '8px', paddingBottom: '14px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 -4px 24px rgba(126,87,194,0.06)',
        }}>
        {NAV_ITEMS.map(item => {
          const active = item.id === current
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200"
              style={{ color: active ? '#7e57c2' : '#c4b0e0' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {item.icon.split(' M').map((d, i) => (
                  <path key={i} d={i === 0 ? d : 'M' + d} />
                ))}
              </svg>
              <span style={{ fontSize: '10px', fontWeight: active ? '600' : '400' }}>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
