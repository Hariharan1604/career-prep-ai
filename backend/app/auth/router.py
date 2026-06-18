from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.schemas import SignupRequest, LoginRequest, TokenResponse, UserResponse
from app.auth import service

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Dependency: decode JWT and return user_id."""
    payload = service.decode_token(credentials.credentials)
    return payload["sub"]


@router.post("/signup", response_model=TokenResponse)
def signup(body: SignupRequest):
    return service.signup_user(body.email, body.password, body.full_name)





@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    return service.login_user(body.email, body.password)





@router.get("/me", response_model=UserResponse)
def me(user_id: str = Depends(get_current_user_id)):
    return service.get_current_user(user_id)

