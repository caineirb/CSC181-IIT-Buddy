from flask import render_template, request, url_for, session, make_response, jsonify
from modules.controller import require_login, fetchStudent
from modules.reviewers.flashcards.controller import fetchFlashcard, addCard, removeCards
from modules.reviewers.controller import fetchReviewerInfo
from . import flashcards_bp
import random
import base64

@flashcards_bp.route('/edit/<string:id>', methods=["GET"])
@require_login
def edit(id :str):
    data = fetchFlashcard(id)
    if not session['user-id'] == data['information'][4]:
        return "Can't edit, not the owner."

    data['id'] = id

    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/flashcards/creation.html', data=data, user_name=user_name)

@flashcards_bp.route('/review/<string:id>/r=<string:isRandom>', methods=["GET"])
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
        
    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/flashcards/review.html', flashcards=flashcards, user_name=user_name)

@flashcards_bp.route('/review/finished/<string:id>/<string:isRandom>', methods=["GET"])
@require_login
def congrats(id: str, isRandom: str):
    info = {
        'data': fetchReviewerInfo(id, "Flashcard"),
        'isRandom': isRandom.lower()
    }

    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/flashcards/congrats.html', info=info, user_name=user_name)


'''
APIs
'''  
@flashcards_bp.route('/save-flashcard', methods=["PUT"])
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
            isRandom=request.form.get("isRandom", type=str)

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

        return make_response(jsonify({'redirect_url': url_for('reviewers.flashcards.review', id=reviewer_id, isRandom=isRandom)}), 200)

    except Exception as e:
        print(f"Error saving flashcards: {e}")
        return jsonify({'message': 'Error saving flashcards'}), 500