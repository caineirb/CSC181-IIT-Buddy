from flask import flash, render_template, request, session, redirect, url_for, make_response, jsonify
from modules.controller import require_login, fetchStudent, getCourses
from modules.reviewers.controller import customErrorMessages, fetchReviewerInfo
from modules.reviewersFeed.controller import countReviewers, fetchReviewers, addViewCount, saveReviewer, unsaveReviewer, saveNote, unsaveNote
from . import reviewers_feed_bp
from modules import mysql


'''
Reviewers List routes
'''

ITEMS_PER_PAGE = 2  # Change lang if ganahan ka

@reviewers_feed_bp.route('/', methods=["GET"])
@require_login
def index():
    studentData = fetchStudent(session['user-id'])
    user_name = studentData[0][1] if studentData else None
    try:
        type = request.args.get('list', 'All Reviewers', type=str)
        searched_item = request.args.get('search_input', None, type=str)
        order = request.args.get('sort_by', 'DESC', type=str)
        page = request.args.get('page', 1, type=int)
        course = request.args.get('sort_course', None, type=str)
        reviewers_data = {
            'data': fetchReviewers(type, searched_item, order, page, course, ITEMS_PER_PAGE, session['user-id']),
            'details': {
                'totalCount': countReviewers(type, searched_item, order),
                'countPerPage': ITEMS_PER_PAGE
            },
            'searchParams': {
                'type': type,
                'searched_item': searched_item,
                'order': order,
                'page': page,
                'course': course
            },
            'bgcolor': {
                'Flashcard': "#0C203E",
                'Identification': "#D1E078",
                'Multiple Choice': "#E07878",
                'Mixed': "#004456"
            },
            'fgcolor': {
                'Flashcard': "#FFFFFF",
                'Identification': "#000000",
                'Multiple Choice': "#000000",
                'Mixed': "#FFFFFF"
            }
        }

        return render_template('reviewersFeed/reviewersFeed.html', user_name=user_name, courses=getCourses(), reviewers_data=reviewers_data)

    except mysql.connection.Error as e:
        flash(customErrorMessages(e), "danger")
        print(e)
        # Provide default values for the template in case of an error
        reviewers_data = {
            'data': [],
            'details': {
                'totalCount': 0,
                'countPerPage': ITEMS_PER_PAGE
            },
            'searchParams': {
                'type': 'All',
                'searched_item': '',
                'order': 'DESC',
                'page': 1
            },
            'bgcolor': {},
            'fgcolor': {}
        }
        return render_template('reviewersFeed/reviewersFeed.html', user_name=user_name , reviewers_data=reviewers_data)
    


@reviewers_feed_bp.route('/take/<string:id>/<string:type>', methods=["GET"])
@require_login
def take_reviewer(id :str, type :str):
    # Redirect to edit when the viewer is the owner
    # if session['user-id'] == fetchReviewerInfo(id, type)[5]:
    #     return redirect(url_for('reviewers.edit', id=id, type=type))
    
    match type:
        case "Flashcard":
            return redirect(url_for('reviewers.flashcards.take', id=id))
        case "Identification":
            return redirect(url_for('reviewers.identifications.take', id=id))
        case "Multiple Choice":
            return redirect(url_for('reviewers.multiple_choice.take', id=id))
        case "Mixed":
            return redirect(url_for('reviewers.mixed.take', id=id))
        case _:
            return 'Invalid choice. <a href="\\">Go Back</a>'
        
@reviewers_feed_bp.route('/counter', methods=["PATCH"])
@require_login
def viewCounter():
    try:
        req = request.get_json()
        # Only increment when the viewer is not the owner
        if not session['user-id'] == fetchReviewerInfo(req['id'], req['type'])[5]:
            addViewCount(req['id'])
        return make_response(jsonify({'message': 'Note Count Incremented Successfully'}), 200)
    except Exception as e:
        print(f"Error: {e}")  # Or log it to your logger
        return make_response(jsonify({'message': 'Invalid Request.'}), 400) 
    


@reviewers_feed_bp.route('/saved-items', methods=["POST"])
@require_login
def saveItems():
    try:
        req = request.get_json()
        
        if req['type'] == 'Reviewer':
            if req['isSaved']:
                saveReviewer(req['reviewer_id'], session['user-id'])
            else:
                unsaveReviewer(req['reviewer_id'], session['user-id'])
        elif req['type'] == 'Note':
            if req['isSaved']:
                saveNote(req['reviewer_id'], session['user-id'])
            else:
                unsaveNote(req['reviewer_id'], session['user-id'])
        else:
            return make_response(jsonify({'message': 'Invalid Type.'}), 400)
  
        return make_response(jsonify({'message': f"{req['type']} Saved Successfully"}), 200)
    except Exception as e:
        print(f"Error: {e}")  # Or log it to your logger
        return make_response(jsonify({'message': 'Invalid Request.'}), 400)