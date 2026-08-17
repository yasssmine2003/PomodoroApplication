import { useEffect, useState } from 'react'
import type { SessionType } from '../types'

const RING_R = 130
const RING_CIRC = 2 * Math.PI * RING_R

// Deep focus uses dark mode even in the light-theme app — it's intentional immersion
const SESSION_COLORS: Record<SessionType, { stroke: string; glow: string; bg: string }> = {
  focus:      { stroke: '#c4a8ff', glow: 'rgba(196,168,255,0.35)', bg: 'rgba(196,168,255,0.08)' },
  shortBreak: { stroke: '#86efac', glow: 'rgba(134,239,172,0.35)', bg: 'rgba(134,239,172,0.06)' },
  longBreak:  { stroke: '#6ee7b7', glow: 'rgba(110,231,183,0.35)', bg: 'rgba(110,231,183,0.06)' },
}

interface Props {
  display: string; sessionType: SessionType; status: string; progress: number
  taskTitle?: string; pomodoroCount: number; pomodorosBeforeLongBreak: number
  onStart: () => void; onPause: () => void; onResume: () => void; onExit: () => void
}

export default function DeepFocusMode({ display, sessionType, status, progress, taskTitle, pomodoroCount, pomodorosBeforeLongBreak, onStart, onPause, onResume, onExit }: Props) {
  const [visible, setVisible] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [hideTimer, setHideTimer] = useState(false)
  const [idleTimeout, setIdleTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  const dashOffset = RING_CIRC * (1 - progress)
  const colors = SESSION_COLORS[sessionType]

  useEffect(() => {
    setVisible(true)
    document.documentElement.requestFullscreen?.().catch(() => {})
    return () => { document.exitFullscreen?.().catch(() => {}) }
  }, [])

  const resetIdle = () => {
    setShowControls(true)
    if (idleTimeout) clearTimeout(idleTimeout)
    if (status === 'running') setIdleTimeout(setTimeout(() => setShowControls(false), 3500))
  }

  useEffect(() => {
    if (status === 'running') setIdleTimeout(setTimeout(() => setShowControls(false), 3500))
    else setShowControls(true)
    return () => { if (idleTimeout) clearTimeout(idleTimeout) }
  }, [status])

  const bgGradient = sessionType === 'focus'
    ? 'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(124,58,237,0.18) 0%, transparent 60%)'
    : 'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(16,185,129,0.12) 0%, transparent 60%)'

  return (
    <div onClick={resetIdle} onMouseMove={resetIdle}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#07070f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.5s ease', opacity: visible ? 1 : 0 }}>

      <div style={{ position: 'absolute', inset: 0, background: bgGradient, pointerEvents: 'none', transition: 'background 1s ease' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(196,168,255,0.1) 1px, transparent 1px)', backgroundSize: '56px 56px', opacity: 0.25 }} />

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', transition: 'opacity 0.5s ease', opacity: showControls ? 1 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg, #7e57c2, #ec407a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <span style={{ fontFamily: 'Fraunces', fontSize: '15px', color: 'rgba(240,239,255,0.6)' }}>YasFlow</span>
          </div>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.stroke, animation: status === 'running' ? 'pulse-glow 1.5s ease-in-out infinite' : 'none' }} />
          <span style={{ fontFamily: 'Outfit', fontSize: '12px', color: colors.stroke, letterSpacing: '0.1em', fontWeight: '600' }}>
            {status === 'running' ? 'IN SESSION' : status === 'paused' ? 'PAUSED' : 'DEEP FOCUS'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={e => { e.stopPropagation(); setHideTimer(h => !h) }}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', cursor: 'pointer', fontFamily: 'Outfit' }}>
            {hideTimer ? 'Show timer' : 'Minimal mode'}
          </button>
          <button onClick={e => { e.stopPropagation(); onExit() }}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', cursor: 'pointer', fontFamily: 'Outfit' }}>
            Exit focus
          </button>
        </div>
      </div>

      {/* Central */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', position: 'relative', zIndex: 1 }}>
        {taskTitle && (
          <p style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 'clamp(15px,2.5vw,22px)', color: 'rgba(240,239,255,0.4)', textAlign: 'center', transition: 'opacity 0.5s', opacity: hideTimer ? 0 : 1 }}>
            {taskTitle}
          </p>
        )}

        {/* Ring */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', width: '380px', height: '380px', borderRadius: '50%', background: `radial-gradient(circle, ${colors.glow} 0%, transparent 65%)`, filter: 'blur(24px)', opacity: status === 'running' ? 1 : 0.3, transition: 'opacity 0.8s' }} />
          <svg width="320" height="320" viewBox="0 0 320 320"
            style={{ filter: status === 'running' ? `drop-shadow(0 0 28px ${colors.glow})` : 'none', transition: 'filter 1s ease' }}>
            <circle cx="160" cy="160" r={RING_R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="7" />
            <circle cx="160" cy="160" r={RING_R} fill="none" stroke={colors.stroke} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={RING_CIRC} strokeDashoffset={dashOffset} transform="rotate(-90 160 160)"
              style={{ transition: status === 'running' ? 'stroke-dashoffset 0.25s linear' : 'stroke-dashoffset 0.8s ease', opacity: hideTimer ? 0.15 : 1 }} />
          </svg>

          {!hideTimer ? (
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <p style={{ fontFamily: 'DM Mono', fontSize: 'clamp(54px,11vw,78px)', fontWeight: '400', color: '#f0efff', lineHeight: 1, letterSpacing: '-0.03em' }}>{display}</p>
              <p style={{ fontSize: '11px', color: colors.stroke, letterSpacing: '0.15em', marginTop: '8px', fontWeight: '600' }}>
                {sessionType === 'focus' ? 'DEEP FOCUS' : sessionType === 'shortBreak' ? 'SHORT BREAK' : 'LONG BREAK'}
              </p>
            </div>
          ) : (
            <div style={{ position: 'absolute', width: '70px', height: '70px', borderRadius: '50%', background: colors.stroke, opacity: 0.12, animation: 'ring-pulse 3s ease-in-out infinite' }} />
          )}
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: '10px', opacity: hideTimer ? 0 : 0.6, transition: 'opacity 0.5s' }}>
          {Array.from({ length: pomodorosBeforeLongBreak }).map((_, i) => (
            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < pomodoroCount ? colors.stroke : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>

      {hideTimer && (
        <p style={{ position: 'absolute', bottom: '130px', fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: '16px', color: 'rgba(240,239,255,0.2)', animation: 'pulse-glow 4s ease-in-out infinite' }}>
          Breathe. Focus. Flow.
        </p>
      )}

      {/* Controls */}
      <div style={{ position: 'absolute', bottom: '60px', display: 'flex', alignItems: 'center', gap: '20px', transition: 'opacity 0.5s ease', opacity: showControls ? 1 : 0 }}>
        <button
          onClick={e => { e.stopPropagation(); if (status === 'idle') onStart(); else if (status === 'running') onPause(); else if (status === 'paused') onResume() }}
          style={{ width: '68px', height: '68px', borderRadius: '50%', border: 'none', background: `linear-gradient(135deg, ${sessionType === 'focus' ? '#7e57c2, #ec407a' : colors.stroke + ', ' + colors.stroke})`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 0 40px ${colors.glow}`, transition: 'transform 0.2s' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}>
          {status === 'running'
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ marginLeft: '3px' }}><polygon points="5 3 19 12 5 21 5 3" /></svg>}
        </button>
      </div>
    </div>
  )
}
