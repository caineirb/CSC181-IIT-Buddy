from flask import flash, render_template, request, redirect, url_for
from modules.controller import require_login
# from app_module.colleges.controller import search as searchCollege, displayAll, add as addCollege, edit as editCollege, get, delete as deleteCollege, customErrorMessages, uploadPicture, fetchPicture, destroyPicture
from . import flashcards_bp


@flashcards_bp.route('/<id>', methods=["GET"])
@require_login
def index(id :str):
    ...