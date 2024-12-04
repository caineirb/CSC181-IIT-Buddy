from . import notes_bp
from modules import mysql
from flask import session, render_template, request, jsonify, make_response
from modules.controller import require_login, fetchStudent, calculate_time_passed
from modules.notes.controller import createNote, deleteNote, updateNote, fetchPreviewNotes, addViewer, fetchNoteOwner

@notes_bp.route('/add_note', methods=["POST"])
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
        createNote(note)  # This function interacts with the database to add the note

        return make_response(jsonify({'message': 'Note added successfully'}), 201)
    except ValueError as e:
        return make_response(jsonify({'message': "Note with the same title or link already exists."}), 400)
    except Exception as e:
        return make_response(jsonify({'message': 'Failed to add note', 'error': str(e)}), 500)
    
@notes_bp.route('/delete_note/<string:id>', methods=["DELETE"])
@require_login
def delete_note(id :str):
    try:
        deleteNote(id)
        return make_response(jsonify({'message': 'Note deleted successfully'}), 200)
    except Exception as e:
        print(f"Error fetching notes: {str(e)}")  # Add detailed logging
        return jsonify({'error': f'Failed to fetch notes: {str(e)}'}), 500
    
@notes_bp.route('/update_note', methods=["PUT"])
@require_login
def update_note():
    try:
        note_data = request.get_json()
        note_id = note_data.get('id')
        note_title = note_data.get('title')
        note_privacy = note_data.get('privacy')
        note_link = note_data.get('link')
        
        updateNote((note_title, note_privacy, note_link, note_id))
        return make_response(jsonify({'message': 'Note updated successfully'}), 200)
    except Exception as e:
        print(f"Error fetching notes: {str(e)}")  # Add detailed logging
        return jsonify({'error': f'Failed to fetch notes: {str(e)}'}), 500

@notes_bp.route('/notes_list', methods=["GET"])
@require_login
def notes_list():
    studentData = fetchStudent(session['user-id'])
    GetName = studentData[0][1] if studentData else None
    return render_template('notes/noteslist.html', userName=GetName, userIMG=session['user-photo'])

@notes_bp.route('/prev', methods=["GET"])
@require_login
def fetch_preview():
    try:
        notes = fetchPreviewNotes(session['user-id'])
        if notes is None:
            notes = []
        return make_response(jsonify({'notes': notes}), 200)
    except Exception as e:
        print(f"Error fetching preview notes: {str(e)}")  # Log error
        return jsonify({'error': f'Failed to fetch notes: {str(e)}'}), 500


@notes_bp.route('/get_notes', methods=["GET"])
@require_login
def get_notes():
    try:
        user_id = session.get('user-id')
        if not user_id:
            raise ValueError("User ID not found in session")

        page = request.args.get('page', 1, type=int)
        notes_per_page = 9  # Set notes per page to 9
        offset = (page - 1) * notes_per_page
        search_query = request.args.get('search_query', '', type=str)
        privacy = request.args.get('privacy', 'All', type=str)
        sort = request.args.get('sort_by', 'DESC', type=str)
        
        cur = mysql.connection.cursor()
        query = """
            SELECT notes.id, notes.title, notes.link, notes.privacy, students.name, notes.created_on
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

        query += f" ORDER BY `created_on` {sort} LIMIT %s OFFSET %s;"
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

        notes_list = [{'id': note[0], 'title': note[1], 'link': note[2], 'privacy': note[3], 'userName': note[4], 'created_on': calculate_time_passed(note[5])} for note in notes]
        total_pages = (total_notes + notes_per_page - 1) // notes_per_page  # Calculate total pages
        return jsonify({'notes': notes_list, 'total_notes': total_notes, 'total_pages': total_pages})
    except Exception as e:
        print(f"Error fetching notes: {str(e)}")  # Add detailed logging
        return jsonify({'error': f'Failed to fetch notes: {str(e)}'}), 500
    
@notes_bp.route('/counter', methods=["PATCH"])
@require_login
def viewCounter():
    try:
        req = request.get_json()
        # Only increment when the viewer is not the owner
        if not session['user-id'] == fetchNoteOwner(req['id']):
            addViewer(req['id'])
        return make_response(jsonify({'message': 'Note Count Incremented Successfully'}), 200)
    except Exception as e:
        print(f"Error: {e}")  # Or log it to your logger
        return make_response(jsonify({'message': 'Invalid Request.'}), 400) 