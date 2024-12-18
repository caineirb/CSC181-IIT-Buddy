from flask import render_template, request, url_for, session, make_response, jsonify
from modules.controller import require_login, fetchStudent
from modules.reviewers.multiplechoice.controller import fetchMulti, addCard, removeCards
from modules.reviewers.controller import fetchReviewerInfo
from . import multiple_choice_bp
import random
import base64

@multiple_choice_bp.route('/edit/<string:id>', methods=["GET"])
@require_login
def edit(id :str):
    data = fetchMulti(id)
    if not session['user-id'] == data['information'][4]:
        return "Can't edit, not the owner."

    data['id'] = id
    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/multipleChoice/create.html', data=data, user_name=user_name)

@multiple_choice_bp.route('/review/<string:id>/r=<string:isRandom>', methods=["GET"])
@require_login
def review(id: str, isRandom: str):
    multiple_choice = fetchMulti(id)
    multiple_choice['id'] = id
    multiple_choice['isRandom'] = isRandom

    if not isRandom.lower() == 'false':
        # Convert isRandom to a boolean based on the string value
        if isRandom.lower() == 'true':
            random.shuffle(multiple_choice['cards'])
        else:
            return "Invalid Parameter."
    print("Multi: ", multiple_choice)
    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/multipleChoice/review.html', multiple_choice=multiple_choice, user_name=user_name)

@multiple_choice_bp.route('/review/finished/<string:id>/<string:isRandom>', methods=["POST", "GET"])
@require_login
def congrats(id: str, isRandom: str):
    info = {
        'data': fetchReviewerInfo(id, "Multiple Choice"),
        'isRandom': isRandom.lower()
    }

    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/multipleChoice/congrats.html', info=info, user_name=user_name)


'''
APIs
'''  
@multiple_choice_bp.route('/save-multi', methods=["PUT"])
@require_login
def save_multi():
    try:
        reviewer_id = request.form.get('id')
        removeCards(reviewer_id)
        
        multi_count = request.form.get('multi_count', type=int)
        for f in range(1, multi_count + 1):
            question = request.form.get(f"multiple_choice[{f}][question]", type=str)
            correct_answer = request.form.get(f"multiple_choice[{f}][correct_answer]", type=str)
            data_number = request.form.get(f"multiple_choice[{f}][dataNumber]", type=int)
            isRandom=request.form.get("isRandom", type=str)

            # Attempt to retrieve image as file or base64 string
            image_file = request.files.get(f"multiple_choice[{f}][image]", None)
            image_base64 = request.form.get(f"multiple_choice[{f}][image_base64]", None)
            
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
                'question': question,
                'image': image_data,
                'correct_answer': correct_answer,
                'incorrect_answers': request.form.getlist(f"multiple_choice[{f}][incorrect_answer]", type=str)
            }
            addCard(data)
        
        return make_response(jsonify({'redirect_url': url_for('reviewers.multiple_choice.review', id=reviewer_id, isRandom=isRandom)}), 200)

    except Exception as e:
        print(f"Error saving multiple_choice: {e}")
        return jsonify({'message': 'Error saving multiple_choice'}), 500
    

'''
Take Reviewers
'''
@multiple_choice_bp.route('/take/<string:id>', methods=["GET"])
@require_login
def take(id :str):
    data = fetchMulti(id)
    if data['information'][3] == "Private":
        return 'Multiple Choice is Private, access not allowed. <a href="\\">Go Back</a>'

    data['id'] = id
    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/takes/multipleChoice_take.html', data=data, user_name=user_name)

@multiple_choice_bp.route('/take/<string:id>/r=<string:isRandom>', methods=["GET"])
@require_login
def take_review(id: str, isRandom: str):
    multiple_choice = fetchMulti(id)
    if multiple_choice['information'][3] == "Private":
        return 'Multiple Choice is Private, access not allowed. <a href="\\">Go Back</a>'
    multiple_choice['id'] = id
    multiple_choice['isRandom'] = isRandom

    if not isRandom.lower() == 'false':
        # Convert isRandom to a boolean based on the string value
        if isRandom.lower() == 'true':
            random.shuffle(multiple_choice['cards'])
        else:
            return "Invalid Parameter."
        
    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/takes/multipleChoice_review.html', multiple_choice=multiple_choice, user_name=user_name)

@multiple_choice_bp.route('/take/finished/<string:id>/<string:isRandom>', methods=["GET"])
@require_login
def take_congrats(id: str, isRandom: str):
    info = {
        'data': fetchReviewerInfo(id, "Multiple Choice"),
        'isRandom': isRandom.lower()
    }

    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    return render_template('reviewers/takes/multipleChoice_congrats.html', info=info, user_name=user_name)