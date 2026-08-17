from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str

class UserResponse(BaseModel):
    id: str
    email: str
    streak: int
    lastActiveDate: Optional[str] = Field(None, validation_alias="last_active_date")
    activeTaskId: Optional[str] = Field(None, validation_alias="active_task_id")
    customQuotes: List[str] = Field(default_factory=list, validation_alias="custom_quotes")

    model_config = ConfigDict(from_attributes=True)

# --- Task Schemas ---
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    category: Optional[str] = None
    estimatedPomodoros: int = 1
    tags: Optional[List[str]] = Field(default_factory=list)

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    estimatedPomodoros: Optional[int] = None
    completedPomodoros: Optional[int] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    priority: str
    category: Optional[str] = None
    estimatedPomodoros: int
    completedPomodoros: int
    status: str
    createdAt: str
    tags: List[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

# --- Session Schemas ---
class SessionCreate(BaseModel):
    taskId: Optional[str] = None
    type: str  # focus | shortBreak | longBreak
    date: str  # YYYY-MM-DD
    durationMinutes: int
    completed: bool = True

class SessionResponse(BaseModel):
    id: str
    taskId: Optional[str] = None
    type: str
    date: str
    durationMinutes: int
    completed: bool

    model_config = ConfigDict(from_attributes=True)

# --- Settings Schemas ---
class SettingsUpdate(BaseModel):
    focusDuration: Optional[int] = None
    shortBreakDuration: Optional[int] = None
    longBreakDuration: Optional[int] = None
    pomodorosBeforeLongBreak: Optional[int] = None
    autoStartBreak: Optional[bool] = None
    autoStartFocus: Optional[bool] = None
    soundEnabled: Optional[bool] = None
    notificationsEnabled: Optional[bool] = None
    dailyGoal: Optional[int] = None
    userName: Optional[str] = None

class SettingsResponse(BaseModel):
    focusDuration: int
    shortBreakDuration: int
    longBreakDuration: int
    pomodorosBeforeLongBreak: int
    autoStartBreak: bool
    autoStartFocus: bool
    soundEnabled: bool
    notificationsEnabled: bool
    dailyGoal: int
    userName: str

    model_config = ConfigDict(from_attributes=True)

# --- App State Bulk Response ---
class AppDataResponse(BaseModel):
    tasks: List[TaskResponse]
    sessions: List[SessionResponse]
    settings: SettingsResponse
    streak: int
    lastActiveDate: Optional[str]
    activeTaskId: Optional[str]
    customQuotes: List[str]
