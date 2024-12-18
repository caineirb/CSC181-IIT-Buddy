from flask import Blueprint

saved_page_bp = Blueprint("saved_page",__name__)

from . import routes, controller