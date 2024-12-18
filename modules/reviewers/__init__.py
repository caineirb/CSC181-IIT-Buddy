from flask import Blueprint
from modules.reviewers.flashcards import flashcards_bp
from modules.reviewers.identifications import identifications_bp
from modules.reviewers.multipleChoice import multiple_choice_bp
from modules.reviewers.mixed import mixed_bp
from modules.reviewers.reviewersList import reviewers_list_bp

reviewers_bp = Blueprint("reviewers",__name__)
reviewers_bp.register_blueprint(flashcards_bp, url_prefix="/flashcards")
reviewers_bp.register_blueprint(identifications_bp, url_prefix="/identifications")
reviewers_bp.register_blueprint(multiple_choice_bp, url_prefix="/multiple_choice")
reviewers_bp.register_blueprint(mixed_bp, url_prefix="/mixed")
reviewers_bp.register_blueprint(reviewers_list_bp, url_prefix="/reviewers-list")

from . import routes, controller