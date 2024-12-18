document.addEventListener('DOMContentLoaded', function () {
    // Trigger on 'blur' for text fields and 'change' for dropdowns
    document.getElementById('reviewer-title').addEventListener('blur', handleChange);
    document.getElementById('reviewer-type').addEventListener('change', handleChange);
    document.getElementById('reviewer-privacy').addEventListener('change', handleChange);
    document.getElementById('reviewer-description').addEventListener('blur', handleChange);

    allowCopy();
});

function allowCopy(){
    const copyButton = document.getElementById('share-url-button');
    const privacy = document.getElementById('reviewer-privacy').value;
    copyButton.disabled = privacy === "Private";
}

function copyURL() {
    const shareURL = document.getElementById('share-url').value;
    navigator.clipboard.writeText(shareURL)
        .then(() => {
            const alertBox = document.getElementById("copy-alert");
            alertBox.style.display = "block";
            setTimeout(() => {
                alertBox.style.display = "none";
            }, 1000); // Hide the alert after 1 second
        })
        .catch(err => {
            console.error("Failed to copy: ", err);
        });
}

/**
 * Handles the changes in the details of the reviewer.
 * 
 */
function handleChange(event) {
    const reviewerId = document.getElementById('reviewer-id').value;
    const titleInput = document.getElementById('reviewer-title');
    const title = titleInput.value.trim();
    const type = document.getElementById('reviewer-type').value;
    const privacy = document.getElementById('reviewer-privacy').value;
    const description = document.getElementById('reviewer-description').value.trim();

    // Check if title is empty and display a required-like warning
    let warningMessage = document.getElementById('title-warning');
    if (title === "") {
        titleInput.style.borderColor = 'red';
        if (!warningMessage) {
            warningMessage = document.createElement('div');
            warningMessage.id = 'title-warning';
            warningMessage.style.color = 'red';
            warningMessage.style.fontSize = '0.9em';
            warningMessage.style.marginTop = '5px';
            titleInput.insertAdjacentElement('afterend', warningMessage);
        }

        warningMessage.textContent = "Title is required. Please fill in the title.";
    } else {
        titleInput.style.borderColor = '';
        if (warningMessage){
            warningMessage.textContent = "";
            warningMessage.display = 'none';
        }

        // Prepare data for backend update
        const data = {
            reviewerId: reviewerId,
            title: title,
            type: type,
            privacy: privacy,
            description: description
        };
        sendDataToBackend(data); // Only send data if title is not empty
    }
}

async function sendDataToBackend(data) {
    const csrfToken = document.getElementById("_token_csrf").value;

    // Wait for the duplicate check before proceeding
    const isDuplicate = await checkDuplicate(data);
    
    if (!isDuplicate) {
        removeDuplicateWarning();
        // Only proceed if there is no duplicate
        fetch('/reviewers/save-info', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(responseData => {
            console.log('Successfully updated:', responseData);
        })
        .catch(error => {
            console.error('Error updating:', error);
        });
    } else {
        // Display a warning if a duplicate is detected
        displayDuplicateWarning();
    }
}

async function checkDuplicate(data) {
    const csrfToken = document.getElementById("_token_csrf").value;
    const checkDuplicateURL = document.getElementById("check_duplicate_url").value;

    try {
        const response = await fetch(checkDuplicateURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({
                'id': data.reviewerId,
                'title': data.title,
                'type': data.type
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData['isDuplicate'];
    } catch (error) {
        console.error('Error checking for duplicates:', error);
        return false; // Return false if there's an error, so it doesn't block saving
    }
}

// Display warning for duplicate titles without using an alert
function displayDuplicateWarning() {
    const titleInput = document.getElementById("reviewer-title");
    titleInput.style.borderColor = "red";

    // Create or display a warning message
    let warning = document.getElementById("duplicate-warning");
    if (!warning) {
        warning = document.createElement("div");
        warning.id = "duplicate-warning";
        warning.textContent = "Title is already in use. Please choose a different title.";
        warning.style.color = "red";
        warning.style.marginTop = "5px";
        titleInput.parentNode.insertBefore(warning, titleInput.nextSibling);
    } else {
        warning.style.display = "block"; // Make sure it's visible if it was hidden before
    }
}

function removeDuplicateWarning() {
    const warning = document.getElementById("duplicate-warning");
    if (warning) {
        warning.style.display = "none"; // Hide the warning
        const titleInput = document.getElementById("reviewer-title");
        titleInput.style.borderColor = ""; // Reset border color
    }
}