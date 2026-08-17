import datetime
import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    streak = Column(Integer, default=0)
    last_active_date = Column(String(10), nullable=True) # YYYY-MM-DD
    active_task_id = Column(String(36), nullable=True)
    custom_quotes = Column(JSON, default=list)

    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("PomodoroSession", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(20), default="medium") # low | medium | high
    category = Column(String(50), nullable=True)
    estimated_pomodoros = Column(Integer, default=1)
    completed_pomodoros = Column(Integer, default=0)
    status = Column(String(20), default="todo") # todo | inProgress | completed
    created_at = Column(String(50), default=lambda: datetime.datetime.utcnow().isoformat())
    tags = Column(JSON, default=list)

    user = relationship("User", back_populates="tasks")

class PomodoroSession(Base):
    __tablename__ = "pomodoro_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=True)
    type = Column(String(20), nullable=False) # focus | shortBreak | longBreak
    date = Column(String(10), nullable=False) # YYYY-MM-DD
    duration_minutes = Column(Integer, nullable=False)
    completed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="sessions")

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    focus_duration = Column(Integer, default=25)
    short_break_duration = Column(Integer, default=5)
    long_break_duration = Column(Integer, default=15)
    pomodoros_before_long_break = Column(Integer, default=4)
    auto_start_break = Column(Boolean, default=False)
    auto_start_focus = Column(Boolean, default=False)
    sound_enabled = Column(Boolean, default=True)
    notifications_enabled = Column(Boolean, default=True)
    daily_goal = Column(Integer, default=6)
    user_name = Column(String(100), default="")

    user = relationship("User", back_populates="settings")
