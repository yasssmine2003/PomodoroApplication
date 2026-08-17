import { useState } from 'react'
import { useApp } from '../store'

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const { updateSettings } = useApp()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [goal, setGoal] = useState(6)

  const handleFinish = () => {
    if (name.trim()) updateSettings({ userName: name.trim(), dailyGoal: goal })
    onDone()
  }

  const steps = [
    { icon: '✦', title: 'Welcome to YasFlow', sub: 'Your premium Pomodoro workspace.', body: 'Focus deeply. Build habits. Track your progress. Everything you need to do your best work — beautifully designed.', cta: 'Get started' },
    { icon: '🌸', title: "What's your name?", sub: "We'll personalize your experience.", body: null, cta: name.trim() ? `Let's go, ${name.trim()} →` : 'Continue →' },
    { icon: '🎯', title: 'Set your daily goal', sub: 'How many focus sessions per day?', body: null, cta: 'Start focusing ✦' },
  ]
  const current = steps[step]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'linear-gradient(135deg, #f3efff 0%, #fce8f3 60%, #fff8f0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,64,122,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(126,87,194,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="animate-fade-up" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', marginBottom: '40px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #7e57c2, #ec407a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(126,87,194,0.35)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </div>
          <span style={{ fontFamily: 'Fraunces', fontSize: '20px', color: '#1a1028' }}>YasFlow</span>
        </div>

        {/* Icon */}
        <div className="animate-float" style={{ fontSize: '52px', marginBottom: '20px' }}>{current.icon}</div>

        <h1 style={{ fontFamily: 'Fraunces', fontSize: 'clamp(28px,6vw,38px)', fontWeight: '400', color: '#1a1028', lineHeight: 1.15, marginBottom: '10px' }}>
          {current.title}
        </h1>
        <p style={{ fontFamily: 'Outfit', fontSize: '15px', color: '#a08ccc', marginBottom: current.body ? '20px' : '32px', fontWeight: '500' }}>{current.sub}</p>

        {current.body && (
          <p style={{ fontFamily: 'Outfit', fontSize: '16px', color: '#7e6699', lineHeight: 1.7, marginBottom: '40px' }}>{current.body}</p>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <div style={{ marginBottom: '36px' }}>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && setStep(2)}
              placeholder="Your first name"
              style={{ width: '100%', background: 'white', border: '2px solid rgba(126,87,194,0.25)', borderRadius: '14px', padding: '16px 20px', color: '#1a1028', fontFamily: 'Outfit', fontSize: '18px', outline: 'none', textAlign: 'center', transition: 'border-color 0.2s', boxShadow: '0 2px 12px rgba(126,87,194,0.08)' }}
              onFocus={e => (e.target.style.borderColor = '#7e57c2')} onBlur={e => (e.target.style.borderColor = 'rgba(126,87,194,0.25)')} />
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {[3, 4, 6, 8, 10, 12].map(n => (
                <button key={n} onClick={() => setGoal(n)}
                  style={{ width: '58px', height: '58px', borderRadius: '14px', fontSize: '20px', fontFamily: 'DM Mono', fontWeight: '600', border: `2px solid ${goal === n ? '#7e57c2' : 'rgba(126,87,194,0.15)'}`, background: goal === n ? 'linear-gradient(135deg, rgba(126,87,194,0.12), rgba(236,64,122,0.08))' : 'white', color: goal === n ? '#7e57c2' : '#a08ccc', cursor: 'pointer', transition: 'all 0.2s', boxShadow: goal === n ? '0 4px 14px rgba(126,87,194,0.2)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
                  {n}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: '#a08ccc', fontWeight: '500' }}>{goal * 25} minutes of focused work per day</p>
          </div>
        )}

        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '7px', marginBottom: '24px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: i === step ? '22px' : '7px', height: '7px', borderRadius: '4px', background: i === step ? 'linear-gradient(90deg, #7e57c2, #ec407a)' : 'rgba(126,87,194,0.15)', transition: 'all 0.3s' }} />
          ))}
        </div>

        {/* CTA */}
        <button onClick={() => { if (step < 2) setStep(s => s + 1); else handleFinish() }}
          style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #7e57c2, #ec407a)', color: 'white', fontSize: '16px', fontFamily: 'Outfit', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 24px rgba(126,87,194,0.3)', transition: 'all 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          {current.cta}
        </button>

        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            style={{ marginTop: '14px', background: 'none', border: 'none', color: '#c4b0e0', fontSize: '14px', cursor: 'pointer', fontFamily: 'Outfit' }}>
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}
