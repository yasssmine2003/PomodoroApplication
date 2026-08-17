import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.domain import Task, User
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskResponse
from app.api.deps import get_current_user

router = APIRouter()


def _task_to_response(task: Task) -> TaskResponse:
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        category=task.category,
        estimatedPomodoros=task.estimated_pomodoros,
        completedPomodoros=task.completed_pomodoros,
        status=task.status,
        createdAt=task.created_at,
        tags=task.tags or [],
    )


@router.get("", response_model=List[TaskResponse])
def get_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    return [_task_to_response(t) for t in tasks]


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from datetime import datetime
    task = Task(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        category=payload.category,
        estimated_pomodoros=payload.estimatedPomodoros,
        completed_pomodoros=0,
        status="todo",
        created_at=datetime.utcnow().isoformat(),
        tags=payload.tags or [],
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return _task_to_response(task)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = payload.model_dump(exclude_unset=True)
    field_map = {
        "title": "title",
        "description": "description",
        "priority": "priority",
        "category": "category",
        "estimatedPomodoros": "estimated_pomodoros",
        "completedPomodoros": "completed_pomodoros",
        "status": "status",
        "tags": "tags",
    }
    for frontend_key, db_key in field_map.items():
        if frontend_key in update_data:
            setattr(task, db_key, update_data[frontend_key])

    db.commit()
    db.refresh(task)
    return _task_to_response(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
