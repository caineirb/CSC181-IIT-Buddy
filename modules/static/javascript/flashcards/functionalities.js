/**
 * Handles the functionalities of the flashcards. Adding, deleting, editing, moving, etc.
 */

let flashcardCount = 1;

// Function to create a new flashcard
function createFlashcard() {
    const flashcardContainer = document.querySelector('.flashcards-container');
    const newFlashcard = document.createElement('div');
    newFlashcard.classList.add('flashcard');
    newFlashcard.setAttribute('data-number', flashcardCount);

    newFlashcard.innerHTML = `
                <div class="flashcard-header">
                    <span class="flashcard-number">${flashcardCount}</span>
                    <div class="flashcard-actions">
                        <button type="button" class="drag-button"><i class="material-icons">dehaze</i></button>
                        <button type="button" class="delete-button"><i class="material-icons">remove_circle_outline</i></button>
                    </div>
                </div>
                <div class="flashcard-content">
                    <div class="input-container">
                        <textarea class="term-input" name="term-${flashcardCount}" placeholder="Enter term" required></textarea>
                        <label class="input-label">TERM</label>
                    </div>
                    <div class="input-container">
                        <textarea class="definition-input" name="definition-${flashcardCount}" placeholder="Enter definition" required></textarea>
                        <label class="input-label">DEFINITION</label>
                    </div>
                    <input type="file" name="flashcard-image-${flashcardCount}" id="flashcard-image-${flashcardCount}" style="display: none;" accept="image/*" onchange="previewImage(event, ${flashcardCount})">
                    <label for="flashcard-image-${flashcardCount}" class="image-button">
                        <span class="button-label">IMAGE</span>
                    </label>
                </div>
            `;

    flashcardContainer.appendChild(newFlashcard);
    flashcardCount++;
}

// Function to handle image preview
function previewImage(event, id) {
    const input = event.target;
    const label = document.querySelector(`label[for='${input.id}']`);
    const buttonLabel = label.querySelector('.button-label');
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            label.style.backgroundImage = `url('${e.target.result}')`;
            label.style.backgroundSize = "cover";
            label.style.backgroundPosition = "center";
            label.style.backgroundRepeat = "no-repeat";
            label.style.height = "100px";
            label.style.width = "100px";
            buttonLabel.style.display = 'none';
        };
        reader.readAsDataURL(file);
    } else {
        label.style.backgroundImage = '';
        label.style.height = '';
        label.style.width = '';
        buttonLabel.style.display = 'inline';
    }
}

// Remove flashcard
document.addEventListener('click', function (event) {
    if (event.target.closest('.delete-button')) {
        const card = event.target.closest('.flashcard');
        card.remove();
        flashcardCount--;
        updateFlashcardNumbers();
    }
});

// Update flashcard numbers
function updateFlashcardNumbers() {
    document.querySelectorAll('.flashcard').forEach((flashcard, index) => {
        const newNumber = index + 1;
        flashcard.setAttribute('data-number', newNumber);

        // Update the visible flashcard number
        const numberElement = flashcard.querySelector('.flashcard-number');
        if (numberElement) {
            numberElement.textContent = newNumber;
        }

        // Update name and id attributes for term, definition, and image fields
        const termInput = flashcard.querySelector('.term-input');
        const definitionInput = flashcard.querySelector('.definition-input');
        const imageInput = flashcard.querySelector('input[type="file"]');
        const imageLabel = flashcard.querySelector('label.image-button');

        if (termInput) {
            termInput.setAttribute('name', `term-${newNumber}`);
            termInput.setAttribute('id', `term-${newNumber}`);
        }

        if (definitionInput) {
            definitionInput.setAttribute('name', `definition-${newNumber}`);
            definitionInput.setAttribute('id', `definition-${newNumber}`);
        }

        if (imageInput) {
            imageInput.setAttribute('name', `flashcard-image-${newNumber}`);
            imageInput.setAttribute('id', `flashcard-image-${newNumber}`);
        }

        if (imageLabel) {
            imageLabel.setAttribute('for', `flashcard-image-${newNumber}`);
        }
    });
}

// Initialize Sortable
Sortable.create(document.querySelector('.flashcards-container'), {
    animation: 150,
    handle: '.drag-button',
    ghostClass: 'sortable-ghost',
    onEnd: updateFlashcardNumbers
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('add-card-btn').addEventListener('click', createFlashcard);
});