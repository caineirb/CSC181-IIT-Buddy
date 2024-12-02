from flask import Blueprint
from modules.reviewers.flashcards import flashcards_bp
from modules.reviewers.identifications import identifications_bp
from modules.reviewers.reviewersList import reviewers_list_bp

reviewers_bp = Blueprint("reviewers",__name__)
reviewers_bp.register_blueprint(flashcards_bp, url_prefix="/flashcards")
reviewers_bp.register_blueprint(identifications_bp, url_prefix="/identifications")
reviewers_bp.register_blueprint(reviewers_list_bp, url_prefix="/reviewers-list")

from . import routes, controller