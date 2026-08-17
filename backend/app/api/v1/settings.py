import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.domain import UserSettings, User
from app.schemas.schemas import SettingsUpdate, SettingsResponse
from app.api.deps import get_current_user

router = APIRouter()


def _settings_to_response(s: UserSettings) -> SettingsResponse:
    return SettingsResponse(
        focusDuration=s.focus_duration,
        shortBreakDuration=s.short_break_duration,
        longBreakDuration=s.long_break_duration,
        pomodorosBeforeLongBreak=s.pomodoros_before_long_break,
        autoStartBreak=s.auto_start_break,
        autoStartFocus=s.auto_start_focus,
        soundEnabled=s.sound_enabled,
        notificationsEnabled=s.notifications_enabled,
        dailyGoal=s.daily_goal,
        userName=s.user_name or "",
    )


def _get_or_create_settings(db: Session, user_id: str) -> UserSettings:
    s = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not s:
        s = UserSettings(id=str(uuid.uuid4()), user_id=user_id)
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


@router.get("", response_model=SettingsResponse)
def get_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = _get_or_create_settings(db, current_user.id)
    return _settings_to_response(settings)


@router.put("", response_model=SettingsResponse)
def update_settings(
    payload: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    settings = _get_or_create_settings(db, current_user.id)

    field_map = {
        "focusDuration": "focus_duration",
        "shortBreakDuration": "short_break_duration",
        "longBreakDuration": "long_break_duration",
        "pomodorosBeforeLongBreak": "pomodoros_before_long_break",
        "autoStartBreak": "auto_start_break",
        "autoStartFocus": "auto_start_focus",
        "soundEnabled": "sound_enabled",
        "notificationsEnabled": "notifications_enabled",
        "dailyGoal": "daily_goal",
        "userName": "user_name",
    }
    update_data = payload.model_dump(exclude_unset=True)
    for frontend_key, db_key in field_map.items():
        if frontend_key in update_data:
            setattr(settings, db_key, update_data[frontend_key])

    db.commit()
    db.refresh(settings)
    return _settings_to_response(settings)
