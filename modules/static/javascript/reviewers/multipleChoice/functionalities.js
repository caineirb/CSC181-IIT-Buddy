let multiple_choice_count = 1;

document.addEventListener("DOMContentLoaded", function() {
    const multiple_choice = JSON.parse(document.getElementById("data-json").textContent);
    // Load existing multiple_choice into the multiple_choice container
    multiple_choice.forEach((mulData, index) => {
        createmulFromData(mulData, index + 1);
    });
    allowCopy();

    // Initialize Sortable
    Sortable.create(document.querySelector('.multiple_choice-container'), {
        animation: 150,
        handle: '.drag-button',
        ghostClass: 'sortable-ghost',
        onEnd: updatemulNumbers
    });

    document.getElementById('add-card-btn').addEventListener('click', createmul);
});

function createmulFromData(mulData, count) {
    const mulContainer = document.querySelector('.multiple_choice-container');
    const newmul = document.createElement('div');
    newmul.classList.add('mul');
    newmul.setAttribute('data-number', count);
    const imageUrl = mulData.image ? `data:image/jpeg;base64,${mulData.image}` : "";
    // Insert the template content
    newmul.innerHTML = `
        <div class="mul-header">
            <span class="mul-number">${count}</span>
            <div class="mul-actions">
                <button type="button" class="drag-button"><i class="material-icons">drag_handle</i></button>
                <button type="button" class="delete-button"><i class="material-icons">remove_circle_outline</i></button>
                <div class="dropdowns">
                    <select name="reviewer-type-${count}" id="reviewer-type-${count}" class="form-select question-type" style="max-width: 200px; color: black; transform: translate(100px, -145px);" disabled>
                        <option value="Multiple Choice">Multiple Choice</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="mul-content">
            <div class="mul-question-container">
                <div class="mul-question-input">
                    <textarea class="definition-input" name="question-multiple_choice-${count}" id=name="question-multiple_choice-${count}" placeholder="Enter question" maxlength="255">${mulData.question}</textarea>
                    <label class="input-label">QUESTION</label>
                </div>
                <input type="file" name="mul-image-${count}" id="mul-image-${count}" style="display: none;" accept="image/*" onchange="previewImage(event, ${count})">
                <input type="hidden" id="mul-image-base64-${count}" value="${imageUrl}">
                <label for="mul-image-${count}" class="image-button" style="${imageUrl ? `background-image: url(${imageUrl}); background-size: cover;` : ''}">
                    <span class="button-label" ${imageUrl ? 'style="display: none;"' : ''}>IMAGE</span>
                </label>
                <button type="button" class="remove-image-button" title="Delete Image" onclick="removeImage(${count})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <p class="input-label" style="margin: 10px auto;">OPTIONS</p>
            <div class="options-container" id="options-container-${count}">
                <div class="option">
                    <input type="radio" name="option-multiple_choice-${count}" value="0" class="correct-answer-checkbox" title="Check if this Option is Correct">
                    <input type="text" class="option-input" id="option-multiple_choice-${count}-0" name="option-multiple_choice-${count}-0" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mulData.answer[0][0] || ''}">
                </div>
                <div class="option">
                    <input type="radio" name="option-multiple_choice-${count}" value="1" class="correct-answer-checkbox" title="Check if this Option is Correct">
                    <input type="text" class="option-input" id="option-multiple_choice-${count}-1" name="option-multiple_choice-${count}-1" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mulData.answer[1][0] || ''}">
                </div>
                <div class="option">
                    <input type="radio" name="option-multiple_choice-${count}" value="2" class="correct-answer-checkbox" title="Check if this Option is Correct">
                    <input type="text" class="option-input" id="option-multiple_choice-${count}-2" name="option-multiple_choice-${count}-2" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mulData.answer[2][0] || ''}">
                </div>
                <div class="option">
                    <input type="radio" name="option-multiple_choice-${count}" value="3" class="correct-answer-checkbox" title="Check if this Option is Correct">
                    <input type="text" class="option-input" id="option-multiple_choice-${count}-3" name="option-multiple_choice-${count}-3" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mulData.answer[3][0] || ''}">
                </div>
                <label class="remove-chosen-label" for="remove-chosen=${count}">Remove Chosen</label>
                <input type="button" id="remove-chosen=${count}" onclick="removeChosen(${count})" style="display: none;">
            </div>
        </div>
    `;

    newmul.querySelectorAll('.correct-answer-checkbox').forEach((checkbox, index) => {
        checkbox.checked = mulData.answer[index][1] === 1;
    });

    mulContainer.appendChild(newmul);
    multiple_choice_count = count + 1; // Ensure multiple_choice_count is updated
}

function removeChosen(count) {
    document.querySelector(`input[name='option-multiple_choice-${count}']:checked`).checked = false;
}

// Updated function to create a blank mul
function createmul() {
    const mulContainer = document.querySelector('.multiple_choice-container');
    const newmul = document.createElement('div');
    newmul.classList.add('mul');
    newmul.setAttribute('data-number', multiple_choice_count);

    newmul.innerHTML = `
        <div class="mul-header">
            <span class="mul-number">${multiple_choice_count}</span>
            <div class="mul-actions">
                <button type="button" class="drag-button"><i class="material-icons">drag_handle</i></button>
                <button type="button" class="delete-button"><i class="material-icons">remove_circle_outline</i></button>
                <div class="dropdowns">
                    <select name="reviewer-type-${multiple_choice_count}" id="reviewer-type-${multiple_choice_count}" class="form-select question-type" style="max-width: 200px; color: black; transform: translate(100px, -145px);" disabled>
                        <option value="Multiple Choice">Multiple Choice</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="mul-content">
            <div class="mul-question-container">
                <div class="mul-question-input">
                    <textarea class="definition-input" name="question-multiple_choice-${multiple_choice_count}" id=name="question-multiple_choice-${multiple_choice_count}" placeholder="Enter question" maxlength="255"></textarea>
                    <label class="input-label">QUESTION</label>
                </div>
                <input type="file" name="mul-image-${multiple_choice_count}" id="mul-image-${multiple_choice_count}" style="display: none;" accept="image/*" onchange="previewImage(event, ${multiple_choice_count})">
                <input type="hidden" id="mul-image-base64-${multiple_choice_count}">
                <label for="mul-image-${multiple_choice_count}" class="image-button">
                    <span class="button-label">IMAGE</span>
                </label>
                <button type="button" class="remove-image-button" title="Delete Image" onclick="removeImage(${multiple_choice_count})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <p class="input-label" style="margin: 10px auto;">OPTIONS</p>
            <div class="options-container" id="options-container-${multiple_choice_count}">
                <div class="option">
                    <input type="radio" name="option-multiple_choice-${multiple_choice_count}" value="0" class="correct-answer-checkbox" title="Check if this Option is Correct">
                    <input type="text" class="option-input" id="option-multiple_choice-${multiple_choice_count}-0" name="option-multiple_choice-${multiple_choice_count}-0" placeholder="Enter option" maxlength="150" style="width: 90%;"}">
                </div>
                <div class="option">
                    <input type="radio" name="option-multiple_choice-${multiple_choice_count}" value="1" class="correct-answer-checkbox" title="Check if this Option is Correct">
                    <input type="text" class="option-input" id="option-multiple_choice-${multiple_choice_count}-1" name="option-multiple_choice-${multiple_choice_count}-1" placeholder="Enter option" maxlength="150" style="width: 90%;">
                </div>
                <div class="option">
                    <input type="radio" name="option-multiple_choice-${multiple_choice_count}" value="2" class="correct-answer-checkbox" title="Check if this Option is Correct">
                    <input type="text" class="option-input" id="option-multiple_choice-${multiple_choice_count}-2" name="option-multiple_choice-${multiple_choice_count}-2" placeholder="Enter option" maxlength="150" style="width: 90%;">
                </div>
                <div class="option">
                    <input type="radio" name="option-multiple_choice-${multiple_choice_count}" value="3" class="correct-answer-checkbox" title="Check if this Option is Correct">
                    <input type="text" class="option-input" id="option-multiple_choice-${multiple_choice_count}-3" name="option-multiple_choice-${multiple_choice_count}-3" placeholder="Enter option" maxlength="150" style="width: 90%;">
                </div>
                <label class="remove-chosen-label" for="remove-chosen=${multiple_choice_count}">Remove Chosen</label>
                <input type="button" id="remove-chosen=${multiple_choice_count}" onclick="removeChosen(${multiple_choice_count})" style="display: none;">
            </div>
        </div>
    `;

    mulContainer.appendChild(newmul);
    multiple_choice_count++;
}

// Function to remove the image from a specific mul
function removeImage(count) {
    const imageInput = document.getElementById(`mul-image-${count}`);
    const base64ImageInput = document.getElementById(`mul-image-base64-${count}`);
    const imageLabel = document.querySelector(`label[for='mul-image-${count}']`);
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
        const initialImageBase64 = document.getElementById(`mul-image-base64-${id}`).value;
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

// Remove mul
document.addEventListener('click', function (event) {
    if (event.target.closest('.delete-button')) {
        const card = event.target.closest('.mul');
        card.remove();
        multiple_choice_count--;
        updatemulNumbers();
    }
});

// Update mul numbers
function updatemulNumbers() {
    document.querySelectorAll('.mul').forEach((mul, index) => {
        const newNumber = index + 1;
        mul.setAttribute('data-number', newNumber);

        // Update the visible mul number
        const numberElement = mul.querySelector('.mul-number');
        if (numberElement) {
            numberElement.textContent = newNumber;
        }

        // Update name and id attributes for term, definition, image fields, and base64 hidden input
        const termInput = mul.querySelector('.term-input');
        const optionInputs = mul.querySelectorAll('.option-input');
        const optionCheckboxes = mul.querySelectorAll('.correct-answer-checkbox');
        const definitionInput = mul.querySelector('.definition-input');
        const imageInput = mul.querySelector('input[type="file"]');
        const imageLabel = mul.querySelector('label.image-button');
        const base64ImageInput = mul.querySelector(`input[type="hidden"]`);
        const removeImageButton = mul.querySelector('.remove-image-button');

        if (termInput) {
            termInput.setAttribute('name', `option-multiple_choice-${newNumber}-0`);
            termInput.setAttribute('id', `option-multiple_choice-${newNumber}-0`);
        }

        // Update options inputs and checkboxes
        optionInputs.forEach((input, optionIndex) => {
            input.setAttribute('name', `option-multiple_choice-${newNumber}-${optionIndex}`);
            input.setAttribute('id', `option-multiple_choice-${newNumber}-${optionIndex}`);
        });

        optionCheckboxes.forEach((checkbox, optionIndex) => {
            checkbox.setAttribute('name', `option-multiple_choice-${newNumber}`);
            checkbox.setAttribute('value', `${optionIndex}`);
        });

        if (definitionInput) {
            definitionInput.setAttribute('name', `question-multiple_choice-${newNumber}`);
            definitionInput.setAttribute('id', `question-multiple_choice-${newNumber}`);
        }

        if (imageInput) {
            imageInput.setAttribute('name', `mul-image-${newNumber}`);
            imageInput.setAttribute('id', `mul-image-${newNumber}`);
        }

        if (imageLabel) {
            imageLabel.setAttribute('for', `mul-image-${newNumber}`);
        }

        if (base64ImageInput) {
            base64ImageInput.setAttribute('id', `mul-image-base64-${newNumber}`);
            base64ImageInput.setAttribute('name', `mul-image-base64-${newNumber}`);
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