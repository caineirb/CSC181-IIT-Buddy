// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#noteForm');
    const modalElement = document.querySelector('#exampleModal');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);

    // Add event listener for form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        // Get form values
        const noteTitle = document.querySelector('#noteTitle').value.trim();
        const noteLink = document.querySelector('#noteLink').value.trim();
        const privacyValue = document.querySelector('#privacy_value').value;
        const csrfToken = document.querySelector('#csrf_token').value;

        if (!noteTitle || !noteLink || !privacyValue || !csrfToken) {
            alert('All fields are required.');
            return;
        }

        // Create note data object
        const noteData = {
            title: noteTitle,
            link: noteLink,
            privacy: privacyValue,
        };

        // Send note data to the server
        fetch('/add_note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(noteData),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        console.error('Error response:', data);
                        throw new Error(data.message);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.message === 'Note added successfully') {
                    // Add the new note to the UI
                    addNoteBox(noteTitle, noteLink, privacyValue);
                    form.reset(); // Reset the form

                    // Hide the modal
                    modalInstance.hide();

                    // Ensure the backdrop is removed
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }

                    // Ensure the modal is fully hidden
                    modalElement.classList.remove('show');  
                    modalElement.style.display = 'none';
                    document.body.classList.remove('modal-open');
                    document.body.style.paddingRight = ''; // Reset padding-right

                    // Reapply the modal backdrop when the modal is shown again
                    modalElement.addEventListener('shown.bs.modal', () => {
                        const newBackdrop = document.createElement('div');
                        newBackdrop.className = 'modal-backdrop fade show';
                        document.body.appendChild(newBackdrop);
                        document.body.classList.add('modal-open');
                    });

                    // Refresh notes list on noteslist.html
                    if (window.location.pathname === '/notes_list') {
                        fetchNotes();
                    }
                } else {
                    console.error('Error:', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error.message); // Display the error message to the user
            });
    });

    // Ensure notes are fetched when the main page is loaded
    if (window.location.pathname === '/notes_list') {
        fetchNotes();
    }
    
    // Add a new note box to the UI
    function addNoteBox(title, link, privacy) {
        const userNameElement = document.querySelector('#userName');
        if (!userNameElement) {
            console.error('User name element not found');
            return;
        }
        const userName = userNameElement.value;
        const notesContainer = document.querySelector('#notes-container .row');
        if (!notesContainer) {
            console.error('Notes container not found');
            return;
        }
        const noteBox = document.createElement('a');
        noteBox.href = link;
        noteBox.className = 'd-flex justify-content-center align-items-center position-relative col withpad';
        noteBox.style = 'height: 245px; width: 250px; background-color: #FFFFF0; border-radius: 15px; text-decoration: none;';
        noteBox.innerHTML = `
            <div class="text-center" style="margin-top: 20px;">
                <div style="height: 135px; width: 210px; background-color: #D9D9D9; display: flex; align-items: center; justify-content: center;">
                    <p style="color: white; font-family: DM Mono; font-size: 24px; margin: 0;">Preview</p>
                </div>
                <span style="display: block; font-size: 24px; font-family: DM Mono; color: black; margin-top: 10px;">${title}</span>
                <p style="font-size: 16px; font-family: DM Mono; color: rgba(0, 0, 0, 0.5); margin: 0;">${userName}</p>
                <p style="text-align: right; font-size: 14px; font-family: DM Mono; color: rgba(0, 0, 0, 0.5); margin-top: 10px;">${privacy}</p>
            </div>
        `;
        notesContainer.appendChild(noteBox);
        console.log('Note added:', { title, link, privacy });
    }

    // Fetch notes and update the notes list
    function fetchNotes() {
        fetch('/get_notes')
            .then(response => response.json())
            .then(data => {
                const notesContainer = document.getElementById('notesContainer');
                notesContainer.innerHTML = ''; // Clear existing notes
                if (data.notes) {
                    data.notes.forEach(note => {
                        addNoteBox(note.title, note.link, note.privacy, note.userName);
                    });
                }
            })
            .catch(error => console.error('Error fetching notes:', error));
    }
});
