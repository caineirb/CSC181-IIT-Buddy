// Function to send flashcards to the backend
function sendFlashcardsToBackend() {
    const formData = new FormData();
    const csrfToken = document.getElementById("_token_csrf").value;
    const sFlashcardUrl = document.getElementById("save_flashcard_url").value;
    const reviewerId = document.getElementById("reviewer-id").value;
    const isRandomize = document.getElementById('shuffle-switch').checked;
    
    formData.append("csrf_token", csrfToken);
    formData.append("id", reviewerId);
    formData.append("isRandom", isRandomize);

    let validFlashcardCount = 0; // To track how many valid flashcards are present
    let hasIncompleteFlashcards = false; // To check if any flashcard is incomplete

    // Collect data from each flashcard
    document.querySelectorAll('.flashcard').forEach(flashcard => {
        const dataNumber = flashcard.getAttribute('data-number');
        const term = flashcard.querySelector('.term-input');
        const definition = flashcard.querySelector('.definition-input');
        const imageInput = flashcard.querySelector(`input[type="file"]`);
        const base64ImageInput = document.getElementById(`flashcard-image-base64-${dataNumber}`);
        

        // Check if both term and definition are provided
        if (term.value.trim() !== "" && definition.value.trim() !== "") {
            validFlashcardCount++;

            // Reset border if previously marked incomplete
            term.style.borderColor = "";
            definition.style.borderColor = "";

            // Append text data for each valid flashcard
            formData.append(`flashcards[${dataNumber}][term]`, term.value.trim());
            formData.append(`flashcards[${dataNumber}][definition]`, definition.value.trim());
            formData.append(`flashcards[${dataNumber}][dataNumber]`, dataNumber);

            // Check for a new file; if none, use the initial base64 data if available
            if (imageInput && imageInput.files[0]) {
                formData.append(`flashcards[${dataNumber}][image]`, imageInput.files[0]);
            } else if (base64ImageInput && base64ImageInput.value) {
                formData.append(`flashcards[${dataNumber}][image_base64]`, base64ImageInput.value);
            }
        } else {
            // Mark flashcard as incomplete and change border color
            hasIncompleteFlashcards = true;
            if (term.value.trim() === "") {
                term.style.borderColor = "red";
            }
            if (definition.value.trim() === "") {
                definition.style.borderColor = "red";
            }
        }
    });

    // Display a warning if there are incomplete flashcards
    if (hasIncompleteFlashcards) {
        alert("Please complete all flashcards with a term and definition before saving.");
    } else {
        // Only send if there are valid flashcards
        if (validFlashcardCount > 0) {
            formData.append("flashcard_count", validFlashcardCount);
            fetch(sFlashcardUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken
                },
                body: formData
            })
            .then(response => response.json())
            .then(responseData => {
                if (responseData.redirect_url) {
                    window.location.href = responseData.redirect_url;
                }
            })
            .catch(error => {
                console.error('Error saving flashcards:', error);
            });
        } else {
            console.log('No valid flashcards to save.');
        }
    }
}
