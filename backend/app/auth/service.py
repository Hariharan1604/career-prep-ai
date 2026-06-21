from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import HTTPException, status
from app.config import settings
from app.database import get_supabase, get_admin_supabase


def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    pwd_bytes = plain.encode('utf-8')
    hashed_bytes = hashed.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)


def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def signup_user(email: str, password: str, full_name: str) -> dict:
    """Create a new user in Supabase auth + profiles table."""
    db = get_admin_supabase()

    # Check if user already exists
    existing = db.table("profiles").select("id").eq("email", email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user in Supabase Auth
    try:
        auth_response = db.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")

    user_id = auth_response.user.id

    # Store profile in profiles table
    try:
        db.table("profiles").insert({
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "password_hash": hash_password(password),
        }).execute()
    except Exception as e:
        # If storing the profile fails, clean up the user from auth to prevent orphaned users
        db.auth.admin.delete_user(user_id)
        raise HTTPException(status_code=400, detail=f"Failed to create user profile: {str(e)}")

    token = create_access_token(user_id, email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user_id, "email": email, "full_name": full_name},
    }


def login_user(email: str, password: str) -> dict:
    """Authenticate user and return JWT token."""
    db = get_supabase()

    # Fetch profile
    result = db.table("profiles").select("*").eq("email", email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    profile = result.data[0]
    if not verify_password(password, profile["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(profile["id"], email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": profile["id"],
            "email": profile["email"],
            "full_name": profile.get("full_name"),
            "created_at": profile.get("created_at"),
        },
    }


def get_current_user(user_id: str) -> dict:
    """Fetch the current user's profile from Supabase."""
    db = get_supabase()
    result = db.table("profiles").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    p = result.data[0]
    return {
        "id": p["id"],
        "email": p["email"],
        "full_name": p.get("full_name"),
        "created_at": p.get("created_at"),
    }
