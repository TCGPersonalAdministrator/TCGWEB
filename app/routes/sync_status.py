from flask import Blueprint, jsonify

from app.api_calls.sync_api import get_sync_status

sync_status_bp = Blueprint("sync_status", __name__)


@sync_status_bp.route("/sync-status", methods=["GET"])
def sync_status():
    return jsonify(get_sync_status())
