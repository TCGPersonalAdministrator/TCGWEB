from app.api_calls.sync_api import start_sync


def start_sync_pokedex() -> tuple[dict, int]:
    return start_sync("/pokedex/sync")
