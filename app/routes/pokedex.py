from flask import Blueprint, jsonify, render_template

from app.api_calls.pokedex_api import get_pokemon, list_pokedex

pokedex_bp = Blueprint("pokedex", __name__, url_prefix="/pokedex")


@pokedex_bp.route("/", methods=["GET"])
def index():
    return render_template("pokedex.html", pokemon=list_pokedex())


@pokedex_bp.route("/<int:pokedex_id>/data", methods=["GET"])
def data(pokedex_id):
    return jsonify(get_pokemon(pokedex_id))
