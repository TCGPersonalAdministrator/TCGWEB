import requests
from flask import current_app

from app.api_calls.sync_api import start_sync


def start_sync_pokedex() -> tuple[dict, int]:
    return start_sync("/pokedex/sync")


def list_pokedex() -> list[dict]:
    """Toda la Pokédex con el flag 'owned' (progreso hacia tener 1 carta de cada Pokémon)."""
    response = requests.get(f"{current_app.config['TCGAPI_BASE_URL']}/pokedex", timeout=10)
    response.raise_for_status()
    return response.json()


def search_pokedex(q: str) -> list[dict]:
    response = requests.get(
        f"{current_app.config['TCGAPI_BASE_URL']}/pokedex/search", params={"q": q}, timeout=10
    )
    response.raise_for_status()
    return response.json()
