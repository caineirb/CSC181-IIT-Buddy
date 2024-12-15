from flask import Blueprint

mixed_bp = Blueprint("mixed",__name__)

from . import routes, controller