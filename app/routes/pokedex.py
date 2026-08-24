from flask import Blueprint, jsonify, render_template

from app.api_calls.pokedex_api import start_sync_pokedex

pokedex_bp = Blueprint("pokedex", __name__, url_prefix="/pokedex")


@pokedex_bp.route("/", methods=["GET"])
def index():
    return render_template("pokedex.html")


@pokedex_bp.route("/sync/start", methods=["POST"])
def sync_start():
    body, status_code = start_sync_pokedex()
    return jsonify(body), status_code
