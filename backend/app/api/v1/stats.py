from datetime import date, timedelta
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.domain import PomodoroSession, Task, User
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/summary")
def get_stats_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today().isoformat()

    # Today's stats
    today_sessions = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.date == today,
        PomodoroSession.type == "focus",
        PomodoroSession.completed == True,
    ).all()

    focus_minutes = sum(s.duration_minutes for s in today_sessions)
    pomodoros_completed = len(today_sessions)
    tasks_completed_today = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "completed",
    ).count()

    # Weekly stats (last 7 days)
    weekly = []
    for i in range(6, -1, -1):
        day = (date.today() - timedelta(days=i)).isoformat()
        day_sessions = db.query(PomodoroSession).filter(
            PomodoroSession.user_id == current_user.id,
            PomodoroSession.date == day,
            PomodoroSession.type == "focus",
            PomodoroSession.completed == True,
        ).all()
        # Label: Mon, Tue, etc.
        day_date = date.fromisoformat(day)
        weekly.append({
            "date": day,
            "label": day_date.strftime("%a"),
            "minutes": sum(s.duration_minutes for s in day_sessions),
            "pomodoros": len(day_sessions),
        })

    return {
        "today": {
            "focusMinutes": focus_minutes,
            "pomodorosCompleted": pomodoros_completed,
            "tasksCompleted": tasks_completed_today,
        },
        "weekly": weekly,
        "streak": current_user.streak or 0,
        "lastActiveDate": current_user.last_active_date,
    }


@router.get("/all-time")
def get_all_time_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_sessions = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.type == "focus",
        PomodoroSession.completed == True,
    ).all()

    total_minutes = sum(s.duration_minutes for s in all_sessions)
    total_pomodoros = len(all_sessions)
    total_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "completed",
    ).count()

    return {
        "totalFocusMinutes": total_minutes,
        "totalPomodoros": total_pomodoros,
        "totalTasksCompleted": total_tasks,
    }
