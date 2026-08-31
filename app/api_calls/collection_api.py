import requests
from flask import current_app

from app.api_calls.lang_sets_api import list_languages as list_tcgdex_languages
from app.api_calls.sync_api import start_sync


def list_all_languages() -> list[dict]:
    """Idiomas para el selector de la colección: inglés (catálogo pokemontcg.io,
    no pasa por /langs) + los del catálogo tcgdex.dev."""
    return [{"code": "en", "name": "Inglés"}] + list_tcgdex_languages()


def list_pokemon_cards(pokedex_id: int, lang: str, set_id: str | None = None) -> list[dict]:
    params = {"lang": lang}
    if set_id:
        params["set"] = set_id
    response = requests.get(
        f"{current_app.config['TCGAPI_BASE_URL']}/pokedex/{pokedex_id}/cards",
        params=params,
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


def lookup_cards_by_code(lang: str, code: str, number: str) -> list[dict]:
    response = requests.get(
        f"{current_app.config['TCGAPI_BASE_URL']}/cards/lookup",
        params={"lang": lang, "code": code, "number": number},
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


def list_owned_cards(lang: str | None = None, set_id: str | None = None) -> list[dict]:
    params = {}
    if lang:
        params["lang"] = lang
    if set_id:
        params["set"] = set_id
    response = requests.get(
        f"{current_app.config['TCGAPI_BASE_URL']}/owned/cards", params=params, timeout=10
    )
    response.raise_for_status()
    return response.json()


def list_owned_sets() -> list[dict]:
    """Sets de los que el usuario posee al menos una carta, para el filtro
    por set de "Mi colección" — no acotado por idioma, es una faceta
    independiente del filtro de idioma."""
    response = requests.get(
        f"{current_app.config['TCGAPI_BASE_URL']}/owned/sets", timeout=10
    )
    response.raise_for_status()
    return response.json()


def delete_owned_card(card_row_id: int) -> tuple[dict, int]:
    response = requests.delete(
        f"{current_app.config['TCGAPI_BASE_URL']}/owned/cards/{card_row_id}", timeout=10
    )
    return response.json(), response.status_code


def start_refresh_prices() -> tuple[dict, int]:
    """Arranca en TCGAPI el refresco de precios (raw, sin gradear) de toda la
    colección personal — botón "Recargar precios" en "Mi colección"."""
    return start_sync("/owned/prices/refresh")
