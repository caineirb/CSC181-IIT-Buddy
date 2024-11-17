from flask import Blueprint

# Initialize the blueprint
add_notes_and_edit_bp = Blueprint('add_notes_and_edit', __name__)

# Import routes to register them with the blueprint
from . import routes, controller
