import { useApp, getWeeklyStats, getTodayStats } from '../store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

function formatMinutes(m: number): string {
  if (m === 0) return '0m'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60); const rem = m % 60
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid rgba(126,87,194,0.2)', borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 16px rgba(126,87,194,0.12)' }}>
      <p style={{ fontSize: '12px', color: '#a08ccc', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontFamily: 'DM Mono', fontSize: '16px', color: '#7e57c2', fontWeight: '500' }}>{formatMinutes(payload[0].value)}</p>
    </div>
  )
}

export default function Statistics() {
  const { data } = useApp()
  const weekly = getWeeklyStats(data)
  const todayStats = getTodayStats(data)
  const allSessions = data.sessions.filter(s => s.type === 'focus' && s.completed)
  const totalMinutes = allSessions.reduce((acc, s) => acc + s.durationMinutes, 0)
  const totalPomodoros = allSessions.length
  const interrupted = data.sessions.filter(s => s.type === 'focus' && !s.completed).length
  const dailyAvg = (() => {
    if (!allSessions.length) return 0
    const dates = new Set(allSessions.map(s => s.date))
    return Math.round(totalMinutes / dates.size)
  })()
  const bestDay = (() => {
    const byDate: Record<string, number> = {}
    allSessions.forEach(s => { byDate[s.date] = (byDate[s.date] ?? 0) + s.durationMinutes })
    return Math.max(0, ...Object.values(byDate))
  })()
  const completedTasks = data.tasks.filter(t => t.status === 'completed').length

  return (
    <div className="animate-fade-up" style={{ padding: '28px 24px 100px', maxWidth: '720px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Fraunces', fontSize: '32px', fontWeight: '400', color: '#1a1028' }}>Statistics</h1>
        <p style={{ fontSize: '14px', color: '#a08ccc', marginTop: '4px' }}>Your focus journey, visualized.</p>
      </div>

      {/* Streak hero */}
      <div className="card" style={{ padding: '28px', marginBottom: '16px', background: 'linear-gradient(135deg, #f3efff 0%, #fce8f3 100%)', border: '1px solid rgba(126,87,194,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '52px', lineHeight: 1 }}>🔥</div>
          <div>
            <p style={{ fontFamily: 'DM Mono', fontSize: '52px', fontWeight: '500', color: '#1a1028', lineHeight: 1 }}>{data.streak}</p>
            <p style={{ fontSize: '14px', color: '#7e57c2', marginTop: '4px', fontWeight: '500' }}>
              {data.streak === 0 ? 'Start your streak today!' : data.streak === 1 ? 'Day streak — keep going!' : 'Day streak — you\'re on fire!'}
            </p>
          </div>
        </div>
        {data.streak > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: Math.min(14, data.streak) }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: '7px', borderRadius: '4px', background: `linear-gradient(90deg, #7e57c2, #ec407a)`, opacity: 0.3 + (i / Math.min(14, data.streak)) * 0.7 }} />
              ))}
              {data.streak < 14 && Array.from({ length: 14 - data.streak }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: '7px', borderRadius: '4px', background: 'rgba(126,87,194,0.1)' }} />
              ))}
            </div>
            <p style={{ fontSize: '11px', color: '#a08ccc', marginTop: '6px' }}>Last 14 days progress</p>
          </div>
        )}
      </div>

      {/* Weekly chart */}
      <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#a08ccc', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px', fontWeight: '600' }}>This Week</p>
            <p style={{ fontFamily: 'Fraunces', fontSize: '20px', color: '#1a1028', fontWeight: '400' }}>Focus Time</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'DM Mono', fontSize: '24px', color: '#7e57c2', fontWeight: '500' }}>{formatMinutes(weekly.reduce((a, d) => a + d.minutes, 0))}</p>
            <p style={{ fontSize: '12px', color: '#a08ccc', marginTop: '2px' }}>total this week</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekly} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fill: '#a08ccc', fontSize: 12, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(126,87,194,0.05)', radius: 4 }} />
            <Bar dataKey="minutes" fill="url(#barGrad)" radius={[8, 8, 2, 2]} />
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7e57c2" />
                <stop offset="100%" stopColor="#ec407a" stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginTop: '10px' }}>
          {weekly.map(day => (
            <div key={day.date} style={{ textAlign: 'center' }}>
              <div style={{ height: '3px', borderRadius: '2px', marginBottom: '5px', background: day.minutes > 0 ? 'linear-gradient(90deg, #7e57c2, #ec407a)' : 'rgba(126,87,194,0.08)' }} />
              <span style={{ fontSize: '11px', color: '#c4b0e0', fontFamily: 'DM Mono' }}>{day.pomodoros > 0 ? day.pomodoros : '·'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Area trend */}
      {allSessions.length > 3 && (
        <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#a08ccc', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Trend</p>
          <p style={{ fontFamily: 'Fraunces', fontSize: '20px', color: '#1a1028', fontWeight: '400', marginBottom: '16px' }}>Focus Over Time</p>
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={weekly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7e57c2" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ec407a" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: '#a08ccc', fontSize: 11, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="minutes" stroke="#7e57c2" strokeWidth={2.5} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Total Focus',  value: formatMinutes(totalMinutes), icon: '⏱', color: '#7e57c2', bg: 'rgba(126,87,194,0.07)' },
          { label: 'Pomodoros',    value: String(totalPomodoros),       icon: '🍅', color: '#ec407a', bg: 'rgba(236,64,122,0.07)' },
          { label: 'Interrupted',  value: String(interrupted),          icon: '⚡', color: '#fb8c00', bg: 'rgba(251,140,0,0.07)'  },
          { label: 'Tasks Done',   value: String(completedTasks),       icon: '✓',  color: '#43a047', bg: 'rgba(67,160,71,0.07)'  },
          { label: 'Daily Avg',    value: formatMinutes(dailyAvg),      icon: '📈', color: '#7e57c2', bg: 'rgba(126,87,194,0.07)' },
          { label: 'Best Day',     value: formatMinutes(bestDay),       icon: '🏆', color: '#fb8c00', bg: 'rgba(251,140,0,0.07)'  },
          { label: 'Today',        value: formatMinutes(todayStats.focusMinutes), icon: '☀', color: '#ec407a', bg: 'rgba(236,64,122,0.07)' },
          { label: 'Streak',       value: `${data.streak}d`,            icon: '🔥', color: '#ec407a', bg: 'rgba(236,64,122,0.07)' },
        ].map(card => (
          <div key={card.label} className="card transition-all duration-200" style={{ padding: '18px 20px', background: card.bg, border: '1px solid rgba(126,87,194,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#a08ccc', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>{card.label}</p>
                <p style={{ fontFamily: 'DM Mono', fontSize: '28px', fontWeight: '500', color: '#1a1028', lineHeight: 1 }}>{card.value}</p>
              </div>
              <span style={{ fontSize: '22px' }}>{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="card" style={{ padding: '24px' }}>
        <p style={{ fontSize: '12px', color: '#a08ccc', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' }}>Achievements</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'First Focus',   desc: 'Complete your first Pomodoro',   unlocked: totalPomodoros >= 1,   icon: '🌱' },
            { label: 'Flow State',    desc: 'Complete 10 Pomodoros',           unlocked: totalPomodoros >= 10,  icon: '⚡' },
            { label: 'Deep Worker',   desc: 'Complete 50 Pomodoros',           unlocked: totalPomodoros >= 50,  icon: '🎯' },
            { label: 'Century',       desc: 'Complete 100 Pomodoros',          unlocked: totalPomodoros >= 100, icon: '💫' },
            { label: 'Consistent',    desc: 'Reach a 7-day streak',            unlocked: data.streak >= 7,      icon: '🔥' },
            { label: 'Unstoppable',   desc: 'Reach a 30-day streak',           unlocked: data.streak >= 30,     icon: '🏆' },
            { label: 'Task Master',   desc: 'Complete 10 tasks',               unlocked: completedTasks >= 10,  icon: '✨' },
            { label: 'Hour of Power', desc: 'Focus for 60 minutes in one day', unlocked: bestDay >= 60,         icon: '⏱' },
          ].map(ach => (
            <div key={ach.label} style={{
              display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px',
              borderRadius: '14px',
              background: ach.unlocked ? 'linear-gradient(135deg, rgba(126,87,194,0.06), rgba(236,64,122,0.04))' : 'rgba(126,87,194,0.03)',
              border: `1.5px solid ${ach.unlocked ? 'rgba(126,87,194,0.2)' : 'rgba(126,87,194,0.08)'}`,
              opacity: ach.unlocked ? 1 : 0.55, transition: 'all 0.3s',
            }}>
              <span style={{ fontSize: '26px', filter: ach.unlocked ? 'none' : 'grayscale(1)' }}>{ach.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', color: ach.unlocked ? '#1a1028' : '#a08ccc', fontWeight: '600' }}>{ach.label}</p>
                <p style={{ fontSize: '12px', color: '#c4b0e0', marginTop: '2px' }}>{ach.desc}</p>
              </div>
              {ach.unlocked && (
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(67,160,71,0.12)', border: '1.5px solid rgba(67,160,71,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#43a047" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
