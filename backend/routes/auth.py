"""
Auth routes — OAuth2 z Google (dostęp do Google Docs / Drive).

Flow:
  1. GET  /api/auth/google          → zwraca auth_url do Google
  2. GET  /api/auth/google/callback → odbiera code, wymienia na tokeny, zapisuje
  3. GET  /api/auth/google/status   → czy użytkownik jest zalogowany
  4. POST /api/auth/google/logout   → usuwa tokeny

Wymagania:
  - GOOGLE_CLIENT_ID i GOOGLE_CLIENT_SECRET w config (Settings UI)
  - Redirect URI dodany w Google Cloud Console: http://localhost:8000/api/auth/google/callback

Tokeny przechowywane w: DATA_DIR/google_tokens.json
"""
import json
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse
from pydantic import BaseModel

from backend.config import get as cfg_get, get_data_dir, save_config

router = APIRouter()

_SCOPES = [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive.file",  # dostęp tylko do plików tworzonych przez app
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
]
_REDIRECT_URI = "http://localhost:8000/api/auth/google/callback"


def _tokens_path() -> Path:
    return get_data_dir() / "google_tokens.json"


def _get_stored_tokens() -> dict | None:
    path = _tokens_path()
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return None
    return None


def _save_tokens(tokens: dict) -> None:
    _tokens_path().write_text(json.dumps(tokens, indent=2), encoding="utf-8")
    save_config({"google_connected": True})


def _delete_tokens() -> None:
    path = _tokens_path()
    if path.exists():
        path.unlink()
    save_config({"google_connected": False})


def _build_flow():
    """Buduje Flow OAuth2. Rzuca ImportError jeśli brak google-auth-oauthlib."""
    try:
        from google_auth_oauthlib.flow import Flow
    except ImportError:
        raise ImportError(
            "google-auth-oauthlib wymagane: pip install 'product-discovery[gdocs]'"
        )

    client_id = cfg_get("google_client_id", "")
    client_secret = cfg_get("google_client_secret", "")

    if not client_id or not client_secret:
        raise ValueError(
            "Brak GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET. "
            "Skonfiguruj je w Settings → Google Docs."
        )

    client_config = {
        "web": {
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uris": [_REDIRECT_URI],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }
    return Flow.from_client_config(client_config, scopes=_SCOPES, redirect_uri=_REDIRECT_URI)


class GoogleAuthUrlResponse(BaseModel):
    auth_url: str


class GoogleStatusResponse(BaseModel):
    connected: bool
    email: str


@router.get("/google", response_model=GoogleAuthUrlResponse)
async def google_auth_start():
    """Krok 1: Zwraca URL do logowania Google. Frontend otwiera go w nowej zakładce."""
    try:
        flow = _build_flow()
    except (ImportError, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))

    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return GoogleAuthUrlResponse(auth_url=auth_url)


@router.get("/google/callback")
async def google_auth_callback(code: str = "", error: str = ""):
    """Krok 2: Google redirectuje tutaj z code. Wymieniamy na tokeny."""
    if error:
        # Błąd autoryzacji — przekieruj do Settings z komunikatem
        return RedirectResponse(
            url=f"http://localhost:5173/settings?google_error={error}",
        )

    if not code:
        raise HTTPException(status_code=400, detail="Brak kodu autoryzacji")

    try:
        flow = _build_flow()
    except (ImportError, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))

    try:
        flow.fetch_token(code=code)
        credentials = flow.credentials
        tokens = {
            "token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": list(credentials.scopes) if credentials.scopes else [],
        }
        _save_tokens(tokens)
    except Exception as e:
        return RedirectResponse(
            url=f"http://localhost:5173/settings?google_error={str(e)[:100]}",
        )

    # Przekieruj do Settings z potwierdzeniem
    return HTMLResponse(content="""
        <html><body>
        <script>
          window.opener && window.opener.postMessage('google_connected', 'http://localhost:5173');
          window.close();
        </script>
        <p>Zalogowano! Możesz zamknąć to okno.</p>
        </body></html>
    """)


@router.get("/google/status", response_model=GoogleStatusResponse)
async def google_auth_status():
    """Sprawdza czy użytkownik jest zalogowany do Google."""
    tokens = _get_stored_tokens()
    if not tokens:
        return GoogleStatusResponse(connected=False, email="")

    # Spróbuj pobrać email z tokenów
    email = ""
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build

        creds = Credentials(
            token=tokens.get("token"),
            refresh_token=tokens.get("refresh_token"),
            token_uri=tokens.get("token_uri"),
            client_id=tokens.get("client_id"),
            client_secret=tokens.get("client_secret"),
        )
        oauth2_service = build("oauth2", "v2", credentials=creds)
        info = oauth2_service.userinfo().get().execute()
        email = info.get("email", "")
    except Exception:
        pass

    return GoogleStatusResponse(connected=True, email=email)


@router.post("/google/logout")
async def google_auth_logout():
    """Usuwa tokeny Google."""
    _delete_tokens()
    return {"success": True, "message": "Wylogowano z Google"}


def get_google_credentials():
    """
    Pomocnicza funkcja do użycia w export routes.
    Zwraca google.oauth2.credentials.Credentials lub rzuca HTTPException.
    """
    tokens = _get_stored_tokens()
    if not tokens:
        raise HTTPException(
            status_code=403,
            detail="Brak autoryzacji Google. Zaloguj się w Settings → Google Docs.",
        )

    try:
        from google.oauth2.credentials import Credentials
        return Credentials(
            token=tokens.get("token"),
            refresh_token=tokens.get("refresh_token"),
            token_uri=tokens.get("token_uri"),
            client_id=tokens.get("client_id"),
            client_secret=tokens.get("client_secret"),
        )
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="google-auth wymagane: pip install 'product-discovery[gdocs]'",
        )
