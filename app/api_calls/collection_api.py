import requests
from flask import current_app

from app.api_calls.lang_sets_api import list_languages as list_tcgdex_languages


def list_all_languages() -> list[dict]:
    """Idiomas para el selector de la colección: inglés (catálogo pokemontcg.io,
    no pasa por /langs) + los del catálogo tcgdex.dev."""
    return [{"code": "en", "name": "Inglés"}] + list_tcgdex_languages()


def list_pokemon_cards(pokedex_id: int, lang: str) -> list[dict]:
    response = requests.get(
        f"{current_app.config['TCGAPI_BASE_URL']}/pokedex/{pokedex_id}/cards",
        params={"lang": lang},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


def add_owned_card(card_id: str, lang: str) -> tuple[dict, int]:
    response = requests.post(
        f"{current_app.config['TCGAPI_BASE_URL']}/owned/cards",
        json={"card_id": card_id, "lang": lang},
        timeout=10,
    )
    return response.json(), response.status_code


def list_owned_cards(lang: str | None = None) -> list[dict]:
    params = {"lang": lang} if lang else {}
    response = requests.get(
        f"{current_app.config['TCGAPI_BASE_URL']}/owned/cards", params=params, timeout=10
    )
    response.raise_for_status()
    return response.json()
