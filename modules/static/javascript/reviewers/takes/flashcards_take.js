/**
 * Handles the functionalities of the flashcards. Adding, deleting, editing, moving, etc.
 */

let flashcardCount = 1;

document.addEventListener("DOMContentLoaded", function() {
    const flashcards = JSON.parse(document.getElementById("data-json").textContent);

    // Load existing flashcards into the flashcards container
    flashcards.forEach((flashcardData, index) => {
        createFlashcardFromData(flashcardData, index + 1);
    });
});

function createFlashcardFromData(flashcardData, count) {
    const flashcardContainer = document.querySelector('.flashcards-container');
    const newFlashcard = document.createElement('div');
    newFlashcard.classList.add('flashcard');
    newFlashcard.setAttribute('data-number', count);

    const imageUrl = flashcardData.image ? `data:image/jpeg;base64,${flashcardData.image}` : "";

    newFlashcard.innerHTML = `
        <div class="flashcard-header">
            <span class="flashcard-number">${count}</span>
            <div class="flashcard-actions">
            </div>
        </div>
        <div class="flashcard-content">
            <div class="input-container">
                <textarea class="term-input" name="term-${count}" placeholder="Enter term" maxlength="255" readonly>${flashcardData.answer}</textarea>
                <label class="input-label">TERM</label>
            </div>
            <div class="input-container">
                <textarea class="definition-input" name="definition-${count}" placeholder="Enter definition" maxlength="255" readonly>${flashcardData.question}</textarea>
                <label class="input-label">DEFINITION</label>
            </div>
            <input type="file" name="flashcard-image-${count}" id="flashcard-image-${count}" style="display: none;" accept="image/*" disabled>
            <input type="hidden" id="flashcard-image-base64-${count}" value="${imageUrl}">
            <label for="flashcard-image-${count}" class="image-button" style="${imageUrl ? 'background-image: url(' + imageUrl + '); background-size: cover;' : ''}">
                <span class="button-label" ${imageUrl ? 'style="display: none;"' : ''}>IMAGE</span>
            </label>
        </div>
    `;

    flashcardContainer.appendChild(newFlashcard);
    flashcardCount = count + 1;
}

function takeReview(){
    if (flashcardCount > 1){
        const take_review_url = document.getElementById('take_review_url').value;
        const reviewer_id = document.getElementById('reviewer-id').value;
        const is_random = document.getElementById('shuffle-switch').checked;

        const csrfToken = document.getElementById("_token_csrf").value;
        const counterURL = document.getElementById('counter-url').value;
        fetch(counterURL, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({
                'id': reviewer_id
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            } 
            return response.json();
        })
        .then(data => {
            window.location.href = take_review_url.replace('id_here', reviewer_id).replace('random_here', is_random);
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });        
    }
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