from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from .database import supabase

security = HTTPBearer()


class CurrentUser:
    def __init__(self, id: str, role: str, subscription_tier: str):
        self.id = id
        self.role = role
        self.subscription_tier = subscription_tier


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> CurrentUser:
    token = credentials.credentials
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return CurrentUser(
        id=user_id,
        role=result.data.get("role", "user"),
        subscription_tier=result.data.get("subscription_tier", "free"),
    )


async def require_admin(user: CurrentUser = Security(get_current_user)) -> CurrentUser:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
