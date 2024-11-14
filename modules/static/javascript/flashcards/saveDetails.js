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
    const titleInput = document.getElementById('reviewer-title');
    const title = titleInput.value.trim();
    const type = document.getElementById('reviewer-type').value;
    const privacy = document.getElementById('reviewer-privacy').value;
    const description = document.getElementById('reviewer-description').value.trim();

    // Get or create a warning message element
    let warningMessage = document.getElementById('title-warning');
    if (!warningMessage) {
        warningMessage = document.createElement('div');
        warningMessage.id = 'title-warning';
        warningMessage.style.color = 'red';
        warningMessage.style.fontSize = '0.9em';
        warningMessage.style.marginTop = '5px';
        titleInput.insertAdjacentElement('afterend', warningMessage);
    }

    // Check if title is empty and display a required-like warning
    if (title === "") {
        titleInput.style.borderColor = 'red';
        warningMessage.textContent = "Title is required. Please fill in the title.";
    } else {
        titleInput.style.borderColor = '';
        warningMessage.textContent = "";

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
