import { useState } from 'react'
import { useApp } from '../store'

export default function Settings() {
  const { data, updateSettings, addCustomQuote } = useApp()
  const s = data.settings
  const [quoteInput, setQuoteInput] = useState('')
  const [saved, setSaved] = useState(false)

  const update = (key: keyof typeof s, value: string | number | boolean) => {
    updateSettings({ [key]: value })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleAddQuote = () => {
    const q = quoteInput.trim()
    if (q) { addCustomQuote(q); setQuoteInput('') }
  }

  const inputStyle: React.CSSProperties = {
    background: '#faf7f4', border: '1.5px solid rgba(126,87,194,0.15)',
    borderRadius: '10px', padding: '10px 14px', color: '#1a1028', fontFamily: 'Outfit', fontSize: '14px', outline: 'none',
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces', fontSize: '32px', fontWeight: '400', color: '#1a1028' }}>Settings</h1>
          <p style={{ fontSize: '14px', color: '#a08ccc', marginTop: '4px' }}>Personalize your experience.</p>
        </div>
        {saved && (
          <span className="animate-fade-in" style={{ fontSize: '13px', color: '#43a047', background: 'rgba(67,160,71,0.1)', borderRadius: '99px', padding: '5px 14px', fontWeight: '600' }}>
            ✓ Saved
          </span>
        )}
      </div>

      {/* Profile */}
      <Section title="Profile">
        <label style={{ fontSize: '13px', color: '#a08ccc', display: 'block', marginBottom: '6px', fontWeight: '500' }}>Your name</label>
        <input value={s.userName} placeholder="Yasmine"
          onChange={e => update('userName', e.target.value)}
          style={{ ...inputStyle, width: '100%' }}
          onFocus={e => (e.target.style.borderColor = '#7e57c2')} onBlur={e => (e.target.style.borderColor = 'rgba(126,87,194,0.15)')} />
      </Section>

      {/* Timer */}
      <Section title="Timer Durations">
        {[
          { key: 'focusDuration' as const,      label: 'Focus session',  min: 5,  max: 90 },
          { key: 'shortBreakDuration' as const, label: 'Short break',    min: 1,  max: 30 },
          { key: 'longBreakDuration' as const,  label: 'Long break',     min: 5,  max: 60 },
        ].map(item => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#1a1028', fontWeight: '500' }}>{item.label}</p>
              <p style={{ fontSize: '12px', color: '#c4b0e0', marginTop: '2px' }}>{item.min}–{item.max} minutes</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => update(item.key, Math.max(item.min, s[item.key] - 5))}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid rgba(126,87,194,0.2)', background: 'white', color: '#7e57c2', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>−</button>
              <span style={{ fontFamily: 'DM Mono', fontSize: '18px', color: '#1a1028', minWidth: '40px', textAlign: 'center', fontWeight: '500' }}>{s[item.key]}</span>
              <button onClick={() => update(item.key, Math.min(item.max, s[item.key] + 5))}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid rgba(126,87,194,0.2)', background: 'white', color: '#7e57c2', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>+</button>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#1a1028', fontWeight: '500' }}>Pomodoros before long break</p>
            <p style={{ fontSize: '12px', color: '#c4b0e0', marginTop: '2px' }}>2–8 sessions</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => update('pomodorosBeforeLongBreak', Math.max(2, s.pomodorosBeforeLongBreak - 1))}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid rgba(126,87,194,0.2)', background: 'white', color: '#7e57c2', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>−</button>
            <span style={{ fontFamily: 'DM Mono', fontSize: '18px', color: '#1a1028', minWidth: '24px', textAlign: 'center', fontWeight: '500' }}>{s.pomodorosBeforeLongBreak}</span>
            <button onClick={() => update('pomodorosBeforeLongBreak', Math.min(8, s.pomodorosBeforeLongBreak + 1))}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid rgba(126,87,194,0.2)', background: 'white', color: '#7e57c2', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>+</button>
          </div>
        </div>
      </Section>

      {/* Daily goal */}
      <Section title="Daily Goals">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#1a1028', fontWeight: '500' }}>Daily Pomodoro goal</p>
            <p style={{ fontSize: '12px', color: '#c4b0e0', marginTop: '2px' }}>Target per day</p>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {[4, 6, 8, 10, 12].map(n => (
              <button key={n} onClick={() => update('dailyGoal', n)}
                style={{ width: '36px', height: '36px', borderRadius: '9px', fontSize: '14px', border: `1.5px solid ${s.dailyGoal === n ? '#7e57c2' : 'rgba(126,87,194,0.15)'}`, background: s.dailyGoal === n ? 'rgba(126,87,194,0.1)' : 'white', color: s.dailyGoal === n ? '#7e57c2' : '#a08ccc', cursor: 'pointer', fontFamily: 'DM Mono', fontWeight: s.dailyGoal === n ? '600' : '400', transition: 'all 0.2s' }}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Automation */}
      <Section title="Automation">
        {[
          { key: 'autoStartBreak' as const, label: 'Auto-start breaks',   desc: 'Automatically start break after focus session' },
          { key: 'autoStartFocus' as const, label: 'Auto-start focus',    desc: 'Automatically start focus after break ends' },
        ].map(item => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ flex: 1, marginRight: '16px' }}>
              <p style={{ fontSize: '14px', color: '#1a1028', fontWeight: '500' }}>{item.label}</p>
              <p style={{ fontSize: '12px', color: '#c4b0e0', marginTop: '2px' }}>{item.desc}</p>
            </div>
            <Toggle checked={s[item.key]} onChange={v => update(item.key, v)} />
          </div>
        ))}
      </Section>

      {/* Sound & notifications */}
      <Section title="Sound & Notifications">
        {[
          { key: 'soundEnabled' as const,         label: 'Sound effects',           desc: 'Play tones when sessions complete' },
          { key: 'notificationsEnabled' as const, label: 'Browser notifications',   desc: 'Get notified even when the tab is in background' },
        ].map(item => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ flex: 1, marginRight: '16px' }}>
              <p style={{ fontSize: '14px', color: '#1a1028', fontWeight: '500' }}>{item.label}</p>
              <p style={{ fontSize: '12px', color: '#c4b0e0', marginTop: '2px' }}>{item.desc}</p>
            </div>
            <Toggle checked={s[item.key]} onChange={v => {
              if (item.key === 'notificationsEnabled' && v && Notification.permission === 'default') {
                Notification.requestPermission().then(perm => { if (perm === 'granted') update(item.key, true) })
              } else update(item.key, v)
            }} />
          </div>
        ))}
      </Section>

      {/* Custom quotes */}
      <Section title="Motivational Quotes">
        <p style={{ fontSize: '13px', color: '#a08ccc', marginBottom: '12px' }}>
          {data.customQuotes.length > 0 ? `You have ${data.customQuotes.length} custom quote${data.customQuotes.length !== 1 ? 's' : ''} in the rotation.` : 'Add your own quotes to the daily rotation.'}
        </p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input value={quoteInput} onChange={e => setQuoteInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddQuote()}
            placeholder='"Small progress is still progress."'
            style={{ ...inputStyle, flex: 1 }}
            onFocus={e => (e.target.style.borderColor = '#7e57c2')} onBlur={e => (e.target.style.borderColor = 'rgba(126,87,194,0.15)')} />
          <button onClick={handleAddQuote}
            style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(126,87,194,0.1)', border: '1.5px solid rgba(126,87,194,0.25)', color: '#7e57c2', cursor: 'pointer', fontSize: '13px', fontFamily: 'Outfit', fontWeight: '600', whiteSpace: 'nowrap' }}>
            Add
          </button>
        </div>
        {data.customQuotes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.customQuotes.map((q, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(126,87,194,0.05)', border: '1px solid rgba(126,87,194,0.12)' }}>
                <p style={{ fontSize: '13px', color: '#5c3d99', fontFamily: 'Fraunces', fontStyle: 'italic', lineHeight: 1.5 }}>"{q}"</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* About */}
      <div className="card" style={{ padding: '22px', textAlign: 'center', background: 'linear-gradient(135deg, #f3efff, #fce8f3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #7e57c2, #ec407a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(126,87,194,0.35)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </div>
          <span style={{ fontFamily: 'Fraunces', fontWeight: '400', color: '#1a1028', fontSize: '18px' }}>YasFlow</span>
        </div>
        <p style={{ fontSize: '12px', color: '#a08ccc' }}>Premium Pomodoro · Personal Edition</p>
        <p style={{ fontSize: '12px', color: '#c4b0e0', marginTop: '3px' }}>Focus on what matters. ✦</p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '20px 24px', marginBottom: '12px' }}>
      <p style={{ fontSize: '11px', color: '#a08ccc', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700', marginBottom: '16px' }}>{title}</p>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      style={{ width: '46px', height: '26px', borderRadius: '13px', flexShrink: 0, background: checked ? 'linear-gradient(135deg, #7e57c2, #ec407a)' : 'rgba(126,87,194,0.12)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', boxShadow: checked ? '0 2px 10px rgba(126,87,194,0.3)' : 'none' }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: checked ? '23px' : '3px', transition: 'left 0.25s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
    </button>
  )
}
