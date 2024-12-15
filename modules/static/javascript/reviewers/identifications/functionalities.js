/**
 * Handles the functionalities of the identifications. Adding, deleting, editing, moving, etc.
 */

let identificationCount = 1;

document.addEventListener("DOMContentLoaded", function() {
    const identifications = JSON.parse(document.getElementById("data-json").textContent);

    // Load existing identifications into the identifications container
    identifications.forEach((identificationData, index) => {
        createidentificationFromData(identificationData, index + 1);
    });
});

function createidentificationFromData(identificationData, count) {
    const identificationContainer = document.querySelector('.identifications-container');
    const newidentification = document.createElement('div');
    newidentification.classList.add('identification');
    newidentification.setAttribute('data-number', count);

    const imageUrl = identificationData.image ? `data:image/jpeg;base64,${identificationData.image}` : "";

    newidentification.innerHTML = `
        <div class="identification-header">
            <span class="identification-number">${count}</span>
            <div class="identification-actions">
                <button type="button" class="switch-button" onclick="switchTermAndDefinition(${count})"><i class="material-icons">swap_horiz</i></button>
                <button type="button" class="drag-button"><i class="material-icons">drag_handle</i></button>
                <button type="button" class="delete-button"><i class="material-icons">remove_circle_outline</i></button>
                <div class="ms-5 dropdowns">
                    <div class="d-flex">
                        <select name="reviewer-type" id="reviewer-type" class="form-select" style="max-width: 200px; color: black; transform: translate(100px, -145px);" disabled>
                            <option value="Identification" selected>Identification</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="identification-content">
            <div class="input-container">
                <textarea class="term-input" name="term-${count}" placeholder="Enter term" maxlength="150">${identificationData.answer}</textarea>
                <label class="input-label">ANSWER</label>
            </div>
            <div class="input-container">
                <textarea class="definition-input" name="definition-${count}" placeholder="Enter definition" maxlength="255">${identificationData.question}</textarea>
                <label class="input-label">QUESTION</label>
            </div>
            <input type="file" name="identification-image-${count}" id="identification-image-${count}" style="display: none;" accept="image/*" onchange="previewImage(event, ${count})">
            <input type="hidden" id="identification-image-base64-${count}" value="${imageUrl}">
            <label for="identification-image-${count}" class="image-button" style="${imageUrl ? 'background-image: url(' + imageUrl + '); background-size: cover;' : ''}">
                <span class="button-label" ${imageUrl ? 'style="display: none;"' : ''}>IMAGE</span>
            </label>
            <button type="button" class="remove-image-button" title="Delete Card" onclick="removeImage(${count})">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    identificationContainer.appendChild(newidentification);
    identificationCount = count + 1;
}

// Updated function to create a blank identification
function createidentification() {
    const identificationContainer = document.querySelector('.identifications-container');
    const newidentification = document.createElement('div');
    newidentification.classList.add('identification');
    newidentification.setAttribute('data-number', identificationCount);

    newidentification.innerHTML = `
        <div class="identification-header">
            <span class="identification-number">${identificationCount}</span>
            <div class="identification-actions">
                <button type="button" class="switch-button" onclick="switchTermAndDefinition(${identificationCount})"><i class="material-icons">swap_horiz</i></button>
                <button type="button" class="drag-button"><i class="material-icons">drag_handle</i></button>
                <button type="button" class="delete-button"><i class="material-icons">remove_circle_outline</i></button>
                <div class="ms-5 dropdowns">
                    <div class="d-flex">
                        <select name="reviewer-type" id="reviewer-type" class="form-select" style="max-width: 200px; color: black; transform: translate(100px, -145px);" disabled>
                            <option value="Identification" selected>Identification</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="identification-content">
            <div class="input-container">
                <textarea class="term-input" name="term-${identificationCount}" placeholder="Enter answer" maxlength="150"></textarea>
                <label class="input-label">ANSWER</label>
            </div>
            <div class="input-container">
                <textarea class="definition-input" name="definition-${identificationCount}" placeholder="Enter question" maxlength="255"></textarea>
                <label class="input-label">QUESTION</label>
            </div>
            <input type="file" name="identification-image-${identificationCount}" id="identification-image-${identificationCount}" style="display: none;" accept="image/*" onchange="previewImage(event, ${identificationCount})">
            <input type="hidden" id="identification-image-base64-${identificationCount}" value="">
            <label for="identification-image-${identificationCount}" class="image-button">
                <span class="button-label">IMAGE</span>
            </label><button type="button" class="remove-image-button" title="Delete Card" onclick="removeImage(${identificationCount})">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    identificationContainer.appendChild(newidentification);
    identificationCount++;
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


// Function to remove the image from a specific identification
function removeImage(count) {
    const imageInput = document.getElementById(`identification-image-${count}`);
    const base64ImageInput = document.getElementById(`identification-image-base64-${count}`);
    const imageLabel = document.querySelector(`label[for='identification-image-${count}']`);
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
        reader.onload = function(e) {
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
        const initialImageBase64 = document.getElementById(`identification-image-base64-${id}`).value;
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

// Remove identification
document.addEventListener('click', function (event) {
    if (event.target.closest('.delete-button')) {
        const card = event.target.closest('.identification');
        card.remove();
        identificationCount--;
        updateidentificationNumbers();
    }
});

// Update identification numbers
function updateidentificationNumbers() {
    document.querySelectorAll('.identification').forEach((identification, index) => {
        const newNumber = index + 1;
        identification.setAttribute('data-number', newNumber);

        // Update the visible identification number
        const numberElement = identification.querySelector('.identification-number');
        if (numberElement) {
            numberElement.textContent = newNumber;
        }

        // Update name and id attributes for term, definition, image fields, and base64 hidden input
        const termInput = identification.querySelector('.term-input');
        const definitionInput = identification.querySelector('.definition-input');
        const imageInput = identification.querySelector('input[type="file"]');
        const imageLabel = identification.querySelector('label.image-button');
        const base64ImageInput = identification.querySelector(`input[type="hidden"]`);
        const removeImageButton = identification.querySelector('.remove-image-button');

        if (termInput) {
            termInput.setAttribute('name', `term-${newNumber}`);
            termInput.setAttribute('id', `term-${newNumber}`);
        }

        if (definitionInput) {
            definitionInput.setAttribute('name', `definition-${newNumber}`);
            definitionInput.setAttribute('id', `definition-${newNumber}`);
        }

        if (imageInput) {
            imageInput.setAttribute('name', `identification-image-${newNumber}`);
            imageInput.setAttribute('id', `identification-image-${newNumber}`);
        }

        if (imageLabel) {
            imageLabel.setAttribute('for', `identification-image-${newNumber}`);
        }

        if (base64ImageInput) {
            base64ImageInput.setAttribute('id', `identification-image-base64-${newNumber}`);
            base64ImageInput.setAttribute('name', `identification-image-base64-${newNumber}`);
        }

        if (removeImageButton) {
            removeImageButton.setAttribute('onclick', `removeImage(${newNumber})`);
        }
    });
}

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


// Initialize Sortable
Sortable.create(document.querySelector('.identifications-container'), {
    animation: 150,
    handle: '.drag-button',
    ghostClass: 'sortable-ghost',
    onEnd: updateidentificationNumbers
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('add-card-btn').addEventListener('click', createidentification);
});