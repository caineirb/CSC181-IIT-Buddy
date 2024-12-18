from flask import Blueprint

multiple_choice_bp = Blueprint("multiple_choice",__name__)

from . import routes, controller