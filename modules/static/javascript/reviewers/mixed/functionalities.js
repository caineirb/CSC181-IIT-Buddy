/**
 * Handles the functionalities of the mixed. Adding, deleting, editing, moving, etc.
 */

let mixed_count = 1;

document.addEventListener("DOMContentLoaded", function() {
    const mixed = JSON.parse(document.getElementById("data-json").textContent);

    // Load existing mixed into the mixed container
    mixed.forEach((mixData, index) => {
        createmixFromData(mixData, index + 1);
    });
});

function createmixFromData(mixData, count) {
    const mixContainer = document.querySelector('.mixed-container');
    const newmix = document.createElement('div');
    newmix.classList.add('mix');
    newmix.setAttribute('data-number', count);

    const imageUrl = mixData.image ? `data:image/jpeg;base64,${mixData.image}` : "";

    newmix.innerHTML = `
        <div class="mix-header">
            <span class="mix-number">${count}</span>
            <div class="mix-actions">
                <button type="button" class="switch-button" onclick="switchTermAndDefinition(${count})"><i class="material-icons">swap_horiz</i></button>
                <button type="button" class="drag-button"><i class="material-icons">drag_handle</i></button>
                <button type="button" class="delete-button"><i class="material-icons">remove_circle_outline</i></button>
                <div class="ms-5 dropdowns">
                    <div class="d-flex">
                        <select name="reviewer-type-${count}" id="reviewer-type-${count}" class="form-select" style="max-width: 200px; color: black; transform: translate(100px, -145px);">
                            <option value="Identification">Identification</option>
                            <option value="Mixed">Mixed</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="mix-content">
            <div class="input-container">
                <textarea class="term-input" name="term-${count}" placeholder="Enter term" maxlength="150">${mixData.answer}</textarea>
                <label class="input-label">ANSWER</label>
            </div>
            <div class="input-container">
                <textarea class="definition-input" name="definition-${count}" placeholder="Enter definition" maxlength="255">${mixData.question}</textarea>
                <label class="input-label">QUESTION</label>
            </div>
            <input type="file" name="mix-image-${count}" id="mix-image-${count}" style="display: none;" accept="image/*" onchange="previewImage(event, ${count})">
            <input type="hidden" id="mix-image-base64-${count}" value="${imageUrl}">
            <label for="mix-image-${count}" class="image-button" style="${imageUrl ? 'background-image: url(' + imageUrl + '); background-size: cover;' : ''}">
                <span class="button-label" ${imageUrl ? 'style="display: none;"' : ''}>IMAGE</span>
            </label>
            <button type="button" class="remove-image-button" title="Delete Card" onclick="removeImage(${count})">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    mixContainer.appendChild(newmix);

    // Get the select element from the newly created newmix element
    const selectElement = document.getElementById(`reviewer-type-${count}`);

    // Backend data value
    const mixType = mixData.type; // Value from the backend

    // Preselect the option that matches the backend value
    for (const option of selectElement.options) {
        if (option.value === mixType) {
            option.selected = true;
            break;
        }
    }

    mixed_count = count + 1;
}

// Updated function to create a blank mix
function createmix() {
    const mixContainer = document.querySelector('.mixed-container');
    const newmix = document.createElement('div');
    newmix.classList.add('mix');
    newmix.setAttribute('data-number', mixed_count);

    newmix.innerHTML = `
        <div class="mix-header">
            <span class="mix-number">${mixed_count}</span>
            <div class="mix-actions">
                <button type="button" class="switch-button" onclick="switchTermAndDefinition(${mixed_count})"><i class="material-icons">swap_horiz</i></button>
                <button type="button" class="drag-button"><i class="material-icons">drag_handle</i></button>
                <button type="button" class="delete-button"><i class="material-icons">remove_circle_outline</i></button>
                <div class="ms-5 dropdowns">
                    <div class="d-flex">
                        <select name="reviewer-type-${mixed_count}" id="reviewer-type-${mixed_count}" class="form-select" style="max-width: 200px; color: black; transform: translate(100px, -145px);">
                            <option value="Identification" selected>Identification</option>
                            <option value="Mixed">Mixed</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="mix-content">
            <div class="input-container">
                <textarea class="term-input" name="term-${mixed_count}" placeholder="Enter answer" maxlength="150"></textarea>
                <label class="input-label">ANSWER</label>
            </div>
            <div class="input-container">
                <textarea class="definition-input" name="definition-${mixed_count}" placeholder="Enter question" maxlength="255"></textarea>
                <label class="input-label">QUESTION</label>
            </div>
            <input type="file" name="mix-image-${mixed_count}" id="mix-image-${mixed_count}" style="display: none;" accept="image/*" onchange="previewImage(event, ${mixed_count})">
            <input type="hidden" id="mix-image-base64-${mixed_count}" value="">
            <label for="mix-image-${mixed_count}" class="image-button">
                <span class="button-label">IMAGE</span>
            </label><button type="button" class="remove-image-button" title="Delete Card" onclick="removeImage(${mixed_count})">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    mixContainer.appendChild(newmix);
    mixed_count++;
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


// Function to remove the image from a specific mix
function removeImage(count) {
    const imageInput = document.getElementById(`mix-image-${count}`);
    const base64ImageInput = document.getElementById(`mix-image-base64-${count}`);
    const imageLabel = document.querySelector(`label[for='mix-image-${count}']`);
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
        const initialImageBase64 = document.getElementById(`mix-image-base64-${id}`).value;
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

// Remove mix
document.addEventListener('click', function (event) {
    if (event.target.closest('.delete-button')) {
        const card = event.target.closest('.mix');
        card.remove();
        mixed_count--;
        updatemixNumbers();
    }
});

// Update mix numbers
function updatemixNumbers() {
    document.querySelectorAll('.mix').forEach((mix, index) => {
        const newNumber = index + 1;
        mix.setAttribute('data-number', newNumber);

        // Update the visible mix number
        const numberElement = mix.querySelector('.mix-number');
        if (numberElement) {
            numberElement.textContent = newNumber;
        }

        // Update name and id attributes for term, definition, image fields, and base64 hidden input
        const termInput = mix.querySelector('.term-input');
        const definitionInput = mix.querySelector('.definition-input');
        const imageInput = mix.querySelector('input[type="file"]');
        const imageLabel = mix.querySelector('label.image-button');
        const base64ImageInput = mix.querySelector(`input[type="hidden"]`);
        const removeImageButton = mix.querySelector('.remove-image-button');

        if (termInput) {
            termInput.setAttribute('name', `term-${newNumber}`);
            termInput.setAttribute('id', `term-${newNumber}`);
        }

        if (definitionInput) {
            definitionInput.setAttribute('name', `definition-${newNumber}`);
            definitionInput.setAttribute('id', `definition-${newNumber}`);
        }

        if (imageInput) {
            imageInput.setAttribute('name', `mix-image-${newNumber}`);
            imageInput.setAttribute('id', `mix-image-${newNumber}`);
        }

        if (imageLabel) {
            imageLabel.setAttribute('for', `mix-image-${newNumber}`);
        }

        if (base64ImageInput) {
            base64ImageInput.setAttribute('id', `mix-image-base64-${newNumber}`);
            base64ImageInput.setAttribute('name', `mix-image-base64-${newNumber}`);
        }

        if (removeImageButton) {
            removeImageButton.setAttribute('onclick', `removeImage(${newNumber})`);
        }
    });
}

// Initialize Sortable
Sortable.create(document.querySelector('.mixed-container'), {
    animation: 150,
    handle: '.drag-button',
    ghostClass: 'sortable-ghost',
    onEnd: updatemixNumbers
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('add-card-btn').addEventListener('click', createmix);
});