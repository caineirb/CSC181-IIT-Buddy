// JavaScript for handling types, search, privacy option, and sort functionality

let list = document.getElementById("list");
let icon = document.getElementById("icon");
let span = document.getElementById("span");
let input = document.getElementById("search-input");
let listItems = document.querySelectorAll(".dropdown-list-item");
let searchFieldInput = document.getElementById("search-field");
let privacyOption = document.getElementById("privacy-option");
let sortBy = document.getElementById("sort-by");

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
    const sort = urlParams.get('sort') || 'Most Recent';
    fetchNotes(page, searchQuery, privacy, sort);

    const searchForm = document.querySelector('.search-bar');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchInput = document.getElementById('search-input').value.trim();
        fetchNotes(1, searchInput, privacyOption.value, sortBy.value);
        history.pushState(null, '', `?page=1&search_query=${searchInput}&privacy=${privacyOption.value}&sort=${sortBy.value}`);
    });

    privacyOption.addEventListener('change', function () {
        fetchNotes(1, input.value.trim(), privacyOption.value, sortBy.value);
        history.pushState(null, '', `?page=1&search_query=${input.value.trim()}&privacy=${privacyOption.value}&sort=${sortBy.value}`);
    });

    sortBy.addEventListener('change', function () {
        fetchNotes(1, input.value.trim(), privacyOption.value, sortBy.value);
        history.pushState(null, '', `?page=1&search_query=${input.value.trim()}&privacy=${privacyOption.value}&sort=${sortBy.value}`);
    });

    // Handle Add Note form submission
    const addNoteForm = document.getElementById('addNoteForm');
    addNoteForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const noteTitle = document.getElementById('noteTitle').value.trim();
        const notePrivacy = document.getElementById('notePrivacy').value;
        const noteLink = document.getElementById('noteLink').value.trim();

        const noteData = {
            title: noteTitle,
            privacy: notePrivacy,
            link: noteLink
        };

        fetch('/add_note', {
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
                    throw new Error(errorData.message || 'Failed to add note');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.message === 'Note added successfully') {
                // Close the modal
                const addNoteModal = new bootstrap.Modal(document.getElementById('addNoteModal'));
                addNoteModal.hide();

                // Clear the form
                addNoteForm.reset();

                // Fetch the updated notes list
                fetchNotes(1);
            } else {
                console.error('Error adding note:', data.message);
            }
        })
        .catch(error => console.error('Error adding note:', error));
    });
});

// Fetch notes from the server
function fetchNotes(page, searchQuery = '', privacy = 'All', sort = 'Most Recent') {
    fetch(`/get_notes?page=${page}&search_query=${searchQuery}&privacy=${privacy}&sort=${sort}`)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched notes:', data); // Log fetched data
            if (data.notes) {
                const notesContainer = document.getElementById('notesContainer');
                notesContainer.innerHTML = ''; // Clear existing notes
                data.notes.forEach(note => {
                    console.log('Adding note:', note); // Log each note being added
                    addNoteBox(note.title, note.link, note.privacy, note.userName);
                });
                updatePagination(data.total_notes, page, searchQuery, privacy, sort);
            }
        })
        .catch(error => console.error('Error fetching notes:', error));
}

// Add a note box to the UI
function addNoteBox(title, link, privacy, userName) {
    const notesContainer = document.getElementById('notesContainer');
    const noteBox = document.createElement('div'); // Changed to div to contain both link and buttons
    noteBox.className = 'd-flex justify-content-center align-items-center position-relative col withpad note-box';
    noteBox.innerHTML = `
        <a href="${link}" class="note-link" target="_blank">
            <div class="text-center" style="margin-top: 20px;">
                <div style="height: 135px; width: 210px; background-color: #D9D9D9; display: flex; align-items: center; justify-content: center;">
                    
                </div>
                <span style="display: block; font-size: 24px; font-family: DM Mono; color: black; margin-top: 10px;">${title}</span>
                <p style="font-size: 16px; font-family: DM Mono; color: rgba(0, 0, 0, 0.5); margin: 0;">${userName}</p>
                <p style="text-align: right; font-size: 14px; font-family: DM Mono; color: rgba(0, 0, 0, 0.5); margin-top: 10px;">${privacy}</p>
            </div>
        </a>
        <div class="note-buttons" style="position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column;">
            <button class="edit-note-btn" style="font-size: 12px; padding: 5px 10px; margin: 2px; background-color: green; color: white;">
                <i class="fas fa-pen"></i>
            </button>
            <button class="delete-note-btn" style="font-size: 12px; padding: 5px 10px; margin: 2px; background-color: red; color: white;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    notesContainer.appendChild(noteBox);

    // Add event listeners for edit and delete buttons
    noteBox.querySelector('.delete-note-btn').addEventListener('click', function() {
        notesContainer.removeChild(noteBox);
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
        };
        editModal.show();
    });
}

// Update pagination controls
function updatePagination(totalNotes, currentPage, searchQuery = '', privacy = 'All', sort = 'Most Recent') {
    const notesPerPage = 10;  // Set notes per page to 10
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