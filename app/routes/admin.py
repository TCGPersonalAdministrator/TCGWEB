from flask import Blueprint, jsonify, render_template

from app.api_calls.sets_api import list_sets, start_sync_set_cards, start_sync_sets

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.route("/", methods=["GET"])
def index():
    return render_template("admin/index.html")


@admin_bp.route("/sets/", methods=["GET"])
def sets():
    return render_template("admin/sets.html", sets=list_sets())


@admin_bp.route("/sets/sync/start", methods=["POST"])
def sets_sync_start():
    body, status_code = start_sync_sets()
    return jsonify(body), status_code


@admin_bp.route("/sets/<set_id>/cards/sync/start", methods=["POST"])
def set_cards_sync_start(set_id):
    body, status_code = start_sync_set_cards(set_id)
    return jsonify(body), status_code
