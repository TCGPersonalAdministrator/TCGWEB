import requests
from flask import current_app

from app.api_calls.sync_api import start_sync


def list_sets() -> list[dict]:
    response = requests.get(f"{current_app.config['TCGAPI_BASE_URL']}/sets", timeout=10)
    response.raise_for_status()
    return response.json()


def start_sync_sets() -> tuple[dict, int]:
    return start_sync("/sets/sync")


def start_sync_set_cards(set_id: str) -> tuple[dict, int]:
    return start_sync(f"/sets/{set_id}/cards/sync")
