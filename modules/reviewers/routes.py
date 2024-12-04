from flask import request, redirect, flash, session, url_for, make_response, jsonify
from modules.controller import require_login
from . import reviewers_bp
from .controller import createReviewer, editReviewerInfo, deleteReviewer, checkDuplicateTitle, addCount, customErrorMessages
from modules import mysql

@reviewers_bp.route('/create', methods=["POST"])
@require_login
def create():
    from_url = request.form.get('from_url')
    try:
        data = {
            'title': request.form.get('reviewer-title'),
            'type': request.form.get('reviewer-type'),
            'privacy': request.form.get('reviewer-privacy'),
            'owner_id': session['user-id']
        }
        reviewer_id = createReviewer(data)
        return redirect(url_for('reviewers.edit', id=reviewer_id, type=data['type']))
    except mysql.connection.Error as e:
        # Flash error message and redirect back to the page with the modal
        flash(customErrorMessages(e), "error")
        print(e)
        return redirect(from_url)  # Redirect to the same route to open the modal
    

@reviewers_bp.route('/edit/<string:id>/<string:type>', methods=["GET"])
@require_login
def edit(id :str, type :str):
    match type:
        case "Flashcard":
            return redirect(url_for('reviewers.flashcards.edit', id=id))
        case "Identification":
            return redirect(url_for('reviewers.identifications.edit', id=id))
        # case "Multiple Choice":
        #     return redirect(url_for('', id=id))
        # case "Mixed":
        #     return redirect(url_for('', id=id))
        case _:
            return 'Invalid choice. <a href="\\">Go Back</a>'

@reviewers_bp.route('/save-info', methods=["PUT"])
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
        editReviewerInfo(data)

        return make_response(jsonify({'message': 'Data Saved.'}), 200)
    except Exception as e:
        print(f"Error: {e}")  # Or log it to your logger
        return make_response(jsonify({'message': 'Invalid Request.'}), 400)

@reviewers_bp.route('/delete', methods=["DELETE"])
@require_login
def delete():
    try:
        req = request.get_json()
        deleteReviewer(req['reviewerId'], req['type'])

        return make_response(jsonify({'message': 'Data deleted.'}), 200)
    except Exception as e:
        print(f"Error: {e}")  # Or log it to your logger
        return make_response(jsonify({'message': 'Invalid Request.'}), 400)
    

@reviewers_bp.route('/duplicate', methods=["POST"])
@require_login
def check_duplicate():
    try:
        req = request.get_json()
        idDuplicate = checkDuplicateTitle(req['title'], req['type'], req['id'])[0] > 0
        return make_response(jsonify({'isDuplicate': idDuplicate}), 200)
    except Exception as e:
        print(f"Error: {e}")  # Or log it to your logger
        return make_response(jsonify({'message': 'Invalid Request.'}), 400)
    
@reviewers_bp.route('/counter', methods=["PATCH"])
@require_login
def counter():
    try:
        req = request.get_json()
        addCount(req['id'])
        return make_response(jsonify({'message': 'Reviewer Count Incremented Successfully'}), 200)
    except Exception as e:
        print(f"Error: {e}")  # Or log it to your logger
        return make_response(jsonify({'message': 'Invalid Request.'}), 400) 