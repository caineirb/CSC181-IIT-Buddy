// Function to send flashcards to the backend
function sendFlashcardsToBackend() {
    const formData = new FormData();
    const csrfToken = document.getElementById("_token_csrf").value; // Assuming CSRF token is stored in this hidden input
    const sFlashcardUrl = document.getElementById("save_flashcard_url").value;
    const reviewerId = document.getElementById("reviewer-id").value;
    
    // Append CSRF token and reviewer ID
    formData.append("csrf_token", csrfToken);
    formData.append("id", reviewerId);

    let validFlashcardCount = 0;  // To track how many valid flashcards are present

    // Collect data from each flashcard
    document.querySelectorAll('.flashcard').forEach(flashcard => {
        const dataNumber = flashcard.getAttribute('data-number');
        const term = flashcard.querySelector('.term-input').value.trim();
        const definition = flashcard.querySelector('.definition-input').value.trim();
        const imageInput = flashcard.querySelector(`input[type="file"]`);

        //TODO: Add something to indicate that the field is required
        // Validate if both term and definition are provided
        if (term !== "" && definition !== "") {
            validFlashcardCount++;  // Only increment if valid

            // Append text data for each valid flashcard
            formData.append(`flashcards[${dataNumber}][term]`, term);
            formData.append(`flashcards[${dataNumber}][definition]`, definition);
            formData.append(`flashcards[${dataNumber}][dataNumber]`, dataNumber);

            // Append file data, or null if no file is selected
            if (imageInput && imageInput.files[0]) {
                formData.append(`flashcards[${dataNumber}][image]`, imageInput.files[0]);
            }
        }
    });

    // Only send if there are valid flashcards
    if (validFlashcardCount > 0) {
        formData.append("flashcard_count", validFlashcardCount);

        // Send data to the backend
        fetch(sFlashcardUrl, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken // Add CSRF token if needed
            },
            body: formData
        })
        .then(response => response.json())
        .then(responseData => {
            if (responseData.redirect_url) {
                window.location.href = responseData.redirect_url;  // Redirect if provided by backend
            }
        })
        .catch(error => {
            console.error('Error saving flashcards:', error);
        });
    } else {
        console.log('No valid flashcards to save.');
    }
}
