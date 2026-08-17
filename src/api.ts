/**
 * FlowTime API Client
 * Communicates with the FastAPI backend at http://localhost:8000
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const API = `${BASE_URL}/api/v1`

// ─── Token Storage ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem('flowtime-token')
}

export function setToken(token: string) {
  localStorage.setItem('flowtime-token', token)
}

export function clearToken() {
  localStorage.removeItem('flowtime-token')
  localStorage.removeItem('flowtime-user')
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

// ─── HTTP Helper ──────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    throw new Error('Unauthorized – please log in again')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'API error')
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthPayload {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user_id: string
  email: string
}

export const auth = {
  register: (payload: AuthPayload) =>
    request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: AuthPayload) =>
    request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => request<{ id: string; email: string; streak: number; lastActiveDate: string | null; activeTaskId: string | null; customQuotes: string[] }>('/auth/me'),

  setActiveTask: (activeTaskId: string | null) =>
    request<{ activeTaskId: string | null }>('/auth/me/active-task', {
      method: 'PATCH',
      body: JSON.stringify({ activeTaskId }),
    }),

  updateStreak: () =>
    request<{ streak: number; lastActiveDate: string }>('/auth/me/streak', {
      method: 'PATCH',
    }),

  addQuote: (quote: string) =>
    request<{ customQuotes: string[] }>('/auth/me/quotes', {
      method: 'POST',
      body: JSON.stringify({ quote }),
    }),
}

// ─── App Data (bulk load) ─────────────────────────────────────────────────────

export const appdata = {
  get: () => request<import('./types').AppData>('/appdata'),
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

import type { Task, PomodoroSession, Settings } from './types'

export const tasks = {
  getAll: () => request<Task[]>('/tasks'),

  create: (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros'>) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category,
        estimatedPomodoros: task.estimatedPomodoros,
        tags: task.tags ?? [],
      }),
    }),

  update: (id: string, updates: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  delete: (id: string) =>
    request<void>(`/tasks/${id}`, { method: 'DELETE' }),
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const sessions = {
  getAll: () => request<PomodoroSession[]>('/sessions'),

  create: (session: Omit<PomodoroSession, 'id'>) =>
    request<PomodoroSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify({
        taskId: session.taskId,
        type: session.type,
        date: session.date,
        durationMinutes: session.durationMinutes,
        completed: session.completed,
      }),
    }),
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settingsApi = {
  get: () => request<Settings>('/settings'),

  update: (updates: Partial<Settings>) =>
    request<Settings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export const statsApi = {
  summary: () =>
    request<{
      today: { focusMinutes: number; pomodorosCompleted: number; tasksCompleted: number }
      weekly: { date: string; label: string; minutes: number; pomodoros: number }[]
      streak: number
      lastActiveDate: string | null
    }>('/stats/summary'),
}
