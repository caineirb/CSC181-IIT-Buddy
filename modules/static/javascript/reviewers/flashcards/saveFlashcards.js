function handleGoBack() {
    Swal.fire({
        title: "Do you want to save the changes before going back?",
        icon: "question",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Yes",
        denyButtonText: `Don't save`
    }).then((result) => {
        const nextUrl = "/";  // The URL to redirect to after saving
        if (result.isConfirmed) {
            sendFlashcardsToBackend(nextUrl);
        } else if (result.isDenied) {
            window.location.href = nextUrl;
        }
    });
}

function sendFlashcardsToBackend(next_url = null) {
    const formData = new FormData();
    const csrfToken = document.getElementById("_token_csrf").value;
    const sFlashcardUrl = document.getElementById("save_flashcard_url").value;
    const reviewerId = document.getElementById("reviewer-id").value;
    const isRandomize = document.getElementById('shuffle-switch').checked;

    formData.append("csrf_token", csrfToken);
    formData.append("id", reviewerId);
    formData.append("isRandom", isRandomize);

    let validFlashcardCount = 0;
    let hasIncompleteFlashcards = false;

    document.querySelectorAll('.flashcard').forEach(flashcard => {
        const dataNumber = flashcard.getAttribute('data-number');
        const term = flashcard.querySelector('.term-input');
        const definition = flashcard.querySelector('.definition-input');
        const imageInput = flashcard.querySelector(`input[type="file"]`);
        const base64ImageInput = document.getElementById(`flashcard-image-base64-${dataNumber}`);

        if (term.value.trim() && definition.value.trim()) {
            validFlashcardCount++;
            term.style.borderColor = "";
            definition.style.borderColor = "";

            formData.append(`flashcards[${dataNumber}][term]`, term.value.trim());
            formData.append(`flashcards[${dataNumber}][definition]`, definition.value.trim());
            formData.append(`flashcards[${dataNumber}][dataNumber]`, dataNumber);

            if (imageInput && imageInput.files[0]) {
                formData.append(`flashcards[${dataNumber}][image]`, imageInput.files[0]);
            } else if (base64ImageInput && base64ImageInput.value) {
                formData.append(`flashcards[${dataNumber}][image_base64]`, base64ImageInput.value);
            }
        } else {
            hasIncompleteFlashcards = true;
            if (!term.value.trim()) term.style.borderColor = "red";
            if (!definition.value.trim()) definition.style.borderColor = "red";
        }
    });

    if (hasIncompleteFlashcards) {
        Swal.fire({
            title: "Incomplete Cards Detected.",
            text: "Complete every Term and Definition pair first before playing.",
            icon: "warning"
          });
    } else if (validFlashcardCount > 0 || next_url) {
        formData.append("flashcard_count", validFlashcardCount);
        fetch(sFlashcardUrl, {
            method: 'PUT',
            headers: {
                'X-CSRF-Token': csrfToken
            },
            body: formData
        })
        .then(response => response.json())
        .then(responseData => {
            if (next_url) {
                window.location.href = next_url;
            } else if (responseData.redirect_url) {
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
