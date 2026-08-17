import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.domain import PomodoroSession, Task, User
from app.schemas.schemas import SessionCreate, SessionResponse
from app.api.deps import get_current_user

router = APIRouter()


def _session_to_response(s: PomodoroSession) -> SessionResponse:
    return SessionResponse(
        id=s.id,
        taskId=s.task_id,
        type=s.type,
        date=s.date,
        durationMinutes=s.duration_minutes,
        completed=s.completed,
    )


@router.get("", response_model=List[SessionResponse])
def get_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(PomodoroSession).filter(PomodoroSession.user_id == current_user.id).all()
    return [_session_to_response(s) for s in sessions]


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = PomodoroSession(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        task_id=payload.taskId,
        type=payload.type,
        date=payload.date,
        duration_minutes=payload.durationMinutes,
        completed=payload.completed,
    )
    db.add(session)

    # Auto-increment task completedPomodoros when a focus session is completed
    if payload.completed and payload.taskId and payload.type == "focus":
        task = db.query(Task).filter(Task.id == payload.taskId, Task.user_id == current_user.id).first()
        if task:
            task.completed_pomodoros = (task.completed_pomodoros or 0) + 1
            if task.status == "todo":
                task.status = "inProgress"

    db.commit()
    db.refresh(session)
    return _session_to_response(session)
