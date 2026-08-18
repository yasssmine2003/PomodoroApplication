import { useEffect, useState } from 'react'
import { useApp } from '../store'
import { useTimer } from '../hooks/useTimer'
import DeepFocusMode from '../components/DeepFocusMode'
import type { SessionType, Page } from '../types'

const RING_R = 110
const RING_CIRC = 2 * Math.PI * RING_R

const SESSION_LABELS: Record<SessionType, string> = {
  focus: 'DEEP FOCUS',
  shortBreak: 'SHORT BREAK',
  longBreak: 'LONG BREAK',
}

// Light-mode energetic colors
const SESSION_COLORS: Record<SessionType, { stroke: string; glow: string; bg: string; text: string; pill: string }> = {
  focus:      { stroke: '#7e57c2', glow: 'rgba(126,87,194,0.3)',   bg: 'rgba(126,87,194,0.08)',  text: '#5c3d99', pill: 'rgba(126,87,194,0.1)'  },
  shortBreak: { stroke: '#43a047', glow: 'rgba(67,160,71,0.28)',   bg: 'rgba(67,160,71,0.06)',   text: '#2e7d32', pill: 'rgba(67,160,71,0.1)'   },
  longBreak:  { stroke: '#00897b', glow: 'rgba(0,137,123,0.28)',   bg: 'rgba(0,137,123,0.06)',   text: '#00695c', pill: 'rgba(0,137,123,0.1)'   },
}

const COMPLETE_MESSAGES: Record<SessionType, string[]> = {
  focus: [
    'Session complete! Take a well-earned break. 🌿',
    'Beautiful work. Rest now — you\'ve earned it. ✨',
    'One more step forward. 🎯',
    'You showed up. That\'s what matters. 🔥',
  ],
  shortBreak: ['Break over. Let\'s get back in the zone. 🔥', 'Ready to focus? You\'ve got this. ⚡'],
  longBreak:  ['Recharged. Time to do great work. 🌟', 'Welcome back. You\'re ready. ✦'],
}
function randomMsg(type: SessionType) {
  const arr = COMPLETE_MESSAGES[type]
  return arr[Math.floor(Math.random() * arr.length)]
}

interface Props { onNavigate: (p: Page) => void }

export default function FocusTimer({ onNavigate }: Props) {
  const { data, setActiveTask, recordSession, updateStreak } = useApp()
  const activeTask = data.activeTaskId ? data.tasks.find(t => t.id === data.activeTaskId) : null
  const [completionMsg, setCompletionMsg] = useState<string | null>(null)
  const [sessionStart, setSessionStart] = useState<number | null>(null)
  const [deepFocus, setDeepFocus] = useState(false)

  const timer = useTimer(data.settings, (completedType) => {
    if (completedType === 'focus') {
      updateStreak()
      recordSession({
        taskId: data.activeTaskId ?? undefined,
        type: 'focus',
        date: new Date().toISOString().split('T')[0],
        durationMinutes: data.settings.focusDuration,
        completed: true,
      })
    }
    setCompletionMsg(randomMsg(completedType))
    setTimeout(() => setCompletionMsg(null), 5000)
    if (completedType === 'focus' && data.settings.autoStartBreak) {
      setTimeout(() => timer.nextSession(), 800)
    }
  })

  useEffect(() => {
    if (timer.state.status === 'running' && sessionStart === null) setSessionStart(Date.now())
    if (timer.state.status === 'idle' || timer.state.status === 'completed') setSessionStart(null)
  }, [timer.state.status])

  const progress = timer.getProgress()
  const dashOffset = RING_CIRC * (1 - progress)
  const colors = SESSION_COLORS[timer.state.sessionType]
  const pendingTasks = data.tasks.filter(t => t.status !== 'completed')

  const handleInterrupt = () => {
    if (timer.state.status === 'running' && sessionStart !== null) {
      const elapsed = Math.round((Date.now() - sessionStart) / 60000)
      if (elapsed >= 1) {
        recordSession({ taskId: data.activeTaskId ?? undefined, type: timer.state.sessionType, date: new Date().toISOString().split('T')[0], durationMinutes: elapsed, completed: false })
      }
    }
    timer.reset()
  }

  if (deepFocus) {
    return (
      <DeepFocusMode
        display={timer.display} sessionType={timer.state.sessionType} status={timer.state.status}
        progress={progress} taskTitle={activeTask?.title}
        pomodoroCount={timer.state.pomodoroCount} pomodorosBeforeLongBreak={data.settings.pomodorosBeforeLongBreak}
        onStart={timer.start} onPause={timer.pause} onResume={timer.resume} onExit={() => setDeepFocus(false)}
      />
    )
  }

  return (
    <div
      className="animate-fade-up"
      style={{
        paddingTop: 'calc(72px + 28px)',
        paddingBottom: '100px',
        paddingLeft: '24px',
        paddingRight: '24px',
        maxWidth: '720px',
        margin: '0 auto',
      }}
    >

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces', fontSize: '28px', fontWeight: '400', color: '#1a1028' }}>Focus</h1>
          <p style={{ fontSize: '13px', color: '#a08ccc', marginTop: '2px' }}>Session {timer.state.pomodoroCount + 1} of {data.settings.pomodorosBeforeLongBreak}</p>
        </div>
        <button onClick={() => setDeepFocus(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(126,87,194,0.25)', background: 'rgba(126,87,194,0.06)', color: '#7e57c2', fontSize: '13px', fontFamily: 'Outfit', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(126,87,194,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(126,87,194,0.06)')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3 M21 8V5a2 2 0 0 0-2-2h-3 M3 16v3a2 2 0 0 0 2 2h3 M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
          Deep Focus
        </button>
      </div>

      {/* Session tabs */}
      <div className="card" style={{ padding: '5px', display: 'flex', gap: '4px', marginBottom: '28px' }}>
        {(['focus', 'shortBreak', 'longBreak'] as SessionType[]).map(type => (
          <button key={type} onClick={() => timer.switchSession(type)} disabled={timer.state.status === 'running'}
            className="flex-1 rounded-xl py-2.5 transition-all duration-200"
            style={{
              fontFamily: 'Outfit', fontSize: '13px', fontWeight: timer.state.sessionType === type ? '600' : '400',
              border: 'none', cursor: timer.state.status === 'running' ? 'default' : 'pointer',
              background: timer.state.sessionType === type ? SESSION_COLORS[type].bg : 'transparent',
              color: timer.state.sessionType === type ? SESSION_COLORS[type].text : '#b0a0cc',
            }}>
            {type === 'focus' ? 'Focus' : type === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', position: 'relative' }}>
        {/* Soft background glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '300px', height: '300px', borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 68%)`,
          pointerEvents: 'none', transition: 'background 0.8s ease',
          opacity: timer.state.status === 'running' ? 1 : 0.5,
        }} />

        <svg width="280" height="280" viewBox="0 0 280 280"
          className={timer.state.status === 'running' ? 'animate-ring-pulse' : ''}
          style={{ filter: timer.state.status === 'running' ? `drop-shadow(0 0 14px ${colors.glow})` : 'none', transition: 'filter 0.8s ease' }}>
          <defs>
            <filter id="gf">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={timer.state.sessionType === 'focus' ? '#7e57c2' : colors.stroke} />
              <stop offset="100%" stopColor={timer.state.sessionType === 'focus' ? '#ec407a' : colors.stroke} />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle cx="140" cy="140" r={RING_R} fill="none" stroke="rgba(126,87,194,0.1)" strokeWidth="10" />

          {/* Progress */}
          <circle cx="140" cy="140" r={RING_R} fill="none"
            stroke={timer.state.sessionType === 'focus' ? 'url(#ringGrad)' : colors.stroke}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={RING_CIRC} strokeDashoffset={dashOffset}
            transform="rotate(-90 140 140)"
            style={{ transition: timer.state.status === 'running' ? 'stroke-dashoffset 0.25s linear' : 'stroke-dashoffset 0.6s ease' }}
            filter="url(#gf)"
          />

          {/* Leading dot */}
          {progress > 0.01 && progress < 0.99 && (() => {
            const angle = (progress * 360 - 90) * (Math.PI / 180)
            const x = 140 + RING_R * Math.cos(angle)
            const y = 140 + RING_R * Math.sin(angle)
            return <circle cx={x} cy={y} r="7" fill={colors.stroke} style={{ filter: `drop-shadow(0 0 6px ${colors.stroke})`, transition: 'cx 0.25s linear, cy 0.25s linear' }} />
          })()}
        </svg>

        {/* Digits overlay */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'DM Mono', fontSize: 'clamp(44px,10vw,62px)', fontWeight: '400', color: '#1a1028', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {timer.display}
          </p>
          <p style={{ fontSize: '10px', color: colors.text, letterSpacing: '0.14em', marginTop: '8px', fontWeight: '700' }}>
            {SESSION_LABELS[timer.state.sessionType]}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '18px', marginBottom: '28px' }}>

        {/* Reset */}
        <button onClick={handleInterrupt} disabled={timer.state.status === 'idle'}
          style={{ width: '46px', height: '46px', borderRadius: '50%', border: '1.5px solid rgba(126,87,194,0.2)', background: 'white', color: timer.state.status === 'idle' ? '#ddd' : '#a08ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: timer.state.status === 'idle' ? 'default' : 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          onMouseEnter={e => { if (timer.state.status !== 'idle') (e.currentTarget as HTMLButtonElement).style.color = '#7e57c2' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = timer.state.status === 'idle' ? '#ddd' : '#a08ccc' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.89" /></svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={() => {
            if (timer.state.status === 'idle') timer.start()
            else if (timer.state.status === 'running') timer.pause()
            else if (timer.state.status === 'paused') timer.resume()
            else if (timer.state.status === 'completed') timer.nextSession()
          }}
          style={{
            width: '76px', height: '76px', borderRadius: '50%', border: 'none',
            background: timer.state.sessionType === 'focus'
              ? 'linear-gradient(135deg, #7e57c2, #ec407a)'
              : `linear-gradient(135deg, ${colors.stroke}, ${timer.state.sessionType === 'shortBreak' ? '#1b5e20' : '#004d40'})`,
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: `0 6px 24px ${colors.glow}, 0 2px 8px rgba(0,0,0,0.12)`,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.07)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
          {timer.state.status === 'completed' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          ) : timer.state.status === 'running' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ marginLeft: '3px' }}><polygon points="5 3 19 12 5 21 5 3" /></svg>
          )}
        </button>

        {/* Skip */}
        <button onClick={timer.nextSession}
          style={{ width: '46px', height: '46px', borderRadius: '50%', border: '1.5px solid rgba(126,87,194,0.2)', background: 'white', color: '#a08ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#7e57c2')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#a08ccc')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></svg>
        </button>
      </div>

      {/* Completion toast */}
      {completionMsg && (
        <div className="animate-toast card" style={{ padding: '14px 20px', marginBottom: '18px', borderLeft: `3px solid ${colors.stroke}`, textAlign: 'center', background: colors.bg }}>
          <p style={{ color: colors.text, fontSize: '14px', fontFamily: 'Outfit', fontWeight: '600' }}>{completionMsg}</p>
        </div>
      )}

      {/* Running badge */}
      {timer.state.status === 'running' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 14px', borderRadius: '99px', background: colors.pill, border: `1px solid ${colors.stroke}30` }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.stroke, animation: 'pulse-glow 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize: '11px', color: colors.text, fontWeight: '700', letterSpacing: '0.08em' }}>IN SESSION</span>
          </div>
        </div>
      )}

      {/* Active task */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <p style={{ fontSize: '11px', color: '#a08ccc', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: '600' }}>Working On</p>
          {activeTask && <button onClick={() => setActiveTask(null)} style={{ fontSize: '11px', color: '#c4b0e0', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>}
        </div>
        {activeTask ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', color: '#1a1028', fontWeight: '600' }}>{activeTask.title}</p>
              {activeTask.description && <p style={{ fontSize: '13px', color: '#a08ccc', marginTop: '2px' }}>{activeTask.description}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#a08ccc' }}>{activeTask.completedPomodoros}/{activeTask.estimatedPomodoros} 🍅</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {Array.from({ length: activeTask.estimatedPomodoros }).map((_, i) => (
                  <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < activeTask.completedPomodoros ? '#7e57c2' : 'rgba(126,87,194,0.15)' }} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
            {pendingTasks.length === 0 ? (
              <button onClick={() => onNavigate('tasks')} style={{ fontSize: '13px', color: '#7e57c2', background: 'rgba(126,87,194,0.08)', border: '1px solid rgba(126,87,194,0.2)', borderRadius: '99px', padding: '5px 14px', cursor: 'pointer', fontFamily: 'Outfit' }}>+ Add a task</button>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: '#c4b0e0', width: '100%', marginBottom: '4px' }}>Select a task:</p>
                {pendingTasks.slice(0, 3).map(t => (
                  <button key={t.id} onClick={() => setActiveTask(t.id)}
                    style={{ fontSize: '13px', color: '#7e57c2', background: 'rgba(126,87,194,0.07)', border: '1px solid rgba(126,87,194,0.15)', borderRadius: '99px', padding: '5px 14px', cursor: 'pointer', fontFamily: 'Outfit', transition: 'all 0.2s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(126,87,194,0.15)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(126,87,194,0.07)')}>
                    {t.title.length > 22 ? t.title.slice(0, 22) + '…' : t.title}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Session flow */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <p style={{ fontSize: '11px', color: '#a08ccc', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: '600', marginBottom: '12px' }}>Session Flow</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {Array.from({ length: data.settings.pomodorosBeforeLongBreak }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: i < timer.state.pomodoroCount ? 'rgba(126,87,194,0.18)' : i === timer.state.pomodoroCount && timer.state.sessionType === 'focus' ? 'rgba(126,87,194,0.07)' : 'rgba(126,87,194,0.04)',
                border: `2px solid ${i < timer.state.pomodoroCount ? '#7e57c2' : i === timer.state.pomodoroCount && timer.state.sessionType === 'focus' ? 'rgba(126,87,194,0.45)' : 'rgba(126,87,194,0.12)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', transition: 'all 0.3s',
              }}>
                {i < timer.state.pomodoroCount
                  ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7e57c2" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  : <span style={{ color: '#c4b0e0', fontFamily: 'DM Mono', fontSize: '10px' }}>{i + 1}</span>}
              </div>
              {i < data.settings.pomodorosBeforeLongBreak - 1 && <div style={{ width: '14px', height: '1.5px', background: 'rgba(126,87,194,0.12)' }} />}
            </div>
          ))}
          <div style={{ width: '1px', height: '24px', background: 'rgba(126,87,194,0.12)', margin: '0 4px' }} />
          <div style={{ padding: '4px 10px', borderRadius: '8px', background: timer.state.sessionType === 'longBreak' ? 'rgba(0,137,123,0.1)' : 'rgba(126,87,194,0.04)', border: `1px solid ${timer.state.sessionType === 'longBreak' ? 'rgba(0,137,123,0.3)' : 'rgba(126,87,194,0.1)'}`, fontSize: '11px', color: timer.state.sessionType === 'longBreak' ? '#00897b' : '#c4b0e0', fontWeight: '500' }}>
            Long Break
          </div>
        </div>
      </div>
    </div>
  )
}
