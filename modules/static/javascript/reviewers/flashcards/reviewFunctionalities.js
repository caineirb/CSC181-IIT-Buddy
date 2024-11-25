let currentFlashcard = 1;
const flashcards = JSON.parse(document.getElementById("data-json").textContent);
const totalFlashcards = document.getElementById("data-length").textContent;

// Update flashcard display (show/hide based on currentFlashcard)
function updateFlashcardDisplay() {
    // Hide all flashcards
    document.querySelectorAll('.flashcard').forEach((flashcard) => {
        flashcard.style.display = 'none';
    });

    // Show the current flashcard
    document.getElementById(`flashcard-${currentFlashcard}`).style.display = 'block';

    // Update the counter display
    document.getElementById('current-count').textContent = currentFlashcard;

    // Update button states and text
    const prevButton = document.getElementById('prev-btn');
    prevButton.disabled = currentFlashcard === 1;
}

// Function to navigate to the next flashcard or finish
function showNextFlashcard() {
    if (currentFlashcard < totalFlashcards) {
        currentFlashcard++;
        updateFlashcardDisplay();
    } else {
        // Redirect to the "congrats" page when finished
        window.location.href = document.getElementById("congrats-url").value;
    }
}

// Function to navigate to the previous flashcard
function showPreviousFlashcard() {
    if (currentFlashcard > 1) {
        currentFlashcard--;
        updateFlashcardDisplay();
    }
}

// Initial display
updateFlashcardDisplay();

// Card flip2 something
document.addEventListener("DOMContentLoaded", () => {
    const flashcards = document.querySelectorAll('.flashcard');

    // na diri basta iclick kay mo flip
    flashcards.forEach(flashcard => {
        flashcard.addEventListener('click', () => {
            flashcard.classList.toggle('flipped');
        });
    });
});