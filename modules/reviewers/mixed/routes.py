from flask import render_template, request, url_for, session, make_response, jsonify
from modules.controller import require_login, fetchStudent
from modules.reviewers.mixed.controller import fetchMixed, addCard, removeCards
from modules.reviewers.controller import fetchReviewerInfo
from . import mixed_bp
import random
import base64

@mixed_bp.route('/edit/<string:id>', methods=["GET"])
@require_login
def edit(id :str):
    data = fetchMixed(id)
    if not session['user-id'] == data['information'][4]:
        return "Can't edit, not the owner."

    data['id'] = id
    print(data)
    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/mixed/create.html', data=data, user_name=user_name)

@mixed_bp.route('/review/<string:id>/r=<string:isRandom>', methods=["GET"])
@require_login
def review(id: str, isRandom: str):
    mixed = fetchMixed(id)
    mixed['id'] = id
    mixed['isRandom'] = isRandom

    print(mixed)
    if not isRandom.lower() == 'false':
        # Convert isRandom to a boolean based on the string value
        if isRandom.lower() == 'true':
            random.shuffle(mixed['cards'])
        else:
            return "Invalid Parameter."
        
    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/mixed/review.html', mixed=mixed, user_name=user_name)

@mixed_bp.route('/review/finished/<string:id>/<string:isRandom>', methods=["POST", "GET"])
@require_login
def congrats(id: str, isRandom: str):
    info = {
        'data': fetchReviewerInfo(id, "Mixed"),
        'isRandom': isRandom.lower()
    }

    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/mixed/congrats.html', info=info, user_name=user_name)


'''
APIs
'''  
@mixed_bp.route('/save-mixed', methods=["PUT"])
@require_login
def save_mix():
    try:
        reviewer_id = request.form.get('id')
        removeCards(reviewer_id)
        
        mixed_count = request.form.get('mixed_count', type=int)
        for f in range(1, mixed_count + 1):
            # Retrieve term, definition, and other data
            term = request.form.get(f"mixed[{f}][term]")
            definition = request.form.get(f"mixed[{f}][definition]")
            data_number = request.form.get(f"mixed[{f}][dataNumber]", type=int)
            isRandom=request.form.get("isRandom", type=str)

            # Attempt to retrieve image as file or base64 string
            image_file = request.files.get(f"mixed[{f}][image]", None)
            image_base64 = request.form.get(f"mixed[{f}][image_base64]", None)
            
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

        return make_response(jsonify({'redirect_url': url_for('reviewers.mixed.review', id=reviewer_id, isRandom=isRandom)}), 200)

    except Exception as e:
        print(f"Error saving mixed: {e}")
        return jsonify({'message': 'Error saving mixed'}), 500