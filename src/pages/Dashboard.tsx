import { useState, useEffect } from 'react'
import { useApp, getTodayStats } from '../store'
import { getRandomQuote } from '../data/quotes'
import type { Page } from '../types'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}`
}

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ec407a', medium: '#fb8c00', low: '#43a047',
}

interface Props { onNavigate: (p: Page) => void }

export default function Dashboard({ onNavigate }: Props) {
  const { data } = useApp()
  const stats = getTodayStats(data)
  const [quote, setQuote] = useState(() => getRandomQuote(data.customQuotes))
  const activeTask = data.activeTaskId ? data.tasks.find(t => t.id === data.activeTaskId) : null
  const pendingTasks = data.tasks.filter(t => t.status !== 'completed').slice(0, 4)
  const progress = Math.min(1, stats.pomodorosCompleted / data.settings.dailyGoal)
  const progressPct = Math.round(progress * 100)

  useEffect(() => {
    const id = setInterval(() => setQuote(getRandomQuote(data.customQuotes)), 30000)
    return () => clearInterval(id)
  }, [data.customQuotes])

  return (
    <div
  className="animate-fade-up"
  style={{
    paddingTop: 'calc(72px + 28px)', // ← hauteur du header + marge souhaitée
    paddingBottom: '100px',
    paddingLeft: '24px',
    paddingRight: '24px',
    maxWidth: '720px',
    margin: '0 auto',
  }}
>

      {/* ── Header ──────────────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontFamily: 'Outfit', fontSize: '13px', color: '#a08ccc', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
          {formatDate()}
        </p>
        <h1 style={{ fontFamily: 'Fraunces', fontSize: 'clamp(28px,5vw,42px)', fontWeight: '400', color: '#1a1028', lineHeight: 1.1 }}>
          {greeting()}{data.settings.userName ? `, ${data.settings.userName}` : ''} ✦
        </h1>
        <p style={{ fontFamily: 'Outfit', fontSize: '16px', color: '#7e57c2', marginTop: '6px', fontWeight: '500' }}>
          Ready to enter your flow state?
        </p>
      </div>

      {/* ── Progress hero card ───────────────────────── */}
      <div className="card" style={{ padding: '24px', marginBottom: '16px', background: 'linear-gradient(135deg, #f3efff 0%, #fce8f3 100%)', border: '1px solid rgba(126,87,194,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#a08ccc', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '500' }}>Today's Progress</p>
            <p style={{ fontFamily: 'DM Mono', fontSize: '44px', fontWeight: '500', color: '#1a1028', lineHeight: 1 }}>
              {progressPct}<span style={{ fontSize: '24px', color: '#7e57c2' }}>%</span>
            </p>
          </div>
          <div style={{
            width: '68px', height: '68px', borderRadius: '50%',
            background: `conic-gradient(#7e57c2 ${progressPct * 3.6}deg, rgba(126,87,194,0.12) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: '13px', color: '#7e57c2', fontWeight: '500' }}>
                {stats.pomodorosCompleted}/{data.settings.dailyGoal}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '8px', background: 'rgba(126,87,194,0.12)', borderRadius: '99px', overflow: 'hidden', marginBottom: '18px' }}>
          <div style={{
            height: '100%', borderRadius: '99px',
            background: 'linear-gradient(90deg, #7e57c2, #ec407a)',
            width: `${progressPct}%`,
            transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1)',
            boxShadow: '0 0 10px rgba(126,87,194,0.4)',
          }} />
        </div>

        {/* Stat pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {[
            { label: 'Focus Time', value: formatMinutes(stats.focusMinutes), icon: '⏱', color: '#7e57c2', bg: 'rgba(126,87,194,0.1)' },
            { label: 'Streak',     value: `${data.streak}d`,                 icon: '🔥', color: '#ec407a', bg: 'rgba(236,64,122,0.08)' },
            { label: 'Done',       value: String(data.tasks.filter(t => t.status === 'completed').length), icon: '✓', color: '#43a047', bg: 'rgba(67,160,71,0.08)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: '12px', background: s.bg }}>
              <p style={{ fontSize: '16px', marginBottom: '3px' }}>{s.icon}</p>
              <p style={{ fontFamily: 'DM Mono', fontSize: '20px', color: s.color, fontWeight: '500' }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: '#a08ccc', marginTop: '2px' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active task / Start CTA ──────────────────── */}
      {activeTask ? (
        <div className="card glow-violet" style={{ padding: '20px', marginBottom: '14px', border: '1px solid rgba(126,87,194,0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '11px', color: '#7e57c2', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600' }}>Current Focus</p>
            <span style={{ fontSize: '12px', color: '#a08ccc', fontFamily: 'DM Mono' }}>
              {activeTask.completedPomodoros}/{activeTask.estimatedPomodoros} 🍅
            </span>
          </div>
          <p style={{ fontSize: '17px', color: '#1a1028', fontWeight: '600', marginBottom: '14px', fontFamily: 'Outfit' }}>{activeTask.title}</p>
          <button onClick={() => onNavigate('timer')}
            className="w-full rounded-xl py-3 font-semibold transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #7e57c2, #ec407a)', color: 'white', fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(126,87,194,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            Continue Focus Session →
          </button>
        </div>
      ) : (
        <button onClick={() => onNavigate('timer')}
          className="w-full card transition-all duration-200"
          style={{ padding: '18px 20px', cursor: 'pointer', textAlign: 'left', marginBottom: '14px', border: '1.5px dashed rgba(126,87,194,0.3)', background: 'rgba(243,239,255,0.5)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(126,87,194,0.07)'; (e.currentTarget as HTMLButtonElement).style.borderStyle = 'solid' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(243,239,255,0.5)'; (e.currentTarget as HTMLButtonElement).style.borderStyle = 'dashed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #7e57c2, #ec407a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(126,87,194,0.35)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ marginLeft: '2px' }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '15px', color: '#1a1028', fontWeight: '600' }}>Start a focus session</p>
              <p style={{ fontSize: '13px', color: '#a08ccc', marginTop: '2px' }}>{data.settings.focusDuration} min · Deep work</p>
            </div>
            <svg style={{ marginLeft: 'auto', color: '#7e57c2' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </button>
      )}

      {/* ── Quote card ───────────────────────────────── */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: '16px', background: 'linear-gradient(135deg, rgba(252,232,243,0.7), rgba(243,239,255,0.7))', borderLeft: '3px solid #ec407a' }}>
        <p style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: '16px', color: '#5c3d99', lineHeight: 1.6 }}>
          "{quote}"
        </p>
      </div>

      {/* ── Pending tasks ────────────────────────────── */}
      {pendingTasks.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', color: '#a08ccc', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>Pending</p>
            <button onClick={() => onNavigate('tasks')} style={{ fontSize: '13px', color: '#7e57c2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
              View all →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingTasks.map(task => (
              <div key={task.id} className="card transition-all duration-200"
                style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: PRIORITY_COLORS[task.priority] }} />
                <p style={{ flex: 1, fontSize: '14px', color: '#1a1028', fontFamily: 'Outfit', fontWeight: '500' }}>{task.title}</p>
                {task.estimatedPomodoros > 0 && (
                  <span style={{ fontSize: '12px', color: '#a08ccc', fontFamily: 'DM Mono' }}>
                    {task.completedPomodoros}/{task.estimatedPomodoros} 🍅
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────── */}
      {data.tasks.length === 0 && (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center', marginTop: '16px', background: 'linear-gradient(135deg, #f3efff, #fce8f3)' }}>
          <div className="animate-float" style={{ fontSize: '40px', marginBottom: '16px' }}>🌱</div>
          <p style={{ fontFamily: 'Fraunces', fontSize: '20px', color: '#5c3d99', marginBottom: '8px' }}>Start your journey</p>
          <p style={{ fontSize: '14px', color: '#a08ccc', marginBottom: '20px', lineHeight: 1.6 }}>
            Add your first task and begin building your focus practice.
          </p>
          <button onClick={() => onNavigate('tasks')}
            style={{ background: 'linear-gradient(135deg, #7e57c2, #ec407a)', border: 'none', color: 'white', padding: '10px 28px', borderRadius: '99px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: '600', boxShadow: '0 4px 14px rgba(126,87,194,0.3)' }}>
            Add a task
          </button>
        </div>
      )}
    </div>
  )
}
