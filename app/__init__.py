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

    return app
