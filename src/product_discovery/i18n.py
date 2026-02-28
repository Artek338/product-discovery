"""
i18n — Simple internationalization with YAML string tables.

Usage:
    from product_discovery.i18n import t
    print(t("report.title"))        # "Raport Discovery" (default: PL)
    print(t("report.title", "en"))  # "Discovery Report"
"""

from pathlib import Path
from typing import Optional

import yaml

_STRINGS = {}
_DEFAULT_LANG = "pl"
_STRINGS_DIR = Path(__file__).parent / "strings"


def _load_strings(lang: str) -> dict:
    """Load string table for given language."""
    if lang in _STRINGS:
        return _STRINGS[lang]

    path = _STRINGS_DIR / f"{lang}.yml"
    if not path.exists():
        path = _STRINGS_DIR / f"{_DEFAULT_LANG}.yml"

    if path.exists():
        with open(path, encoding="utf-8") as f:
            _STRINGS[lang] = yaml.safe_load(f) or {}
    else:
        _STRINGS[lang] = {}

    return _STRINGS[lang]


def t(key: str, lang: Optional[str] = None) -> str:
    """Get translated string by dot-separated key.

    Args:
        key: Dot-separated key, e.g. "report.title"
        lang: Language code ("pl", "en"). Defaults to PL.

    Returns:
        Translated string, or key itself if not found.
    """
    lang = lang or _DEFAULT_LANG
    strings = _load_strings(lang)

    parts = key.split(".")
    value = strings
    for part in parts:
        if isinstance(value, dict):
            value = value.get(part)
        else:
            return key

    return str(value) if value is not None else key


def set_default_language(lang: str) -> None:
    """Set default language for all t() calls."""
    global _DEFAULT_LANG
    _DEFAULT_LANG = lang


def available_languages() -> list[str]:
    """List available language codes."""
    return [p.stem for p in _STRINGS_DIR.glob("*.yml")]
