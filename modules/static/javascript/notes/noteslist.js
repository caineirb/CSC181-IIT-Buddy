// JavaScript for handling types, search, privacy option, and sort functionality

let list = document.getElementById("list");
let icon = document.getElementById("icon");
let span = document.getElementById("span");
let input = document.getElementById("search-input");
let listItems = document.querySelectorAll(".dropdown-list-item");
let searchFieldInput = document.getElementById("search-field");
let privacyOption = document.getElementById("privacy-option");
let sortBy = document.getElementById("sort_by");

// Get CSRF Token from the meta tag
let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// Remove the dropdownBtnText related code
if (list) {
    // Toggle dropdown list visibility
    list.onclick = function(){
        if (list.classList.contains("show")) {
            icon.style.transform = "rotate(0deg)";
        } else {
            icon.style.transform = "rotate(-180deg)";
        }
        list.classList.toggle("show");
    };

    // Close dropdown list when clicking outside
    window.onclick = function(e) {
        if (!list.contains(e.target)) {
            list.classList.remove("show");
            icon.style.transform = "rotate(0deg)";
        }
    };

    // Update search input placeholder based on selected type
    for (let item of listItems) {
        item.onclick = function(e) {
            let selectedField = e.target.getAttribute('data-field');
            span.innerText = selectedField;

            searchFieldInput.value = selectedField;

            if (selectedField === "All") {
                input.placeholder = "Search here...";
            } else {
                input.placeholder = "Search in " + selectedField + "...";
            }

            list.classList.remove("show");
            icon.style.transform = "rotate(0deg)";
        };
    }
}

// Fetch notes on page load and handle search form submission
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 1;
    const searchQuery = urlParams.get('search_query') || '';
    const privacy = urlParams.get('privacy') || 'All';
    const sort = urlParams.get('sort_by') || 'DESC';
    fetchNotes(page, searchQuery, privacy, sort);

    const searchForm = document.querySelector('.search-bar');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchInput = document.getElementById('search-input').value.trim();
        fetchNotes(1, searchInput, privacyOption.value, sortBy.value);
        history.pushState(null, '', `?page=1&search_query=${searchInput}&privacy=${privacyOption.value}&sort_by=${sortBy.value}`);
    });

    privacyOption.addEventListener('change', function () {
        fetchNotes(1, input.value.trim(), privacyOption.value, sortBy.value);
        history.pushState(null, '', `?page=1&search_query=${input.value.trim()}&privacy=${privacyOption.value}&sort_by=${sortBy.value}`);
    });

    sortBy.addEventListener('change', function () {
        fetchNotes(1, input.value.trim(), privacyOption.value, sortBy.value);
        history.pushState(null, '', `?page=1&search_query=${input.value.trim()}&privacy=${privacyOption.value}&sort=${sortBy.value}`);
    });

    // Clear search input and reset notes when clear button is pressed
    const clearBtn = document.querySelector('.clear-btn');
    clearBtn.addEventListener('click', function () {
        input.value = '';
        document.getElementById('searchForm').reset();
        fetchNotes(1, '', privacyOption.value, sortBy.value);
        history.pushState(null, '', `?page=1&search_query=&privacy=${privacyOption.value}&sort=${sortBy.value}`);
    });

    // Handle Add Note form submission
    const addNoteForm = document.getElementById('addNoteForm');
    addNoteForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const noteTitle = document.getElementById('noteTitle').value.trim();
        const notePrivacy = document.getElementById('notePrivacy').value;
        const noteLink = document.getElementById('noteLink').value.trim();

        if (!noteTitle || !noteLink || !notePrivacy) {
            alert('All fields are required.');
            return;
        }

        if (noteTitle.length > 100) {
            alert('Title must be 100 characters or less.');
            return;
        }

        if (noteLink.length > 200) {
            alert('Link must be 200 characters or less.');
            return;
        }

        const noteData = {
            title: noteTitle,
            privacy: notePrivacy,
            link: noteLink
        };

        fetch('/notes/add_note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(noteData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    console.log(errorData.message); // Debug the actual error message
                    if (errorData.message === 'Duplicate title') {
                        Swal.fire({
                            
                           
                        });
                    } else {
                        throw new Error(errorData.message || 'Failed to add note');
                    }
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
            console.error('Error adding note:', error);
            Swal.fire({
                text: error.message || 'An error occurred while adding the note.',
                icon: "error"
            });
        });
    });
});

// Fetch notes from the server
function fetchNotes(page, searchQuery = '', privacy = 'All', sort = 'Most Recent') {
    fetch(`/notes/get_notes?page=${page}&search_query=${searchQuery}&privacy=${privacy}&sort_by=${sort}`)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched notes:', data); // Log fetched data
            if (data.notes) {
                const notesContainer = document.getElementById('notesContainer');
                notesContainer.innerHTML = ''; // Clear existing notes

                                // Create a parent wrapper for all rows
            let parentWrapper = document.createElement('div');
            parentWrapper.className = 'd-flex flex-column align-items-center gap-3 w-100';
            parentWrapper.style.marginLeft = '200px';
            notesContainer.appendChild(parentWrapper);

            // Create the first row for notes
            let notesWrapper = document.createElement('div');
            notesWrapper.className = 'd-flex justify-content-center flex-wrap gap-3 w-100';
            parentWrapper.appendChild(notesWrapper);

            // Button that triggers the modal
            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.className = 'd-flex justify-content-center align-items-center withpad';
            addButton.style = 'height: 245px; width: 250px; background-color: #FFFFF0; border-radius: 15px; border: 2px dashed black; text-decoration: none; margin: 5px';
            addButton.setAttribute('data-bs-toggle', 'modal');
            addButton.setAttribute('data-bs-target', '#addNoteModal'); // Modal target
            addButton.innerHTML = '<i class="fa-solid fa-plus fa-2xl" style="color: black;"></i>';
            notesWrapper.appendChild(addButton);

            // Ensure only 9 items per page
            const notesToShow = data.notes.slice(0, 9);

            notesToShow.forEach((note, index) => {
                console.log('Adding note:', note); // Log each note being added
                addNoteBox(note.id, note.title, note.link, note.privacy, note.userName, notesWrapper, note.created_on);

                // Move to the next row after 4 items for the first row and 5 items for the second row
                if ((index === 3) || (index === 8)) {
                    notesWrapper = document.createElement('div');
                    notesWrapper.className = 'd-flex justify-content-center flex-wrap gap-3 w-100';
                    parentWrapper.appendChild(notesWrapper);
                }
            });



                updatePagination(data.total_notes, page, searchQuery, privacy, sort);
            }
        })
        .catch(error => console.error('Error fetching notes:', error));
}


// Add a note box to the UI
function addNoteBox(id, title, link, privacy, userName, notesWrapper, createdAt) {
    const noteBox = document.createElement('div'); // Changed to div to contain both link and buttons
    noteBox.className = 'd-flex justify-content-center align-items-center position-relative col withpad note-box';
    noteBox.style.height = '245px'; // Set fixed height
    noteBox.style.width = '250px'; // Set fixed width

    // Truncate title if it exceeds 10 characters
    const truncatedTitle = title.length > 10 ? title.substring(0, 10) + '...' : title;

    noteBox.innerHTML = `
    <a href="${link}" class="note-link" target="_blank" style="text-decoration: none;">
        <div class="text-center" style="margin-top: 25px;">
            <span style="display: block; font-size: 24px; font-family: Inter; color: black; margin-top: 10px;" title="${title}">${truncatedTitle}</span>
        </div>
        <div style="font-family: Inter; color: rgba(0, 0, 0, 0.5); margin-top: 20px; position: relative;">
            <p style="font-size: 14px; margin-top: 10px; text-align: left; bottom: -40px; position: relative;">${privacy}</p>
            <p style="font-size: 12px; margin-top: 5px; text-align: left; bottom: -20px; position: relative;">Created on: ${createdAt}</p>
            <p style="font-size: 16px; margin: 0; text-align: left;">${userName}</p>
        </div>
    </a>
    
    <!-- Add a styled container for the options buttons -->
    <div class="note-buttons-container" style="background-color: #0C203E; width: 100%; padding: 5px 0; position: absolute; top: 0; left: 0; border-radius: 10px 10px 0 0;">
        <div style="position: relative; display: flex; justify-content: flex-end; padding-right: 10px;">
            <!-- Options Button (Ellipsis) -->
            <button class="options-btn" style="font-size: 12px; padding: 5px 10px; margin: 2px; background-color: #0C203E; color: white; border: 0;">
                <i class="fas fa-ellipsis-h"></i>
            </button>
            
            <!-- Options Menu (Edit/Delete) -->
            <div class="options-menu" style="display: none; position: absolute; top: 30px; right: 0; background-color: white; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);">
                <button class="edit-note-btn" style="font-size: 12px; padding: 5px 10px; width: 100%; background-color: green; color: white; border: none; border-bottom: 1px solid #ccc;">
                    Edit
                </button>
                <button class="delete-note-btn" style="font-size: 12px; padding: 5px 10px; width: 100%; background-color: red; color: white; border: none;">
                    Delete
                </button>
            </div>
        </div>
    </div>
`;
    notesWrapper.appendChild(noteBox);

    // Toggle options menu visibility
    noteBox.querySelector('.options-btn').addEventListener('click', function () {
        const optionsMenu = noteBox.querySelector('.options-menu');
        optionsMenu.style.display = optionsMenu.style.display === 'none' ? 'block' : 'none';
    });

    // Add event listeners for edit and delete buttons
    noteBox.querySelector('.delete-note-btn').addEventListener('click', function () {
        const noteId = id;
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
  
            if (!newTitle || !newLink || !newPrivacy) {
                alert('All fields are required.');
                return;
            }

            if (newTitle.length > 100) {
                alert('Title must be 100 characters or less.');
                return;
            }

            if (newLink.length > 200) {
                alert('Link must be 200 characters or less.');
                return;
            }

            const noteId = id;
            const note_data = {
                'id': noteId,
                'title': newTitle,
                'privacy': newPrivacy,
                'link': newLink
            }

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
                        text:  'Failed to update the note. Note with the same title or link already exist.',
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

// Update pagination controls
function updatePagination(totalNotes, currentPage, searchQuery = '', privacy = 'All', sort = 'Most Recent') {
    const notesPerPage = 9;  // Set notes per page to 9
    const totalPages = Math.ceil(totalNotes / notesPerPage);
    const paginationNav = document.querySelector('.pagination-nav .pagination');
    paginationNav.innerHTML = ''; // Clear existing pagination

    const createPageItem = (page, label, isDisabled, isActive) => {
        const li = document.createElement('li');
        li.className = `page-item ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = `?page=${page}&search_query=${searchQuery}&privacy=${privacy}&sort=${sort}`;
        a.innerHTML = label;
        a.addEventListener('click', function (event) {
            event.preventDefault();
            fetchNotes(page, searchQuery, privacy, sort);
            history.pushState(null, '', `?page=${page}&search_query=${searchQuery}&privacy=${privacy}&sort=${sort}`);
        });
        li.appendChild(a);
        return li;
    };

    paginationNav.appendChild(createPageItem(currentPage - 1, '&laquo;', currentPage === 1, false));

    for (let i = 1; i <= totalPages; i++) {
        paginationNav.appendChild(createPageItem(i, i, false, i === currentPage));
    }

    paginationNav.appendChild(createPageItem(currentPage + 1, '&raquo;', currentPage === totalPages, false));
}