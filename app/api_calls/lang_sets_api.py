import requests
from flask import current_app

from app.api_calls.sync_api import start_sync


def list_languages() -> list[dict]:
    response = requests.get(f"{current_app.config['TCGAPI_BASE_URL']}/langs", timeout=10)
    response.raise_for_status()
    return response.json()


def list_lang_sets(lang: str) -> list[dict]:
    response = requests.get(f"{current_app.config['TCGAPI_BASE_URL']}/langs/{lang}/sets", timeout=10)
    response.raise_for_status()
    return response.json()


def start_sync_lang_sets(lang: str) -> tuple[dict, int]:
    return start_sync(f"/langs/{lang}/sets/sync")


def start_sync_lang_set_cards(lang: str, set_id: str) -> tuple[dict, int]:
    return start_sync(f"/langs/{lang}/sets/{set_id}/cards/sync")
