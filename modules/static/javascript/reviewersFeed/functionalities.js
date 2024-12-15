document.addEventListener("DOMContentLoaded", function () {
    // Elements
    const dropdownList = document.getElementById("list");
    const input = document.getElementById("search_input");

    // Function to update the placeholder
    function updatePlaceholder() {
        const selectedField = dropdownList.options[dropdownList.selectedIndex].getAttribute("data-field");
        input.placeholder = selectedField === "All" ? "Search here..." : `Search in ${selectedField}...`;
    }

    // Initialize placeholder on page load
    updatePlaceholder();

    // Update placeholder on dropdown change
    dropdownList.addEventListener("change", updatePlaceholder);
});


let dropdownBtnText = document.getElementById("drop-text");
let list = document.getElementById("list");
let icon = document.getElementById("icon");
let span = document.getElementById("span");
let input = document.getElementById("search-input");
let listItems = document.querySelectorAll(".dropdown-list-item");
let searchFieldInput = document.getElementById("search-field");
const saveURL = document.getElementById('save-url').value;
const csrfToken = document.getElementById('_token_csrf').value;
        
dropdownBtnText.onclick = function(){
    if (list.classList.contains("show")) {
        icon.style.transform = "rotate(0deg)";
    } else {
        icon.style.transform = "rotate(-180deg)";
    }
        list.classList.toggle("show");
    };
        
    window.onclick = function(e) {
    if (!dropdownBtnText.contains(e.target)) {
        list.classList.remove("show");
            icon.style.transform = "rotate(0deg)";
        }
    };

// diri kay ma functional if tuplokon ang isa ka type and ma reflect sa search input
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

function viewReviewer(event, button){
    event.preventDefault();

    const reviewerId = button.getAttribute('data-id');
    const reviewerType = button.getAttribute('data-type');
    const csrfToken = document.getElementById("_token_csrf").value;
    const counterURL = document.getElementById('counter-url').value;

    fetch(counterURL, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json",
            'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
            'id': reviewerId,
            'type': reviewerType
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        } 
        return response.json();
    })
    .then(data => {
        button.form.submit();
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
    });
}

function clearSearch(form){
    document.getElementById('search_input').value = ''; 
    form.submit();
}

function openInNewTab(button) {
    const link = button.getAttribute('data-link'); // Get the value of the data-link attribute
    if (link) {
        const note_id = button.getAttribute('data-id');
        const csrfToken = document.getElementById("_token_csrf").value;
        const counterURL = document.getElementById('counter-url').value;
        fetch(counterURL, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({
                'id': note_id
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            } 
            return response.json();
        })
        .then(data => {
            window.open(link, '_blank'); // Open the link in a new tab
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });
    } else {
        Swal.fire({
            text: "Link not found",
            icon: "warning"
        });
    }
}

function saveReviewer(checkbox){
    const checkboxData = checkbox.getAttribute("data-reviewer_id");
    const isSaved = checkbox.checked;
    
    alert(isSaved);
    fetch(saveURL, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
            'type': 'Reviewer',
            'reviewer_id': checkboxData,
            'isSaved': isSaved
        })
    })
    .then(response => response.json())
    .then(responseData => {
        toggleSaveIcon(checkbox);
    })
    .catch(error => {
        console.error('Error saving reviewer:', error);
    });
}

function saveNote(checkbox){
    const checkboxData = checkbox.getAttribute("data-reviewer_id");
    const isSaved = checkbox.checked;
    
    alert(isSaved);
    fetch(saveURL, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
            'type': 'Note',
            'reviewer_id': checkboxData,
            'isSaved': isSaved
        })
    })
    .then(response => response.json())
    .then(responseData => {
        toggleSaveIcon(checkbox);
    })
    .catch(error => {
        console.error('Error saving reviewer:', error);
    });
}

function toggleSaveIcon(checkbox) {
    const reviewerId = checkbox.getAttribute('data-reviewer_id'); // Get the reviewer ID
    const iconElement = document.querySelector(`#save-icon-${reviewerId} i`); // Find the icon inside the label

    if (checkbox.checked) {
        // Change to filled icon
        iconElement.classList.remove('bi-bookmark');
        iconElement.classList.add('bi-bookmark-fill');
    } else {
        // Change back to outline icon
        iconElement.classList.remove('bi-bookmark-fill');
        iconElement.classList.add('bi-bookmark');
    }
}