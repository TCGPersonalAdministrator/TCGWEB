from flask import Flask

from .config import Config


def create_app(config_class: type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    from .routes.main import main_bp
    app.register_blueprint(main_bp)

    return app
