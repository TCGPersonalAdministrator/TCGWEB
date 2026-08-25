from flask import Blueprint, render_template

from app.api_calls.pokedex_api import list_pokedex

pokedex_bp = Blueprint("pokedex", __name__, url_prefix="/pokedex")


@pokedex_bp.route("/", methods=["GET"])
def index():
    return render_template("pokedex.html", pokemon=list_pokedex())
