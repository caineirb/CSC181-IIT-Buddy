from flask import Blueprint

reviewers_list_bp = Blueprint("reviewers_list",__name__)

from . import routes, controller