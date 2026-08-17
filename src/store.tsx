import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { AppData, Task, Settings, PomodoroSession } from './types'
import {
  auth as authApi,
  tasks as tasksApi,
  sessions as sessionsApi,
  settingsApi,
  appdata,
  getToken,
  setToken,
  clearToken,
  isAuthenticated,
  type AuthPayload,
} from './api'

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosBeforeLongBreak: 4,
  autoStartBreak: false,
  autoStartFocus: false,
  soundEnabled: true,
  notificationsEnabled: true,
  dailyGoal: 6,
  userName: '',
}

const DEFAULT_DATA: AppData = {
  tasks: [],
  sessions: [],
  settings: DEFAULT_SETTINGS,
  streak: 0,
  lastActiveDate: null,
  activeTaskId: null,
  customQuotes: [],
}

// ─── localStorage helpers (offline fallback) ──────────────────────────────────

function loadLocalData(): AppData {
  try {
    const raw = localStorage.getItem('flowtime-data')
    if (!raw) return DEFAULT_DATA
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_DATA, ...parsed, settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) } }
  } catch {
    return DEFAULT_DATA
  }
}

function saveLocalData(data: AppData) {
  localStorage.setItem('flowtime-data', JSON.stringify(data))
}

// ─── Context Types ────────────────────────────────────────────────────────────

interface AuthState {
  loggedIn: boolean
  email: string | null
  loading: boolean
}

interface AppContextType {
  data: AppData
  auth: AuthState
  login: (payload: AuthPayload) => Promise<void>
  register: (payload: AuthPayload) => Promise<void>
  logout: () => void
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros'>) => Promise<string>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setActiveTask: (id: string | null) => Promise<void>
  recordSession: (session: Omit<PomodoroSession, 'id'>) => Promise<void>
  updateSettings: (updates: Partial<Settings>) => Promise<void>
  addCustomQuote: (q: string) => Promise<void>
  updateStreak: () => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(loadLocalData)
  const [authState, setAuthState] = useState<AuthState>({
    loggedIn: isAuthenticated(),
    email: null,
    loading: isAuthenticated(), // true when we need to fetch user data on load
  })
  const initialized = useRef(false)

  // ── Sync local copy whenever data changes ──────────────────────────────────
  useEffect(() => {
    saveLocalData(data)
  }, [data])

  // ── On mount: if a token exists, load all data from backend ───────────────
  useEffect(() => {
    if (!initialized.current && isAuthenticated()) {
      initialized.current = true
      appdata
        .get()
        .then((remote) => {
          setData({ ...DEFAULT_DATA, ...remote, settings: { ...DEFAULT_SETTINGS, ...remote.settings } })
          setAuthState((s) => ({ ...s, loggedIn: true, loading: false }))
        })
        .catch(() => {
          // Backend unreachable – fall back to local data
          clearToken()
          setAuthState({ loggedIn: false, email: null, loading: false })
        })
    } else {
      initialized.current = true
    }
  }, [])

  // ── Internal state mutator ─────────────────────────────────────────────────
  const mutate = useCallback((fn: (prev: AppData) => AppData) => {
    setData((prev) => fn(prev))
  }, [])

  // ─── Auth actions ──────────────────────────────────────────────────────────

  const login = useCallback(async (payload: AuthPayload) => {
    const res = await authApi.login(payload)
    setToken(res.access_token)
    const remote = await appdata.get()
    setData({ ...DEFAULT_DATA, ...remote, settings: { ...DEFAULT_SETTINGS, ...remote.settings } })
    setAuthState({ loggedIn: true, email: res.email, loading: false })
  }, [])

  const register = useCallback(async (payload: AuthPayload) => {
    const res = await authApi.register(payload)
    setToken(res.access_token)
    setData(DEFAULT_DATA)
    setAuthState({ loggedIn: true, email: res.email, loading: false })
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setData(DEFAULT_DATA)
    setAuthState({ loggedIn: false, email: null, loading: false })
  }, [])

  // ─── Task actions ──────────────────────────────────────────────────────────

  const addTask = useCallback(
    async (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros'>): Promise<string> => {
      if (isAuthenticated()) {
        const created = await tasksApi.create(task)
        mutate((d) => ({ ...d, tasks: [...d.tasks, created] }))
        return created.id
      }
      // offline
      const id = crypto.randomUUID()
      mutate((d) => ({
        ...d,
        tasks: [...d.tasks, { ...task, id, createdAt: new Date().toISOString(), completedPomodoros: 0 }],
      }))
      return id
    },
    [mutate]
  )

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      mutate((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) }))
      if (isAuthenticated()) {
        await tasksApi.update(id, updates).catch(() => {})
      }
    },
    [mutate]
  )

  const deleteTask = useCallback(
    async (id: string) => {
      mutate((d) => ({
        ...d,
        tasks: d.tasks.filter((t) => t.id !== id),
        activeTaskId: d.activeTaskId === id ? null : d.activeTaskId,
      }))
      if (isAuthenticated()) {
        await tasksApi.delete(id).catch(() => {})
      }
    },
    [mutate]
  )

  // ─── Active Task ───────────────────────────────────────────────────────────

  const setActiveTask = useCallback(
    async (id: string | null) => {
      mutate((d) => ({ ...d, activeTaskId: id }))
      if (isAuthenticated()) {
        await authApi.setActiveTask(id).catch(() => {})
      }
    },
    [mutate]
  )

  // ─── Sessions ──────────────────────────────────────────────────────────────

  const recordSession = useCallback(
    async (session: Omit<PomodoroSession, 'id'>) => {
      const tempId = crypto.randomUUID()
      // Optimistic update
      mutate((d) => {
        const newSession = { ...session, id: tempId }
        let tasksList = d.tasks
        if (session.completed && session.taskId && session.type === 'focus') {
          tasksList = d.tasks.map((t) =>
            t.id === session.taskId
              ? { ...t, completedPomodoros: t.completedPomodoros + 1, status: t.status === 'todo' ? 'inProgress' : t.status }
              : t
          )
        }
        return { ...d, sessions: [...d.sessions, newSession], tasks: tasksList }
      })

      if (isAuthenticated()) {
        const created = await sessionsApi.create(session).catch(() => null)
        if (created) {
          // Replace temp ID with the real one from the server
          mutate((d) => ({
            ...d,
            sessions: d.sessions.map((s) => (s.id === tempId ? created : s)),
          }))
        }
      }
    },
    [mutate]
  )

  // ─── Settings ─────────────────────────────────────────────────────────────

  const updateSettings = useCallback(
    async (updates: Partial<Settings>) => {
      mutate((d) => ({ ...d, settings: { ...d.settings, ...updates } }))
      if (isAuthenticated()) {
        await settingsApi.update(updates).catch(() => {})
      }
    },
    [mutate]
  )

  // ─── Quotes & Streak ──────────────────────────────────────────────────────

  const addCustomQuote = useCallback(
    async (q: string) => {
      mutate((d) => ({ ...d, customQuotes: [...d.customQuotes, q] }))
      if (isAuthenticated()) {
        await authApi.addQuote(q).catch(() => {})
      }
    },
    [mutate]
  )

  const updateStreak = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0]
    mutate((d) => {
      if (d.lastActiveDate === today) return d
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const newStreak = d.lastActiveDate === yesterday ? d.streak + 1 : 1
      return { ...d, streak: newStreak, lastActiveDate: today }
    })
    if (isAuthenticated()) {
      const res = await authApi.updateStreak().catch(() => null)
      if (res) {
        mutate((d) => ({ ...d, streak: res.streak, lastActiveDate: res.lastActiveDate }))
      }
    }
  }, [mutate])

  return (
    <AppContext.Provider
      value={{
        data,
        auth: authState,
        login,
        register,
        logout,
        addTask,
        updateTask,
        deleteTask,
        setActiveTask,
        recordSession,
        updateSettings,
        addCustomQuote,
        updateStreak,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// ─── Stat helpers (unchanged) ─────────────────────────────────────────────────

export function getTodayStats(data: AppData) {
  const today = new Date().toISOString().split('T')[0]
  const todaySessions = data.sessions.filter((s) => s.date === today && s.type === 'focus' && s.completed)
  const focusMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0)
  const pomodorosCompleted = todaySessions.length
  const tasksCompleted = data.tasks.filter((t) => t.status === 'completed' && t.createdAt.startsWith(today)).length
  return { focusMinutes, pomodorosCompleted, tasksCompleted }
}

export function getWeeklyStats(data: AppData) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  return days.map((date) => {
    const s = data.sessions.filter((s) => s.date === date && s.type === 'focus' && s.completed)
    return {
      date,
      label: new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' }),
      minutes: s.reduce((acc, s) => acc + s.durationMinutes, 0),
      pomodoros: s.length,
    }
  })
}
