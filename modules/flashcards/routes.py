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
    data = fetchFlashcard(id)
    if not session['user-id'] == data['information'][4]:
        return "Can't edit, not the owner."
    
    data['id'] = id
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

import base64

@flashcards_bp.route('/save-flashcard', methods=["POST"])
@require_login
def save_flashcard():
    try:
        reviewer_id = request.form.get('id')
        removeCards(reviewer_id)
        
        flashcard_count = request.form.get('flashcard_count', type=int)
        for f in range(1, flashcard_count + 1):
            # Retrieve term, definition, and other data
            term = request.form.get(f"flashcards[{f}][term]")
            definition = request.form.get(f"flashcards[{f}][definition]")
            data_number = request.form.get(f"flashcards[{f}][dataNumber]", type=int)

            # Attempt to retrieve image as file or base64 string
            image_file = request.files.get(f"flashcards[{f}][image]", None)
            image_base64 = request.form.get(f"flashcards[{f}][image_base64]", None)
            
            if image_file:
                image_data = image_file.read()
            elif image_base64:
                image_data = base64.b64decode(image_base64.split(",")[1])  # Decode base64 data
            else:
                image_data = None
            
            # Prepare data for saving
            data = {
                'reviewer_id': reviewer_id,
                'number': data_number,
                'term': term,
                'definition': definition,
                'image': image_data
            }
            addCard(data)
        
        return make_response(jsonify({'redirect_url': url_for('flashcards.review', id=reviewer_id, isRandom=request.form.get("isRandom", type=str))}))

    except Exception as e:
        print(f"Error saving flashcards: {e}")
        return jsonify({'message': 'Error saving flashcards'}), 500

    
import random
from flask import request, render_template

@flashcards_bp.route('/review/<string:id>/random=<string:isRandom>', methods=["GET"])
@require_login
def review(id: str, isRandom: str):
    flashcards = fetchFlashcard(id)
    flashcards['id'] = id
    flashcards['isRandom'] = isRandom

    if not isRandom.lower() == 'false':
        # Convert isRandom to a boolean based on the string value
        if isRandom.lower() == 'true':
            random.shuffle(flashcards['cards'])
        else:
            return "Invalid Parameter."

    return render_template('flashcards/review.html', flashcards=flashcards)

@flashcards_bp.route('/review/finished/<string:id>/<string:isRandom>', methods=["GET"])
@require_login
def congrats(id: str, isRandom: str):
    info = {
        'data': fetchFlashcardInfo(id),
        'isRandom': isRandom.lower()
    }

    return render_template('flashcards/congrats.html', info=info)