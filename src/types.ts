export type Page = 'dashboard' | 'timer' | 'tasks' | 'stats' | 'settings'
export type SessionType = 'focus' | 'shortBreak' | 'longBreak'
export type SessionStatus = 'idle' | 'running' | 'paused' | 'completed'
export type TaskStatus = 'todo' | 'inProgress' | 'completed'
export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  priority: Priority
  category?: string
  estimatedPomodoros: number
  completedPomodoros: number
  status: TaskStatus
  createdAt: string
  tags?: string[]
}

export interface PomodoroSession {
  id: string
  taskId?: string
  type: SessionType
  date: string
  durationMinutes: number
  completed: boolean
}

export interface Settings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  pomodorosBeforeLongBreak: number
  autoStartBreak: boolean
  autoStartFocus: boolean
  soundEnabled: boolean
  notificationsEnabled: boolean
  dailyGoal: number
  userName: string
}

export interface TimerState {
  status: SessionStatus
  sessionType: SessionType
  remainingMs: number
  totalMs: number
  startTimestamp: number | null
  pomodoroCount: number
}

export interface AppData {
  tasks: Task[]
  sessions: PomodoroSession[]
  settings: Settings
  streak: number
  lastActiveDate: string | null
  activeTaskId: string | null
  customQuotes: string[]
}
