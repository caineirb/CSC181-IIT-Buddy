from flask import Blueprint

reviewers_feed_bp = Blueprint("reviewers_feed",__name__)

from . import routes, controller