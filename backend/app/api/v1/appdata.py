"""
Bulk endpoint – returns all user data in one request
so the React frontend can hydrate in a single round-trip.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.domain import User, UserSettings
from app.schemas.schemas import AppDataResponse, TaskResponse, SessionResponse, SettingsResponse
from app.api.deps import get_current_user
from app.api.v1 import settings as settings_router
import uuid

router = APIRouter()


@router.get("", response_model=AppDataResponse)
def get_app_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.api.v1.tasks import _task_to_response
    from app.api.v1.sessions import _session_to_response
    from app.api.v1.settings import _settings_to_response, _get_or_create_settings

    tasks = [_task_to_response(t) for t in current_user.tasks]
    sessions = [_session_to_response(s) for s in current_user.sessions]
    user_settings = _get_or_create_settings(db, current_user.id)
    settings_resp = _settings_to_response(user_settings)

    return AppDataResponse(
        tasks=tasks,
        sessions=sessions,
        settings=settings_resp,
        streak=current_user.streak or 0,
        lastActiveDate=current_user.last_active_date,
        activeTaskId=current_user.active_task_id,
        customQuotes=current_user.custom_quotes or [],
    )
