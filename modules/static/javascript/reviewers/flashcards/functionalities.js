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
                <button type="button" class="switch-button" onclick="switchTermAndDefinition(${count})"><i class="material-icons">swap_horiz</i></button>
                <button type="button" class="drag-button"><i class="material-icons">drag_handle</i></button>
                <button type="button" class="delete-button"><i class="material-icons">remove_circle_outline</i></button>
            </div>
        </div>
        <div class="flashcard-content">
            <div class="input-container">
                <textarea class="term-input" name="term-${count}" placeholder="Enter term" maxlength="255">${flashcardData.answer}</textarea>
                <label class="input-label">TERM</label>
            </div>
            <div class="input-container">
                <textarea class="definition-input" name="definition-${count}" placeholder="Enter definition" maxlength="255">${flashcardData.question}</textarea>
                <label class="input-label">DEFINITION</label>
            </div>
            <input type="file" name="flashcard-image-${count}" id="flashcard-image-${count}" style="display: none;" accept="image/*" onchange="previewImage(event, ${count})">
            <input type="hidden" id="flashcard-image-base64-${count}" value="${imageUrl}">
            <label for="flashcard-image-${count}" class="image-button" style="${imageUrl ? 'background-image: url(' + imageUrl + '); background-size: cover;' : ''}">
                <span class="button-label" ${imageUrl ? 'style="display: none;"' : ''}>IMAGE</span>
            </label>
            <button type="button" class="remove-image-button" title="Delete Card" onclick="removeImage(${count})">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    flashcardContainer.appendChild(newFlashcard);
    flashcardCount = count + 1;
}

// Updated function to create a blank flashcard
function createFlashcard() {
    const flashcardContainer = document.querySelector('.flashcards-container');
    const newFlashcard = document.createElement('div');
    newFlashcard.classList.add('flashcard');
    newFlashcard.setAttribute('data-number', flashcardCount);

    newFlashcard.innerHTML = `
        <div class="flashcard-header">
            <span class="flashcard-number">${flashcardCount}</span>
            <div class="flashcard-actions">
                <button type="button" class="switch-button" onclick="switchTermAndDefinition(${flashcardCount})"><i class="material-icons">swap_horiz</i></button>
                <button type="button" class="drag-button"><i class="material-icons">drag_handle</i></button>
                <button type="button" class="delete-button"><i class="material-icons">remove_circle_outline</i></button>
            </div>
        </div>
        <div class="flashcard-content">
            <div class="input-container">
                <textarea class="term-input" name="term-${flashcardCount}" placeholder="Enter term" maxlength="255"></textarea>
                <label class="input-label">TERM</label>
            </div>
            <div class="input-container">
                <textarea class="definition-input" name="definition-${flashcardCount}" placeholder="Enter definition" maxlength="255"></textarea>
                <label class="input-label">DEFINITION</label>
            </div>
            <input type="file" name="flashcard-image-${flashcardCount}" id="flashcard-image-${flashcardCount}" style="display: none;" accept="image/*" onchange="previewImage(event, ${flashcardCount})">
            <input type="hidden" id="flashcard-image-base64-${flashcardCount}" value="">
            <label for="flashcard-image-${flashcardCount}" class="image-button">
                <span class="button-label">IMAGE</span>
            </label><button type="button" class="remove-image-button" title="Delete Card" onclick="removeImage(${flashcardCount})">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    flashcardContainer.appendChild(newFlashcard);
    flashcardCount++;
}

// Function to switch term and definition
function switchTermAndDefinition(count) {
    const termInput = document.querySelector(`textarea[name="term-${count}"]`);
    const definitionInput = document.querySelector(`textarea[name="definition-${count}"]`);
    
    // Swap the values of term and definition
    const temp = termInput.value;
    termInput.value = definitionInput.value;
    definitionInput.value = temp;
}


// Function to remove the image from a specific flashcard
function removeImage(count) {
    const imageInput = document.getElementById(`flashcard-image-${count}`);
    const base64ImageInput = document.getElementById(`flashcard-image-base64-${count}`);
    const imageLabel = document.querySelector(`label[for='flashcard-image-${count}']`);
    const buttonLabel = imageLabel.querySelector(".button-label");

    // Clear file input and base64 hidden input
    imageInput.value = "";
    base64ImageInput.value = "";

    // Reset the label background and show "IMAGE" label
    imageLabel.style.backgroundImage = "none";
    buttonLabel.style.display = "inline";  // Show the "IMAGE" text
}

// Updated previewImage function to handle initial base64 data
function previewImage(event, id) {
    const input = event.target;
    const label = document.querySelector(`label[for='${input.id}']`);
    const buttonLabel = label.querySelector('.button-label');
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e) {
            label.style.backgroundImage = `url('${e.target.result}')`;
            label.style.backgroundSize = "cover";
            label.style.backgroundPosition = "center";
            label.style.backgroundRepeat = "no-repeat";
            label.style.height = "100px";
            label.style.width = "100px";
            buttonLabel.style.display = 'none';
        };
    } else {
        const initialImageBase64 = document.getElementById(`flashcard-image-base64-${id}`).value;
        if (initialImageBase64) {
            label.style.backgroundImage = `url('${initialImageBase64}')`;
            label.style.backgroundSize = "cover";
            label.style.backgroundPosition = "center";
            label.style.backgroundRepeat = "no-repeat";
            label.style.height = "100px";
            label.style.width = "100px";
            buttonLabel.style.display = 'none';
        } else {
            label.style.backgroundImage = '';
            label.style.height = '';
            label.style.width = '';
            buttonLabel.style.display = 'inline';
        }
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

        // Update name and id attributes for term, definition, image fields, and base64 hidden input
        const termInput = flashcard.querySelector('.term-input');
        const definitionInput = flashcard.querySelector('.definition-input');
        const imageInput = flashcard.querySelector('input[type="file"]');
        const imageLabel = flashcard.querySelector('label.image-button');
        const base64ImageInput = flashcard.querySelector(`input[type="hidden"]`);
        const removeImageButton = flashcard.querySelector('.remove-image-button');

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

        if (base64ImageInput) {
            base64ImageInput.setAttribute('id', `flashcard-image-base64-${newNumber}`);
            base64ImageInput.setAttribute('name', `flashcard-image-base64-${newNumber}`);
        }

        if (removeImageButton) {
            removeImageButton.setAttribute('onclick', `removeImage(${newNumber})`);
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