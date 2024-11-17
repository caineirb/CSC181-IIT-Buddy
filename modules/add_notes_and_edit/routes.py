from flask import request, jsonify
from . import add_notes_and_edit_bp  # Import the initialized blueprint
from .controller import add_note  # Assuming add_note is in controller.py

@add_notes_and_edit_bp.route('/add_note', methods=['POST'])
def add_note_route():
    try:
        if request.is_json:
            data = request.get_json()
            name = data.get('name')
            link = data.get('link')
            privacy = data.get('privacy')
            owner_id = data.get('owner_id')
            result = add_note(name, link, privacy, owner_id)
            return jsonify(result)
        else:
            return jsonify({"status": "error", "message": "Unsupported Media Type"}), 415
    except Exception as e:
        print(f"Error: {str(e)}")  # Log the full error for debugging
        return jsonify({"status": "error", "message": str(e)}), 500
