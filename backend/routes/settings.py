"""
Settings routes — odczyt i zapis konfiguracji użytkownika.

GET  /api/settings        — zwraca aktualny config (bez secret values)
PUT  /api/settings        — aktualizuje config (częściowy update)
GET  /api/settings/status — status połączeń (Google, Slack, Miro)
"""
from typing import Optional
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.config import get_config, save_config, get_data_dir

router = APIRouter()


class SettingsResponse(BaseModel):
    data_dir: str
    anthropic_api_key_set: bool
    anthropic_api_key_preview: str        # ostatnie 4 znaki
    perplexity_api_key_set: bool
    serper_api_key_set: bool
    brave_api_key_set: bool
    miro_access_token_set: bool
    miro_board_id_set: bool
    slack_webhook_url_set: bool
    slack_auto_notify: bool
    llm_model: str
    language: str
    google_client_id_set: bool
    google_client_secret_set: bool
    google_connected: bool
    discovery_mock: bool


class SettingsUpdate(BaseModel):
    data_dir: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    perplexity_api_key: Optional[str] = None
    serper_api_key: Optional[str] = None
    brave_api_key: Optional[str] = None
    miro_access_token: Optional[str] = None
    miro_board_id: Optional[str] = None
    slack_webhook_url: Optional[str] = None
    slack_auto_notify: Optional[bool] = None
    llm_model: Optional[str] = None
    language: Optional[str] = None
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    discovery_mock: Optional[bool] = None


class IntegrationStatusResponse(BaseModel):
    slack_configured: bool
    miro_configured: bool
    google_connected: bool
    data_dir: str
    data_dir_exists: bool
    db_exists: bool


def _mask(value: str) -> str:
    """Zwraca '****XXXX' dla niepustego klucza."""
    if not value:
        return ""
    return "****" + value[-4:] if len(value) > 4 else "****"


@router.get("", response_model=SettingsResponse)
async def get_settings():
    """Zwraca aktualne ustawienia. Klucze API są maskowane."""
    cfg = get_config()
    return SettingsResponse(
        data_dir=cfg.get("data_dir", ""),
        anthropic_api_key_set=bool(cfg.get("anthropic_api_key")),
        anthropic_api_key_preview=_mask(cfg.get("anthropic_api_key", "")),
        perplexity_api_key_set=bool(cfg.get("perplexity_api_key")),
        serper_api_key_set=bool(cfg.get("serper_api_key")),
        brave_api_key_set=bool(cfg.get("brave_api_key")),
        miro_access_token_set=bool(cfg.get("miro_access_token")),
        miro_board_id_set=bool(cfg.get("miro_board_id")),
        slack_webhook_url_set=bool(cfg.get("slack_webhook_url")),
        slack_auto_notify=bool(cfg.get("slack_auto_notify", False)),
        llm_model=cfg.get("llm_model", "claude-sonnet-4-6"),
        language=cfg.get("language", "pl"),
        google_client_id_set=bool(cfg.get("google_client_id")),
        google_client_secret_set=bool(cfg.get("google_client_secret")),
        google_connected=bool(cfg.get("google_connected", False)),
        discovery_mock=bool(cfg.get("discovery_mock", False)),
    )


@router.put("", response_model=SettingsResponse)
async def update_settings(body: SettingsUpdate):
    """Częściowy update ustawień. Pola None są ignorowane."""
    updates = {k: v for k, v in body.model_dump().items() if v is not None}

    # Walidacja ścieżki data_dir — odrzuć pusty string
    if "data_dir" in updates:
        if not updates["data_dir"] or not updates["data_dir"].strip():
            raise HTTPException(status_code=422, detail="Ścieżka folderu danych nie może być pusta")
        updates["data_dir"] = updates["data_dir"].strip()
        try:
            Path(updates["data_dir"]).mkdir(parents=True, exist_ok=True)
        except (OSError, ValueError) as e:
            raise HTTPException(status_code=422, detail=f"Nieprawidłowa ścieżka folderu danych: {e}")

    save_config(updates)
    return await get_settings()


@router.get("/status", response_model=IntegrationStatusResponse)
async def get_integration_status():
    """Sprawdza status konfiguracji integracji."""
    cfg = get_config()
    data_dir = Path(cfg.get("data_dir", ""))
    db_path = data_dir / "discovery.db"

    return IntegrationStatusResponse(
        slack_configured=bool(cfg.get("slack_webhook_url")),
        miro_configured=bool(cfg.get("miro_access_token") and cfg.get("miro_board_id")),
        google_connected=bool(cfg.get("google_connected", False)),
        data_dir=str(data_dir),
        data_dir_exists=data_dir.exists(),
        db_exists=db_path.exists(),
    )
