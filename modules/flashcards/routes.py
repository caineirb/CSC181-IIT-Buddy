from flask import flash, render_template, request, redirect, url_for, session, make_response, jsonify
from modules.controller import require_login
from modules.flashcards.controller import createFlashcard, fetchFlashcard, fetchFlashcards, editFlashcard, addCard, removeCards, fetchFlashcardInfo
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
    flashcard = fetchFlashcardInfo(id)
    if not session['user-id'] == flashcard[4]:
        return "Can't edit, not the owner."
    
    data = {
        'id': id,
        'title': flashcard[0],
        'description': flashcard[1],
        'type': flashcard[2],
        'privacy': flashcard[3]
    }
    return render_template('flashcards/creation.html', data=data)

@flashcards_bp.route('/save-info', methods=["POST"])
@require_login
def saveInfo():
    try:
        req = request.get_json()
        data = {
            'id': req['reviewerId'],
            'title': req['title'],
            'description': req['description'],
            'type': req['type'],
            'privacy': req['privacy']
        }
        editFlashcard(data)

        return make_response(jsonify({'message': 'Data Saved.'}), 200)
    except Exception as e:
        print(f"Error: {e}")  # Or log it to your logger
        return make_response(jsonify({'message': 'Invalid Request.'}), 400)

@flashcards_bp.route('/save-flashcard', methods=["POST"])
@require_login
def saveFlashcard():
    try:
        reviewer_id = request.form.get('id')
        removeCards(reviewer_id)
        for f in range(1, request.form.get('flashcard_count', type=int) + 1):
            # Attempt to retrieve image data if it exists
            image_file = request.files.get(f"flashcards[{f}][image]", None)
            image_data = image_file.read() if image_file else None

            data ={
                'reviewer_id': reviewer_id,
                'number': request.form.get(f"flashcards[{f}][dataNumber]", type=int),
                'definition': request.form.get(f"flashcards[{f}][definition]", type=str),
                'term': request.form.get(f"flashcards[{f}][term]", type=str),
                'image': image_data
            }
            addCard(data)
        return make_response(jsonify({'redirect_url': url_for('flashcards.review', id=reviewer_id)}))

    except Exception as e:
        print(f"Error saving flashcards: {e}")
        return jsonify({'message': 'Error saving flashcards'}), 500
    
@flashcards_bp.route('/review/<id>', methods=["GET"])
@require_login
def review(id :str):
    flashcards = fetchFlashcard(id)
    return render_template('flashcards/review.html', flashcards=flashcards)