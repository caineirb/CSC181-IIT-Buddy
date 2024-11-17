from . import app, mysql  # Import mysql here
from flask import session, redirect, url_for, render_template, request, jsonify, make_response
from modules.controller import checkStudent, createStudent, require_login, decode_google_jwt, fetchStudent, createNote
from config import CLIENT_ID


@app.route('/')
def index():
    if 'user-id' not in session:
        return render_template('landingpage.html', client_id=CLIENT_ID)
    
    studentData = fetchStudent(session['user-id'])
    GetName = studentData[0][1] if studentData else None
    return render_template('main.html', userName=GetName, userIMG=session['user-photo'])

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

        return make_response(jsonify({'redirect_url': url_for('index')}), success_code)
    except Exception as e:
        print(f"Error: {str(e)}")
        return make_response(jsonify({'message': 'Invalid JSON format', 'error': str(e)}), 400)

@app.route('/logout')
@require_login
def logout():
    session.pop('user-id', None)
    session.pop('user-photo', None)
    return redirect(url_for('index'))

@app.route('/add_note', methods=["POST"])
@require_login
def add_note():
    try:
        note_data = request.get_json()
        note_title = note_data.get('title')
        note_privacy = note_data.get('privacy')
        note_link = note_data.get('link')
        owner_id = session['user-id']

        if not note_title or not note_privacy or not note_link:
            return make_response(jsonify({'message': 'All fields are required'}), 400)

        note = (note_title, note_privacy, owner_id, note_link)
        createNote(note)

        return make_response(jsonify({'message': 'Note added successfully'}), 201)
    except ValueError as e:
        return make_response(jsonify({'message': str(e)}), 400)
    except Exception as e:
        if 'duplicate entry' in str(e).lower():
            return make_response(jsonify({'message': 'Note already exists'}), 400)
        print(f"Error: {str(e)}")
        return make_response(jsonify({'message': 'Failed to add note', 'error': str(e)}), 500)

@app.route('/notes_list')
@require_login
def notes_list():
    studentData = fetchStudent(session['user-id'])
    GetName = studentData[0][1] if studentData else None
    return render_template('noteslist.html', userName=GetName, userIMG=session['user-photo'])

@app.route('/get_notes')
@require_login
def get_notes():
    try:
        user_id = session.get('user-id')
        if not user_id:
            raise ValueError("User ID not found in session")

        page = request.args.get('page', 1, type=int)
        notes_per_page = 20
        offset = (page - 1) * notes_per_page
        search_query = request.args.get('search_query', '', type=str)
        privacy = request.args.get('privacy', 'All', type=str)
        sort = request.args.get('sort', 'Most Recent', type=str)

        cur = mysql.connection.cursor()
        query = """
            SELECT notes.title, notes.link, notes.privacy, students.name, notes.created_on
            FROM notes
            JOIN students ON notes.owner_id = students.id
            WHERE notes.owner_id = %s
        """
        params = [user_id]

        if search_query:
            query += " AND notes.title LIKE %s"
            params.append(f"%{search_query}%")

        if privacy != 'All':
            query += " AND notes.privacy = %s"
            params.append(privacy)

        if sort == 'Most Recent':
            query += " ORDER BY notes.created_on DESC"
        elif sort == 'Oldest':
            query += " ORDER BY notes.created_on ASC"

        query += " LIMIT %s OFFSET %s"
        params.extend([notes_per_page, offset])

        cur.execute(query, tuple(params))
        notes = cur.fetchall()

        count_query = "SELECT COUNT(*) FROM notes WHERE owner_id = %s"
        count_params = [user_id]

        if search_query:
            count_query += " AND title LIKE %s"
            count_params.append(f"%{search_query}%")

        if privacy != 'All':
            count_query += " AND privacy = %s"
            count_params.append(privacy)

        cur.execute(count_query, tuple(count_params))
        total_notes = cur.fetchone()[0]

        notes_list = [{'title': note[0], 'link': note[1], 'privacy': note[2], 'userName': note[3], 'created_on': note[4]} for note in notes]
        return jsonify({'notes': notes_list, 'total_notes': total_notes})
    except Exception as e:
        print(f"Error fetching notes: {str(e)}")  # Add detailed logging
        return jsonify({'error': f'Failed to fetch notes: {str(e)}'}), 500


