import requests
from flask import current_app


def _api_base() -> str:
    return current_app.config["TCGAPI_BASE_URL"]


def start_sync(path: str) -> tuple[dict, int]:
    """Dispara una sincronización en TCGAPI (fire-and-forget, responde al momento). Devuelve (json, status_code)."""
    response = requests.post(f"{_api_base()}{path}", timeout=10)
    return response.json(), response.status_code


def get_sync_status() -> dict:
    """Consulta el progreso de la sincronización en curso (o la última terminada)."""
    response = requests.get(f"{_api_base()}/sync/status", timeout=10)
    response.raise_for_status()
    return response.json()
