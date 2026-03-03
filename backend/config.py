"""
Konfiguracja aplikacji — przechowuje ustawienia użytkownika w ~/.product-discovery/config.json.

Priorytety dla API keys:
  1. Wartość z config.json (Settings UI)
  2. Zmienna środowiskowa (backward compat, .env)
  3. Pusty string (nieaktywne)
"""
import json
import os
from pathlib import Path

# Katalog konfiguracyjny w folderze domowym użytkownika
_CONFIG_DIR = Path.home() / ".product-discovery"
_CONFIG_FILE = _CONFIG_DIR / "config.json"

_DEFAULTS: dict = {
    "data_dir": str(Path.home() / "product-discovery-data"),
    "anthropic_api_key": "",
    "perplexity_api_key": "",
    "serper_api_key": "",
    "brave_api_key": "",
    "miro_access_token": "",
    "miro_board_id": "",
    "slack_webhook_url": "",
    "slack_auto_notify": False,
    "llm_model": "claude-sonnet-4-6",
    "language": "pl",
    "google_client_id": "",
    "google_client_secret": "",
    "google_connected": False,
    "discovery_mock": False,
}

# Mapowanie kluczy config → zmiennych środowiskowych (do fallbacku)
_ENV_FALLBACKS: dict[str, str] = {
    "anthropic_api_key": "ANTHROPIC_API_KEY",
    "perplexity_api_key": "PERPLEXITY_API_KEY",
    "serper_api_key": "SERPER_API_KEY",
    "brave_api_key": "BRAVE_API_KEY",
    "miro_access_token": "MIRO_ACCESS_TOKEN",
    "miro_board_id": "MIRO_BOARD_ID",
    "slack_webhook_url": "SLACK_WEBHOOK_URL",
    "google_client_id": "GOOGLE_CLIENT_ID",
    "google_client_secret": "GOOGLE_CLIENT_SECRET",
    "discovery_mock": "DISCOVERY_MOCK",
}

# Singleton — załadowany raz przy starcie
_config: dict | None = None


def load_config() -> dict:
    """Wczytuje config z pliku. Przy pierwszym uruchomieniu tworzy plik z defaults."""
    global _config
    _CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    if _CONFIG_FILE.exists():
        try:
            stored = json.loads(_CONFIG_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            stored = {}
    else:
        stored = {}

    # Merge defaults + stored (nowe klucze z defaults)
    merged = {**_DEFAULTS, **stored}

    # Zastosuj env fallbacki dla pustych wartości
    for key, env_var in _ENV_FALLBACKS.items():
        env_val = os.environ.get(env_var, "")
        if not merged.get(key) and env_val:
            if key == "discovery_mock":
                merged[key] = env_val.lower() == "true"
            else:
                merged[key] = env_val

    _config = merged

    # Ustaw env var dla Anthropic API key (pydantic-ai go używa)
    if merged.get("anthropic_api_key"):
        os.environ["ANTHROPIC_API_KEY"] = merged["anthropic_api_key"]

    return merged


def get_config() -> dict:
    """Zwraca załadowany config. Jeśli nie załadowany — ładuje."""
    if _config is None:
        return load_config()
    return _config


def save_config(updates: dict) -> dict:
    """Zapisuje zmiany do config.json i aktualizuje singleton."""
    global _config
    current = get_config().copy()
    current.update(updates)
    _CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    _CONFIG_FILE.write_text(json.dumps(current, indent=2, ensure_ascii=False), encoding="utf-8")
    _config = current

    # Zaktualizuj env var dla Anthropic jeśli klucz się zmienił
    if "anthropic_api_key" in updates and updates["anthropic_api_key"]:
        os.environ["ANTHROPIC_API_KEY"] = updates["anthropic_api_key"]

    return current


def get_data_dir() -> Path:
    """Zwraca ścieżkę do folderu danych użytkownika. Tworzy jeśli nie istnieje."""
    data_dir = Path(get_config().get("data_dir", _DEFAULTS["data_dir"]))
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir


def get_db_path() -> Path:
    """Zwraca ścieżkę do bazy SQLite w folderze danych."""
    return get_data_dir() / "discovery.db"


def get(key: str, default=None):
    """Zwraca pojedynczą wartość z config."""
    return get_config().get(key, default)
