from . import app
from flask import session, redirect, url_for, render_template, request, jsonify, make_response
from modules.controller import checkStudent, createStudent, require_login, decode_google_jwt, fetchStudent, timer_get_set, timer_save_set, timer_get_state, timer_save_state, default_user_timer
from modules.reviewers.controller import fetchPreview
from modules.notes.controller import fetchPreviewNotes
from config import CLIENT_ID


@app.route('/', methods=["GET"])
def index():
    if 'user-id' not in session:
        return render_template('landingpage.html', client_id=CLIENT_ID)
    
    studentData = fetchStudent(session['user-id'])
    GetName = studentData[0][1] if studentData else None

    notes_data = fetchPreviewNotes(session['user-id'])

    # Flashcards
    reviewers_data = {
        'data': fetchPreview(session['user-id']),
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
    return render_template('main.html', userName = GetName, notes_data=notes_data, reviewers_data=reviewers_data)    # Pulihi nalang ni sa unsa ang e render pag naka login na

@app.route('/login', methods=["POST"])
def login():
    try:
        req = request.get_json()
        token = req.get('token')

        if not token:
            return make_response(jsonify({'message': 'Token is required'}), 400)

        decoded_token = decode_google_jwt(token)

        if not decoded_token:
            return make_response(jsonify({'message': 'Invalid or expired token'}), 400)

        student_id = decoded_token.get('sub')
        student_name = decoded_token.get('name')
        student_email = decoded_token.get('email')
        student_picture = decoded_token.get('picture')

        success_code = 200
        if checkStudent(student_id):
            student = (student_id, student_name, student_email)
            createStudent(student)
            success_code = 201
        
        session['user-id'] = student_id
        session['user-photo'] = student_picture

        return make_response(jsonify({'redirect_url': session.pop('next_url', url_for('index'))}), success_code)
    except Exception as e:
        print(f"Error: {str(e)}")
        return make_response(jsonify({'message': 'Invalid JSON format', 'error': str(e)}), 400)

@app.route('/logout')
@require_login
def logout():
    default_user_timer(session['user-id'])
    
    session.pop('user-id', None)
    session.pop('user-photo', None)
    return redirect(url_for('index'))


'''
Timer API
'''
@app.route('/timer', methods=["POST", "GET"])
@require_login
def timer():
    try:
        if request.method == "GET":
            return make_response(jsonify(timer_get_state(session['user-id'])), 200)
        else:
            time = request.get_json()
            timer_state = {
                "hours": time.get("hours", 0),
                "minutes": time.get("minutes", 0),
                "seconds": time.get("seconds", 0),
                "isRunning": time.get("isRunning", False),
                "isPaused": time.get("isPaused", False)
            }
            timer_save_state(session['user-id'], timer_state)
            return make_response(jsonify({"message": "Timer state saved successfully"}), 200)
    except Exception as e:
        print(str(e))
        return make_response(jsonify({"error": str(e)}), 400)


@app.route('/set-timer', methods=["POST", "GET"])
@require_login
def timerSet():
    try:
        if request.method == "GET":
            return make_response(jsonify(timer_get_set(session['user-id'])), 200)
        else:
            time = request.get_json()
            timer_set = {
                "set_hours": time.get("set_hours", 0),
                "set_minutes": time.get("set_minutes", 0),
                "set_seconds": time.get("set_seconds", 0)
            }
            timer_save_set(session['user-id'], timer_set)
            return make_response(jsonify({"message": "Timer set successfully"}), 200)
    except Exception as e:
        print(str(e))
        return make_response(jsonify({"error": str(e)}), 400)