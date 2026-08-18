import type { Page } from '../types'

interface NavItem { id: Page; label: string; icon: string }

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Home',     icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
  { id: 'timer',     label: 'Focus',    icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2' },
  { id: 'tasks',     label: 'Tasks',    icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { id: 'stats',     label: 'Stats',    icon: 'M18 20V10 M12 20V4 M6 20v-6' },
  { id: 'settings',  label: 'Settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
]

interface Props {
  current: Page
  onNavigate: (p: Page) => void
  userName?: string
  taskDone?: number
  totalTasks?: number
}

export default function Navigation({
  current,
  onNavigate,
  userName = 'Yaso',
  taskDone = 2,
  totalTasks = 6,
}: Props) {
  // Highlight the "Focus" tab (id: 'timer') with a special style
  const isFocus = (id: Page) => id === 'timer'

  return (
    <>
      {/* ── Desktop header ──────────────────────────── */}
      <header
  className="hidden md:flex fixed top-0 left-0 right-0 z-40 items-center justify-between px-6 h-[72px]"
  style={{
    background: 'transparent',           // ← totalement transparent
    borderBottom: '1px solid rgba(126,87,194,0.1)',
    boxShadow: 'none',                   // ← optionnel : ombre supprimée pour plus de légèreté
  }}
>

        {/* Logo + compact greeting */}
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7e57c2, #ec407a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(126,87,194,0.35)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span style={{ fontFamily: 'Fraunces', fontSize: '20px', fontWeight: '400', color: '#1a1028', letterSpacing: '-0.01em' }}>
            YasFlow
          </span>
          <span style={{ fontSize: '13px', color: '#a08ccc', fontFamily: 'Outfit', marginLeft: '2px' }}>
            ✦ {userName}
          </span>
        </div>

        {/* Navigation tabs with hierarchy */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = item.id === current
            const isFocusTab = isFocus(item.id)

            // Base style for all tabs
            let style: React.CSSProperties = {
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '40px',
              fontFamily: 'Outfit',
              fontSize: '14px',
              fontWeight: active ? '600' : '400',
              transition: 'all 0.2s ease',
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              color: active ? '#7e57c2' : '#9e8eb8',
              position: 'relative',
            }

            // Active tab: stronger background + underline
            if (active) {
              style.background = 'rgba(126,87,194,0.12)'
              // Underline
              style.boxShadow = 'inset 0 -2px 0 #7e57c2'
            }

            // Special treatment for Focus tab (even if not active)
            if (isFocusTab) {
              // Make it stand out with a primary pill style
              style.background = active
                ? 'linear-gradient(135deg, #7e57c2, #9c6ade)'
                : 'linear-gradient(135deg, rgba(126,87,194,0.08), rgba(236,64,122,0.08))'
              style.color = active ? '#ffffff' : '#7e57c2'
              style.fontWeight = active ? '600' : '500'
              style.boxShadow = active
                ? '0 4px 12px rgba(126,87,194,0.3)'
                : 'none'
              if (active) {
                // remove underline because background is solid
                style.boxShadow = '0 4px 12px rgba(126,87,194,0.3)'
              } else {
                style.boxShadow = 'inset 0 0 0 1px rgba(126,87,194,0.2)'
              }
            }

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={style}
                onMouseEnter={(e) => {
                  if (!active && !isFocusTab) {
                    e.currentTarget.style.color = '#5c3d99'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active && !isFocusTab) {
                    e.currentTarget.style.color = '#9e8eb8'
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon.split(' M').map((d, i) => (
                    <path key={i} d={i === 0 ? d : 'M' + d} />
                  ))}
                </svg>
                {item.label}
                {isFocusTab && !active && (
                  <span style={{
                    fontSize: '10px',
                    background: 'linear-gradient(135deg, #ec407a, #7e57c2)',
                    color: 'white',
                    borderRadius: '20px',
                    padding: '0 8px',
                    marginLeft: '2px',
                    lineHeight: '18px',
                  }}>
                    ★
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Right side: progress indicator + optional actions */}
        <div className="flex items-center gap-4">
          {totalTasks > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#7e57c2',
              fontFamily: 'Outfit',
              background: 'rgba(126,87,194,0.06)',
              padding: '4px 12px',
              borderRadius: '30px',
              border: '1px solid rgba(126,87,194,0.1)',
            }}>
              <span style={{ fontWeight: '500' }}>📋</span>
              <span>{taskDone}/{totalTasks}</span>
              <span style={{ fontSize: '11px', color: '#a08ccc' }}>tâches</span>
            </div>
          )}
          {/* small avatar or icon placeholder */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7e57c2, #ec407a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            {userName?.[0]?.toUpperCase() || 'Y'}
          </div>
        </div>
      </header>

      {/* ── Mobile bottom nav (unchanged) ────────────── */}
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