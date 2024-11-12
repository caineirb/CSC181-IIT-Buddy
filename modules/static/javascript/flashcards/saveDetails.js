/**
 * Handles the saving of the flashcard's information when something is changed.
 * It automatically saves it to the database.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Trigger on 'blur' for text fields and 'change' for dropdowns
    document.getElementById('reviewer-title').addEventListener('blur', handleChange);
    document.getElementById('reviewer-type').addEventListener('change', handleChange);
    document.getElementById('reviewer-privacy').addEventListener('change', handleChange);
    document.getElementById('reviewer-description').addEventListener('blur', handleChange);
});

// Function to handle input changes
function handleChange(event) {
    const reviewerId = document.getElementById('reviewer-id').value;
    const title = document.getElementById('reviewer-title').value;
    const type = document.getElementById('reviewer-type').value;
    const privacy = document.getElementById('reviewer-privacy').value;
    const description = document.getElementById('reviewer-description').value;

    const data = {
        reviewerId: reviewerId,
        title: title,
        type: type,
        privacy: privacy,
        description: description
    };

    sendDataToBackend(data);
}

function sendDataToBackend(data) {
    const csrfToken = document.getElementById("_token_csrf").value;
    const saveUrl = document.getElementById("save_url").value;

    fetch(saveUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-CSRFToken": csrfToken
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log(data);
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
}