from flask import flash, render_template, request, session
from modules.controller import require_login, fetchStudent, customErrorMessages
from . import reviewers_list_bp
from modules.reviewers.reviewersList.controller import fetchReviewers, countReviewers
from modules import mysql


'''
Reviewers List routes
'''
ITEMS_PER_PAGE = 5  # Change lang if ganahan ka
@reviewers_list_bp.route('/', methods=["GET"])
@require_login
def index():
    try:
        type = request.args.get('list', 'All', type=str)
        searched_item = request.args.get('search_input', None, type=str)
        privacy = request.args.get('privacy_option', 'All', type=str)
        order = request.args.get('sort_by', 'DESC', type=str)
        page = request.args.get('page', 1, type=int)

        reviewers = {
            'data': fetchReviewers(session['user-id'], type, searched_item, privacy, order, page, ITEMS_PER_PAGE),
            'details': {
                'totalCount': countReviewers(session['user-id'], type, searched_item, privacy, order),
                'countPerPage': ITEMS_PER_PAGE
            },
            'searchParams': {
                'type': type,
                'searched_item': searched_item,
                'privacy': privacy,
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
        return render_template('reviewers/reviewersList/reviewerslist.html', user_name=user_name, reviewers=reviewers)

    except mysql.connection.Error as e:
        flash(customErrorMessages(e), "danger")
        print(e)
        # Provide default values for the template in case of an error
        reviewers = {
            'data': [],
            'details': {
                'totalCount': 0,
                'countPerPage': ITEMS_PER_PAGE
            },
            'searchParams': {
                'type': 'All',
                'searched_item': '',
                'privacy': 'All',
                'order': 'DESC',
                'page': 1
            },
            'bgcolor': {},
            'fgcolor': {}
        }
        return render_template('reviewers/reviewersList/reviewerslist.html', user_name=fetchStudent(session['user-id'])[0][1] , reviewers=reviewers)
