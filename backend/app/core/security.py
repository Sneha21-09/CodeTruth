import hashlib
import re
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

PASSWORD_RE_LOWER = re.compile(r"[a-z]")
PASSWORD_RE_UPPER = re.compile(r"[A-Z]")
PASSWORD_RE_DIGIT = re.compile(r"\d")


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def validate_password_strength(pw: str) -> str | None:
    """Return an error message or None if acceptable."""
    if len(pw) < 10:
        return "Password must be at least 10 characters"
    if len(pw.encode()) > 72:
        return "Password must be at most 72 bytes"
    if not (PASSWORD_RE_LOWER.search(pw) and PASSWORD_RE_UPPER.search(pw) and PASSWORD_RE_DIGIT.search(pw)):
        return "Password must include upper-case, lower-case and a digit"
    return None


def hash_password(pw: str) -> str:
    return pwd_context.hash(pw)


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(pw, hashed)
    except Exception:
        return False


def create_access_token(user_id: int, session_id: str) -> str:
    s = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "sid": session_id,
        "iat": now,
        "exp": now + timedelta(minutes=s.access_token_minutes),
        "typ": "access",
    }
    return jwt.encode(payload, s.secret_key, algorithm="HS256")


def decode_access_token(token: str) -> dict | None:
    s = get_settings()
    try:
        data = jwt.decode(token, s.secret_key, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    if data.get("typ") != "access":
        return None
    return data


def new_opaque_token() -> tuple[str, str]:
    """Return (raw_token, sha256_hash). Only the hash is stored."""
    raw = secrets.token_urlsafe(32)
    return raw, hashlib.sha256(raw.encode()).hexdigest()


def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()
