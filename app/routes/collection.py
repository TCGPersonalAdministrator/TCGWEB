from flask import Blueprint, jsonify, render_template, request

from app.api_calls.collection_api import (
    add_owned_card,
    delete_owned_card,
    list_all_languages,
    list_owned_cards,
    list_owned_sets,
    list_pokemon_cards,
    lookup_cards_by_code,
)
from app.api_calls.lang_sets_api import list_lang_sets
from app.api_calls.pokedex_api import search_pokedex
from app.api_calls.sets_api import list_sets

collection_bp = Blueprint("collection", __name__, url_prefix="/collection")


@collection_bp.route("/", methods=["GET"])
def index():
    lang = request.args.get("lang", "")
    set_id = request.args.get("set", "")
    cards = list_owned_cards(lang or None, set_id or None)

    # Progreso = cartas conseguidas frente al total de cartas de los sets en
    # los que ya tienes alguna carta (no el catálogo entero) — cada set solo
    # cuenta una vez aunque tengas varias cartas suyas. Se agrupa por
    # (idioma, set_id), no solo por set_id, porque los ids de set no están
    # garantizados como únicos entre los 5 catálogos distintos (inglés vía
    # pokemontcg.io, resto vía tcgdex.dev).
    set_totals = {(c["idioma"], c["set_id"]): c["set_total"] for c in cards}

    return render_template(
        "collection/index.html",
        cards=cards,
        languages=list_all_languages(),
        sets=list_owned_sets(),
        selected_lang=lang,
        selected_set=set_id,
        owned_count=len(cards),
        total_count=sum(set_totals.values()),
    )


@collection_bp.route("/add/", methods=["GET"])
def add():
    return render_template("collection/add.html", languages=list_all_languages())


@collection_bp.route("/add/search-pokemon", methods=["GET"])
def add_search_pokemon():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify([])
    return jsonify(search_pokedex(q))


@collection_bp.route("/add/pokemon/<int:pokedex_id>/cards", methods=["GET"])
def add_pokemon_cards(pokedex_id):
    lang = request.args.get("lang", "")
    if not lang:
        return jsonify({"error": "falta el idioma"}), 400
    set_id = request.args.get("set", "")
    return jsonify(list_pokemon_cards(pokedex_id, lang, set_id or None))


@collection_bp.route("/add/sets", methods=["GET"])
def add_sets():
    lang = request.args.get("lang", "en")
    sets = list_sets() if lang == "en" else list_lang_sets(lang)
    return jsonify([{"id": s["id"], "name": s["name"]} for s in sets])


@collection_bp.route("/add/lookup-card", methods=["GET"])
def add_lookup_card():
    lang = request.args.get("lang", "")
    code = request.args.get("code", "").strip()
    number = request.args.get("number", "").strip()
    if not lang or not code or not number:
        return jsonify({"error": "faltan lang, code o number"}), 400
    return jsonify(lookup_cards_by_code(lang, code, number))


@collection_bp.route("/add/card", methods=["POST"])
def add_card():
    data = request.get_json(force=True, silent=True) or {}
    body, status_code = add_owned_card(data.get("card_id", ""), data.get("lang", ""))
    return jsonify(body), status_code


@collection_bp.route("/cards/<int:card_row_id>", methods=["DELETE"])
def delete_card(card_row_id):
    body, status_code = delete_owned_card(card_row_id)
    return jsonify(body), status_code
