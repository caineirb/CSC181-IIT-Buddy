from flask import render_template, request, url_for, session, make_response, jsonify
from modules.controller import require_login, fetchStudent
from modules.reviewers.identifications.controller import fetchIdentification, addCard, removeCards
from modules.reviewers.controller import fetchReviewerInfo
from . import identifications_bp
import random
import base64

@identifications_bp.route('/edit/<string:id>', methods=["GET"])
@require_login
def edit(id :str):
    data = fetchIdentification(id)
    if not session['user-id'] == data['information'][4]:
        return "Can't edit, not the owner."

    data['id'] = id

    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/identifications/create.html', data=data, user_name=user_name)

@identifications_bp.route('/review/<string:id>/r=<string:isRandom>', methods=["GET"])
@require_login
def review(id: str, isRandom: str):
    identifications = fetchIdentification(id)
    identifications['id'] = id
    identifications['isRandom'] = isRandom

    if not isRandom.lower() == 'false':
        # Convert isRandom to a boolean based on the string value
        if isRandom.lower() == 'true':
            random.shuffle(identifications['cards'])
        else:
            return "Invalid Parameter."
        
    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/identifications/review.html', identifications=identifications, user_name=user_name)

@identifications_bp.route('/review/finished/<string:id>/<string:isRandom>', methods=["POST", "GET"])
@require_login
def congrats(id: str, isRandom: str):
    info = {
        'data': fetchReviewerInfo(id, "Identification"),
        'isRandom': isRandom.lower()
    }

    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/identifications/congrats.html', info=info, user_name=user_name)


'''
APIs
'''  
@identifications_bp.route('/save-identification', methods=["PUT"])
@require_login
def save_identification():
    try:
        reviewer_id = request.form.get('id')
        removeCards(reviewer_id)
        
        identification_count = request.form.get('identification_count', type=int)
        for f in range(1, identification_count + 1):
            # Retrieve term, definition, and other data
            term = request.form.get(f"identifications[{f}][term]")
            definition = request.form.get(f"identifications[{f}][definition]")
            data_number = request.form.get(f"identifications[{f}][dataNumber]", type=int)
            isRandom=request.form.get("isRandom", type=str)

            # Attempt to retrieve image as file or base64 string
            image_file = request.files.get(f"identifications[{f}][image]", None)
            image_base64 = request.form.get(f"identifications[{f}][image_base64]", None)
            
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

        return make_response(jsonify({'redirect_url': url_for('reviewers.identifications.review', id=reviewer_id, isRandom=isRandom)}), 200)

    except Exception as e:
        print(f"Error saving identifications: {e}")
        return jsonify({'message': 'Error saving identifications'}), 500
    
'''
Take Reviewers
'''
@identifications_bp.route('/take/<string:id>', methods=["GET"])
@require_login
def take(id :str):
    data = fetchIdentification(id)
    if data['information'][3] == "Private":
        return 'Flashcard is Private, access not allowed. <a href="\\">Go Back</a>'

    data['id'] = id

    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/takes/identifications_take.html', data=data, user_name=user_name)

@identifications_bp.route('/take/<string:id>/r=<string:isRandom>', methods=["GET"])
@require_login
def take_review(id: str, isRandom: str):
    identifications = fetchIdentification(id)
    if identifications['information'][3] == "Private":
        return 'Flashcard is Private, access not allowed. <a href="\\">Go Back</a>'
    identifications['id'] = id
    identifications['isRandom'] = isRandom

    if not isRandom.lower() == 'false':
        # Convert isRandom to a boolean based on the string value
        if isRandom.lower() == 'true':
            random.shuffle(identifications['cards'])
        else:
            return "Invalid Parameter."
        
    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/takes/identifications_review.html', identifications=identifications, user_name=user_name)

@identifications_bp.route('/take/finished/<string:id>/<string:isRandom>', methods=["GET"])
@require_login
def take_congrats(id: str, isRandom: str):
    info = {
        'data': fetchReviewerInfo(id, "Identification"),
        'isRandom': isRandom.lower()
    }

    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/takes/identifications_congrats.html', info=info, user_name=user_name)