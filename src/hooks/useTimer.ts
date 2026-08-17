import { useState, useEffect, useRef, useCallback } from 'react'
import type { TimerState, SessionType, Settings } from '../types'

function msToDisplay(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function playTone(type: 'complete' | 'start') {
  try {
    const ctx = new AudioContext()
    const freqs = type === 'complete' ? [523, 659, 784] : [440, 523]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.15
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.18, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      osc.start(t)
      osc.stop(t + 0.4)
    })
  } catch {
    // AudioContext not available
  }
}

export function useTimer(settings: Settings, onComplete?: (type: SessionType) => void) {
  const getDuration = useCallback((type: SessionType): number => {
    if (type === 'focus') return settings.focusDuration * 60 * 1000
    if (type === 'shortBreak') return settings.shortBreakDuration * 60 * 1000
    return settings.longBreakDuration * 60 * 1000
  }, [settings])

  const [state, setState] = useState<TimerState>(() => ({
    status: 'idle',
    sessionType: 'focus',
    remainingMs: settings.focusDuration * 60 * 1000,
    totalMs: settings.focusDuration * 60 * 1000,
    startTimestamp: null,
    pomodoroCount: 0,
  }))

  const [display, setDisplay] = useState(() => msToDisplay(settings.focusDuration * 60 * 1000))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  // Recompute display every 250ms when running
  useEffect(() => {
    if (state.status !== 'running') {
      setDisplay(msToDisplay(state.remainingMs))
      return
    }

    intervalRef.current = setInterval(() => {
      const s = stateRef.current
      if (s.status !== 'running' || s.startTimestamp === null) return
      const elapsed = Date.now() - s.startTimestamp
      const remaining = Math.max(0, s.remainingMs - elapsed)
      setDisplay(msToDisplay(remaining))

      if (remaining === 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setState(prev => ({ ...prev, status: 'completed' }))
      }
    }, 250)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.status, state.startTimestamp])

  // Handle completion
  useEffect(() => {
    if (state.status !== 'completed') return
    if (settings.soundEnabled) playTone('complete')
    if (settings.notificationsEnabled && Notification.permission === 'granted') {
      const label = state.sessionType === 'focus' ? 'Focus session complete!' : 'Break over!'
      new Notification('FlowTime', { body: label, icon: '/favicon.ico' })
    }
    onComplete?.(state.sessionType)
  }, [state.status])

  const getRemainingMs = useCallback((): number => {
    if (state.status !== 'running' || state.startTimestamp === null) return state.remainingMs
    return Math.max(0, state.remainingMs - (Date.now() - state.startTimestamp))
  }, [state])

  const getProgress = useCallback((): number => {
    const remaining = getRemainingMs()
    return 1 - remaining / state.totalMs
  }, [getRemainingMs, state.totalMs])

  const start = useCallback(() => {
    if (settings.soundEnabled) playTone('start')
    setState(prev => ({
      ...prev,
      status: 'running',
      startTimestamp: Date.now(),
    }))
  }, [settings.soundEnabled])

  const pause = useCallback(() => {
    setState(prev => {
      if (prev.status !== 'running' || prev.startTimestamp === null) return prev
      const elapsed = Date.now() - prev.startTimestamp
      return {
        ...prev,
        status: 'paused',
        remainingMs: Math.max(0, prev.remainingMs - elapsed),
        startTimestamp: null,
      }
    })
  }, [])

  const resume = useCallback(() => {
    if (settings.soundEnabled) playTone('start')
    setState(prev => ({
      ...prev,
      status: 'running',
      startTimestamp: Date.now(),
    }))
  }, [settings.soundEnabled])

  const reset = useCallback((type?: SessionType) => {
    const t = type ?? state.sessionType
    const dur = getDuration(t)
    setState({
      status: 'idle',
      sessionType: t,
      remainingMs: dur,
      totalMs: dur,
      startTimestamp: null,
      pomodoroCount: state.pomodoroCount,
    })
  }, [state.sessionType, state.pomodoroCount, getDuration])

  const switchSession = useCallback((type: SessionType) => {
    const dur = getDuration(type)
    setState({
      status: 'idle',
      sessionType: type,
      remainingMs: dur,
      totalMs: dur,
      startTimestamp: null,
      pomodoroCount: state.pomodoroCount,
    })
  }, [state.pomodoroCount, getDuration])

  const incrementPomodoro = useCallback(() => {
    setState(prev => ({ ...prev, pomodoroCount: prev.pomodoroCount + 1 }))
  }, [])

  const nextSession = useCallback(() => {
    setState(prev => {
      const isLongBreak = (prev.pomodoroCount + 1) % settings.pomodorosBeforeLongBreak === 0
      const nextType: SessionType = prev.sessionType === 'focus'
        ? (isLongBreak ? 'longBreak' : 'shortBreak')
        : 'focus'
      const newCount = prev.sessionType === 'focus' ? prev.pomodoroCount + 1 : prev.pomodoroCount
      const dur = getDuration(nextType)
      return {
        status: 'idle',
        sessionType: nextType,
        remainingMs: dur,
        totalMs: dur,
        startTimestamp: null,
        pomodoroCount: newCount,
      }
    })
  }, [settings.pomodorosBeforeLongBreak, getDuration])

  return {
    state,
    display,
    getProgress,
    getRemainingMs,
    start, pause, resume, reset, switchSession, nextSession, incrementPomodoro,
  }
}
