from flask import Flask

from .config import Config


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

    @app.context_processor
    def inject_tcgapi_base_url():
        # Las imágenes las sirve TCGAPI (puerto distinto al de esta web), así
        # que las plantillas necesitan la URL base para construir <img src>.
        return {"tcgapi_base_url": app.config["TCGAPI_BASE_URL"]}

    return app
