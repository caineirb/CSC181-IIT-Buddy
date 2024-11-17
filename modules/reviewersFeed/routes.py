from flask import flash, render_template, request, session
from modules.controller import require_login, fetchStudent, customErrorMessages
from modules.reviewersFeed.controller import countReviewers, fetchReviewers
from . import reviewers_feed_bp
from modules import mysql


'''
Reviewers List routes
'''

ITEMS_PER_PAGE = 2  # Change lang if ganahan ka

@reviewers_feed_bp.route('/', methods=["GET"])
@require_login
def index():
    try:
        type = request.args.get('list', 'All', type=str)
        searched_item = request.args.get('search_input', None, type=str)
        order = request.args.get('sort_by', 'DESC', type=str)
        page = request.args.get('page', 1, type=int)

        reviewers_data = {
            'data': fetchReviewers(session['user-id'], type, searched_item, order, page, ITEMS_PER_PAGE),
            'details': {
                'totalCount': countReviewers(session['user-id'], type, searched_item, order),
                'countPerPage': ITEMS_PER_PAGE
            },
            'searchParams': {
                'type': type,
                'searched_item': searched_item,
                'order': order,
                'page': page
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

        studentData = fetchStudent(session['user-id'])
        user_name = studentData[0][1] if studentData else None
        return render_template('reviewersFeed/reviewersFeed.html', user_name=user_name, reviewers_data=reviewers_data)

    except mysql.connection.Error as e:
        flash(customErrorMessages(e), "danger")
        print(e)
        # Provide default values for the template in case of an error
        flashcards_data = {
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
        return render_template('reviewersFeed/reviewersFeed.html', user_name=fetchStudent(session['user-id'])[0][1] , flashcards_data=flashcards_data)
    


@reviewers_feed_bp.route('/take/<string:id>', methods=["GET"])
@require_login
def take_reviewer(id :str):
    return f"<h1>Take reviewer function is not available right now, try again next sprint. Reviewer ID: {id}</h1>"