// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#noteForm');
    
    // Add event listener for form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        // Get form values
        const noteTitle = document.querySelector('#noteTitle').value.trim();
        const noteLink = document.querySelector('#noteLink').value.trim();
        const privacyValue = document.querySelector('#privacy_value').value;
        const csrfToken = document.querySelector('#csrf_token').value;

        // Create note data object
        const noteData = {
            title: noteTitle,
            link: noteLink,
            privacy: privacyValue,
        };

        fetch('/notes/add_note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken, // Ensure this matches the server-side implementation
            },
            body: JSON.stringify(noteData),
        })
            .then(response => {
                // Check if the response is JSON or an HTML error page
                if (!response.ok) {
                    // Attempt to parse JSON error if available
                    return response.json().catch(() => {
                        throw new Error('Unexpected error occurred.');
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.message === 'Note added successfully') {
                    Swal.fire({
                        text:  data.message,
                        icon: "success"
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    throw new Error(data.message || 'Failed to add the note.');
                }
            })
            .catch(error => {
                Swal.fire({
                    text:  error.message || 'An unexpected error occurred.',
                    icon: "error"
                });
            });
    });
});

const csrfToken = document.getElementById("notes_csrf_token").value;

document.addEventListener('DOMContentLoaded', function () {
    // Define the function to load notes
    function loadNotes() {
        fetch('/notes/prev')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched notes:', data); // Log fetched data
                if (data) {
                    const notesContainer = document.getElementById('notesContainer');
                    if (!notesContainer) {
                        console.error('Notes container not found!');
                        return;
                    }
                    notesContainer.innerHTML = ''; // Clear existing notes
                    data['notes'].forEach(note => {
                        console.log('Adding note:', note); // Log each note being added
                        addNoteBox(note[0], note[1], note[2], note[3], note[4]);
                    });
                }
            })
            .catch(error => console.error('Error fetching notes:', error));
    }

    // Call the function after defining it
    loadNotes();
});


// Add a note box to the UI
function addNoteBox(id, title, link, privacy, userName) {
    const notesContainer = document.getElementById('notesContainer');
    const noteBox = document.createElement('div'); // Changed to div to contain both link and buttons
    noteBox.className = 'd-flex justify-content-center align-items-center position-relative col withpad note-box';
    noteBox.innerHTML = `
        <a href="${link}" class="note-link" target="_blank">
            <div class="text-center" style="margin-top: 25px;">
                <span style="display: block; font-size: 24px; font-family: DM Mono; color: black; margin-top: 10px;">${title}</span>
                <p style="font-size: 16px; font-family: DM Mono; color: rgba(0, 0, 0, 0.5); margin: 0;">${userName}</p>
                <p style="text-align: right; font-size: 14px; font-family: DM Mono; color: rgba(0, 0, 0, 0.5); margin-top: 10px;">${privacy}</p>
            </div>
        </a>
        <div class="note-buttons" style="position: absolute; top: 5px; left: 10px; display: flex;">
            <button class="edit-note-btn" style="font-size: 12px; padding: 5px 10px; margin: 2px; background-color: green; color: white;">
                <i class="fas fa-pen"></i>
            </button>
            <button class="delete-note-btn" style="font-size: 12px; padding: 5px 10px; margin: 2px; background-color: red; color: white;" data-id=${id}>
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    notesContainer.appendChild(noteBox);
    
    // Add event listeners for edit and delete buttons
    noteBox.querySelector('.delete-note-btn').addEventListener('click', function () {
        const noteId = this.getAttribute('data-id');
        // Confirmation before deletion
        Swal.fire({
            title: "Are you sure you want to delete this note?",
            text: "Once deleted, it can never be recovered.",
            icon: "warning",
            showCancelButton: true
        }).then((willDelete) => {
            if (willDelete.isConfirmed){
                // Call API to delete the note
                fetch(`/notes/delete_note/${noteId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                })
                .then(response => {
                    if (response.ok) {
                        Swal.fire({
                            text:  `Note '${title}' has been deleted successfully.`,
                            icon: "success"
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            text:  'Failed to delete the note. Please try again.',
                            icon: "error"
                        });
                    }
                })
                .catch(error => {
                    Swal.fire({
                        text:  `An error occurred. Please try again later. \n Error: ${error}`,
                        icon: "error"
                    });
                });
            } else {
                Swal.fire({
                    text: "Note deletion is cancelled."
                });
            }
        }); 
    });

    noteBox.querySelector('.edit-note-btn').addEventListener('click', function() {
        const editModal = new bootstrap.Modal(document.getElementById('editNoteModal'));
        document.getElementById('editNoteTitle').value = title;
        document.getElementById('editNoteLink').value = link;
        document.getElementById('editNotePrivacy').value = privacy;

        document.getElementById('saveEditNote').onclick = function() {
            const newTitle = document.getElementById('editNoteTitle').value.trim();
            const newLink = document.getElementById('editNoteLink').value.trim();
            const newPrivacy = document.getElementById('editNotePrivacy').value;
            if (newTitle) {
                noteBox.querySelector('.note-link span').innerText = newTitle;
            }
            if (newLink) {
                noteBox.querySelector('.note-link').href = newLink;
            }
            if (newPrivacy) {
                noteBox.querySelector('.note-link p:last-child').innerText = newPrivacy;
            }
            editModal.hide();

            if (!newTitle || !newLink || !newPrivacy) {
                Swal.fire({
                    text:  'All fields are required.',
                    icon: "warning"
                });
                return;
            }
            

            //save the notes
            const noteId = noteBox.querySelector('.delete-note-btn').getAttribute('data-id');
            const note_data = {
                'id': noteId,
                'title': newTitle,
                'privacy': newPrivacy,
                'link': newLink
            }

            // Call API to delete the note
            fetch(`/notes/update_note`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(note_data)
            })
            .then(response => {
                if (response.ok) {
                    Swal.fire({
                        text:  `Note '${newTitle}' has been updated successfully.`,
                        icon: "success"
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        text:  'Failed to update the note. Please try again.',
                        icon: "error"
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    text:  `An error occurred. Please try again later. \n Error: ${error}`,
                    icon: "error"
                });
            });
        };
        
        editModal.show();
    });
}