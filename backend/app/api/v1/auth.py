import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.domain import User, UserSettings
from app.schemas.schemas import UserCreate, Token, UserResponse
from app.api.deps import get_current_user

router = APIRouter()


def _create_default_settings(db: Session, user_id: str):
    s = UserSettings(id=str(uuid.uuid4()), user_id=user_id)
    db.add(s)
    db.commit()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=str(uuid.uuid4()),
        email=payload.email,
        hashed_password=hash_password(payload.password),
        streak=0,
        custom_quotes=[],
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    _create_default_settings(db, user.id)

    token = create_access_token(subject=user.id)
    return Token(access_token=token, token_type="bearer", user_id=user.id, email=user.email)


@router.post("/login", response_model=Token)
def login(payload: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    token = create_access_token(subject=user.id)
    return Token(access_token=token, token_type="bearer", user_id=user.id, email=user.email)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        streak=current_user.streak,
        last_active_date=current_user.last_active_date,
        active_task_id=current_user.active_task_id,
        custom_quotes=current_user.custom_quotes or [],
    )


@router.patch("/me/active-task")
def set_active_task(body: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.active_task_id = body.get("activeTaskId")
    db.commit()
    return {"activeTaskId": current_user.active_task_id}


@router.patch("/me/streak")
def update_streak(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from datetime import date, timedelta
    today = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    if current_user.last_active_date == today:
        return {"streak": current_user.streak, "lastActiveDate": current_user.last_active_date}

    if current_user.last_active_date == yesterday:
        current_user.streak = (current_user.streak or 0) + 1
    else:
        current_user.streak = 1

    current_user.last_active_date = today
    db.commit()
    return {"streak": current_user.streak, "lastActiveDate": current_user.last_active_date}


@router.post("/me/quotes")
def add_quote(body: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from sqlalchemy.orm.attributes import flag_modified
    quotes = list(current_user.custom_quotes or [])
    quote = body.get("quote", "").strip()
    if quote and quote not in quotes:
        quotes.append(quote)
        current_user.custom_quotes = quotes
        flag_modified(current_user, "custom_quotes")
        db.commit()
    return {"customQuotes": current_user.custom_quotes}
