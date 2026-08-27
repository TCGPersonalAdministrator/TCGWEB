from flask import Blueprint, redirect, render_template, request

from app.i18n import LANG_COOKIE, SUPPORTED_LANGUAGES

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    return render_template("index.html")


@main_bp.route("/set-language/<lang>", methods=["GET"])
def set_language(lang):
    # Idioma de la INTERFAZ — se guarda en cookie (sin login en esta app) y
    # se vuelve a la página desde la que se pulsó el selector.
    response = redirect(request.referrer or "/")
    if lang in SUPPORTED_LANGUAGES:
        response.set_cookie(LANG_COOKIE, lang, max_age=60 * 60 * 24 * 365)
    return response
