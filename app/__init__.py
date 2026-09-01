from flask import Flask, g, request

from .config import Config
from .i18n import (
    DEFAULT_LANGUAGE,
    LANG_COOKIE,
    SUPPORTED_LANGUAGES,
    all_translations_for_current_lang,
    catalog_lang_name,
    next_ui_lang,
    t,
    ui_lang_name,
)


def create_app(config_class: type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    from .routes.main import main_bp
    app.register_blueprint(main_bp)

    from .routes.pokedex import pokedex_bp
    app.register_blueprint(pokedex_bp)

    from .routes.admin import admin_bp
    app.register_blueprint(admin_bp)

    from .routes.sync_status import sync_status_bp
    app.register_blueprint(sync_status_bp)

    from .routes.collection import collection_bp
    app.register_blueprint(collection_bp)

    # Registrados como globals de Jinja (no solo context_processor) para que
    # funcionen también dentro de macros importadas sin "with context"
    # (_macros.html) — t() y catalog_lang_name() leen flask.g en el momento
    # de llamarse, así que funcionan igual de bien como global puro.
    app.jinja_env.globals["t"] = t
    app.jinja_env.globals["catalog_lang_name"] = catalog_lang_name
    app.jinja_env.globals["ui_lang_name"] = ui_lang_name

    @app.before_request
    def set_language():
        # Idioma de la INTERFAZ (i18n de la app) — distinto del idioma de las
        # cartas/catálogo, que se elige aparte en cada pantalla. Se guarda en
        # una cookie de solo lectura del navegador, no en sesión de usuario
        # (esta app no tiene login).
        lang = request.cookies.get(LANG_COOKIE)
        g.lang = lang if lang in SUPPORTED_LANGUAGES else DEFAULT_LANGUAGE

    @app.context_processor
    def inject_globals():
        # Las imágenes las sirve TCGAPI (puerto distinto al de esta web), así
        # que las plantillas necesitan la URL base para construir <img src>.
        # Usa TCGAPI_PUBLIC_URL (no TCGAPI_BASE_URL): esta URL la resuelve el
        # navegador del usuario, no el backend de TCGWEB — ver nota en config.py.
        return {
            "tcgapi_base_url": app.config["TCGAPI_PUBLIC_URL"],
            "t": t,
            "current_lang": g.lang,
            "ui_languages": SUPPORTED_LANGUAGES,
            "ui_lang_name": ui_lang_name,
            "next_ui_lang": next_ui_lang,
            "catalog_lang_name": catalog_lang_name,
            "i18n_json": all_translations_for_current_lang(),
        }

    return app
