from flask import Blueprint, jsonify, render_template, request

from app.api_calls.collection_api import (
    add_owned_card,
    list_all_languages,
    list_owned_cards,
    list_pokemon_cards,
)
from app.api_calls.pokedex_api import search_pokedex

collection_bp = Blueprint("collection", __name__, url_prefix="/collection")


@collection_bp.route("/", methods=["GET"])
def index():
    lang = request.args.get("lang", "")
    return render_template(
        "collection/index.html",
        cards=list_owned_cards(lang or None),
        languages=list_all_languages(),
        selected_lang=lang,
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
    return jsonify(list_pokemon_cards(pokedex_id, lang))


@collection_bp.route("/add/card", methods=["POST"])
def add_card():
    data = request.get_json(force=True, silent=True) or {}
    body, status_code = add_owned_card(data.get("card_id", ""), data.get("lang", ""))
    return jsonify(body), status_code
