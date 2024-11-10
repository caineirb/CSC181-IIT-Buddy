from flask import flash, render_template, request, redirect, url_for, session
from modules.controller import require_login
from modules.flashcards.controller import createFlashcard, fetchFlashcard, fetchFlashcards
from . import flashcards_bp


@flashcards_bp.route('/create', methods=["POST"])
@require_login
def create():
    data = {
        'title': request.form.get('reviewer-title'),
        'type': request.form.get('reviewer-type'),
        'privacy': request.form.get('reviewer-privacy'),
        'owner_id': session['user-id']
    }
    flashcard_id = createFlashcard(data)
    return redirect(url_for('flashcards.edit', id=flashcard_id))


@flashcards_bp.route('/edit/<string:id>', methods=["GET"])
@require_login
def edit(id :str):
    flashcard = fetchFlashcard(id)

    if not session['user-id'] == flashcard[4]:
        return "Can't edit, not the owner."
    
    
    data = {
        'title': flashcard[0],
        'description': flashcard[1],
        'type': flashcard[2],
        'privacy': flashcard[3]
    }
    return render_template('flashcards/creation.html', data=data)


@flashcards_bp.route('/review', methods=["POST"])
@require_login
def review():

    return f"{request.form} {request.files} {fetchFlashcards(session['user-id'])}"