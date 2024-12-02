from flask import Blueprint

identifications_bp = Blueprint("identifications",__name__)

from . import routes, controller