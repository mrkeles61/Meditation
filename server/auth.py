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

    try:
        result = supabase.table("profiles").select("*").eq("id", user_id).limit(1).execute()
        profile = result.data[0] if result and result.data else None
    except Exception:
        profile = None

    return CurrentUser(
        id=user_id,
        role=profile.get("role", "user") if profile else "user",
        subscription_tier=profile.get("subscription_tier", "free") if profile else "free",
    )


async def require_admin(user: CurrentUser = Security(get_current_user)) -> CurrentUser:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
