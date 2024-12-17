let mixed_count = 1;

document.addEventListener("DOMContentLoaded", function() {
    const mixed = JSON.parse(document.getElementById("data-json").textContent);
    // Load existing mixed into the mixed container
    mixed.forEach((mixData, index) => {
        createmixFromData(mixData, index + 1);
    });

    allowCopy();

    // Initialize Sortable
    Sortable.create(document.querySelector('.mixed-container'), {
        animation: 150,
        handle: '.drag-button',
        ghostClass: 'sortable-ghost',
        onEnd: updatemixNumbers
    });

    document.getElementById('add-card-btn').addEventListener('click', createmix);
});

function createmixFromData(mixData, count) {
    const mixContainer = document.querySelector('.mixed-container');
    const newmix = document.createElement('div');
    newmix.classList.add('mix');
    newmix.setAttribute('data-number', count);

    // Insert the template content
    newmix.innerHTML = getTemplate(mixData.type, count, mixData);

    // Attach the change event listener programmatically
    const selectElement = newmix.querySelector(`#reviewer-type-${count}`);
    if (selectElement) {
        selectElement.addEventListener('change', (event) => handleTypeChange(event, count, mixData));
    }

    if (mixData.type === "Multiple Choice"){
        newmix.querySelectorAll('.correct-answer-checkbox').forEach((checkbox, index) => {
            checkbox.checked = mixData.answer[index][1] === 1;
        });
    }

    mixContainer.appendChild(newmix);
    

    mixed_count = Math.max(mixed_count, count + 1); // Ensure mixed_count is updated
}

function getTemplate(type, count, mixData) {
    const imageUrl = mixData.image ? `data:image/jpeg;base64,${mixData.image}` : "";

    if (type === "Identification"){
        return `
            <div class="mix-header">
                <span class="mix-number">${count}</span>
                <div class="mix-actions">
                    <button type="button" class="switch-button" onclick="switchTermAndDefinition(${count})"><i class="material-icons">swap_horiz</i></button>
                    <button type="button" class="drag-button"><i class="material-icons">drag_handle</i></button>
                    <button type="button" class="delete-button"><i class="material-icons">remove_circle_outline</i></button>
                    <div class="dropdowns">
                        <select name="reviewer-type-${count}" id="reviewer-type-${count}" class="form-select question-type" style="max-width: 200px; color: black; transform: translate(100px, -145px);">
                            <option value="Identification" selected>Identification</option>
                            <option value="Multiple Choice">Multiple Choice</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="identification-content">
                <div class="input-container">
                    <textarea class="definition-input" name="question-mixed-${count}" id="question-mixed-${count}" placeholder="Enter question" maxlength="255">${mixData.question || ''}</textarea>
                    <label class="input-label">QUESTION</label>
                </div>
                <div class="input-container">
                    <textarea class="term-input" name="option-mixed-${count}-0" id="option-mixed-${count}-0" placeholder="Enter answer" maxlength="150">${mixData.answer[0][0] || ''}</textarea>
                    <label class="input-label">ANSWER</label>
                </div>
                <input type="file" name="mix-image-${count}" id="mix-image-${count}" style="display: none;" accept="image/*" onchange="previewImage(event, ${count})">
                <input type="hidden" id="mix-image-base64-${count}" value="${imageUrl}">
                <label for="mix-image-${count}" class="image-button" style="${imageUrl ? `background-image: url(${imageUrl}); background-size: cover;` : ''}">
                    <span class="button-label" ${imageUrl ? 'style="display: none;"' : ''}>IMAGE</span>
                </label>
                <button type="button" class="remove-image-button" title="Delete Image" onclick="removeImage(${count})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `
    } else {
        return `
            <div class="mix-header">
                <span class="mix-number">${count}</span>
                <div class="mix-actions">
                    <button type="button" class="drag-button"><i class="material-icons">drag_handle</i></button>
                    <button type="button" class="delete-button"><i class="material-icons">remove_circle_outline</i></button>
                    <div class="dropdowns">
                        <select name="reviewer-type-${count}" id="reviewer-type-${count}" class="form-select question-type" style="max-width: 200px; color: black; transform: translate(100px, -145px);">
                            <option value="Identification">Identification</option>
                            <option value="Multiple Choice" selected>Multiple Choice</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="mul-content">
                <div class="mul-question-container">
                    <div class="mul-question-input">
                        <textarea class="definition-input" name="question-mixed-${count}" id=name="question-mixed-${count}" placeholder="Enter question" maxlength="255">${mixData.question}</textarea>
                        <label class="input-label">QUESTION</label>
                    </div>
                    <input type="file" name="mix-image-${count}" id="mix-image-${count}" style="display: none;" accept="image/*" onchange="previewImage(event, ${count})">
                    <input type="hidden" id="mix-image-base64-${count}" value="${imageUrl}">
                    <label for="mix-image-${count}" class="image-button" style="${imageUrl ? `background-image: url(${imageUrl}); background-size: cover;` : ''}">
                        <span class="button-label" ${imageUrl ? 'style="display: none;"' : ''}>IMAGE</span>
                    </label>
                    <button type="button" class="remove-image-button" title="Delete Image" onclick="removeImage(${count})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <p class="input-label" style="margin: 10px auto;">OPTIONS</p>
                <div class="options-container" id="options-container-${count}">
                    <div class="option">
                        <input type="radio" name="option-mixed-${count}" value="0" class="correct-answer-checkbox" title="Check if this Option is Correct">
                        <input type="text" class="option-input" id="option-mixed-${count}-0" name="option-mixed-${count}-0" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mixData.answer[0][0] || ''}">
                    </div>
                    <div class="option">
                        <input type="radio" name="option-mixed-${count}" value="1" class="correct-answer-checkbox" title="Check if this Option is Correct">
                        <input type="text" class="option-input" id="option-mixed-${count}-1" name="option-mixed-${count}-1" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mixData.answer[1][0] || ''}">
                    </div>
                    <div class="option">
                        <input type="radio" name="option-mixed-${count}" value="2" class="correct-answer-checkbox" title="Check if this Option is Correct">
                        <input type="text" class="option-input" id="option-mixed-${count}-2" name="option-mixed-${count}-2" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mixData.answer[2][0] || ''}">
                    </div>
                    <div class="option">
                        <input type="radio" name="option-mixed-${count}" value="3" class="correct-answer-checkbox" title="Check if this Option is Correct">
                        <input type="text" class="option-input" id="option-mixed-${count}-3" name="option-mixed-${count}-3" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mixData.answer[3][0] || ''}">
                    </div>
                    <label class="remove-chosen-label" for="remove-chosen=${count}">Remove Chosen</label>
                    <input type="button" id="remove-chosen=${count}" onclick="removeChosen(${count})" style="display: none;">
                </div>
            </div>
        `
    }
}

function removeChosen(count) {
    document.querySelector(`input[name='option-mixed-${count}']:checked`).checked = false;
}
function handleTypeChange(event, count, mixData) {
    const newType = event.target.value;
    const currentMix = document.querySelector(`.mix[data-number="${count}"]`);

    if (!currentMix) return;
    mixData.question = currentMix.querySelector(`.definition-input`).value || '';
    const correct = currentMix.querySelector(`#option-mixed-${count}-0`).value || '';
    if (mixData.type === "Identification"){
        mixData.answer = [[correct, 1], ["", 0], ["", 0], ["", 0]];
        mixData.type = "Multiple Choice";
    } else {
        mixData.answer = [[correct, 1]];
        mixData.type = "Identification";
    }

    // Replace content
    currentMix.innerHTML = getTemplate(newType, count, mixData);

    if (mixData.type === "Multiple Choice"){
        newmix.querySelectorAll('.correct-answer-checkbox').forEach((checkbox, index) => {
            checkbox.checked = mixData.answer[index][1] === 1;
        });
    }

    // Reattach event listener
    const selectElement = currentMix.querySelector(`#reviewer-type-${count}`);
    if (selectElement) {
        selectElement.addEventListener('change', (event) => handleTypeChange(event, count, mixData));
    }
}

// Updated function to create a blank mix
function createmix() {
    const mixContainer = document.querySelector('.mixed-container');
    const newmix = document.createElement('div');
    newmix.classList.add('mix');
    newmix.setAttribute('data-number', mixed_count);

    const mixData = { type: "Identification", answer: [["", 1]], question: "", image: "" };
    newmix.innerHTML = getTemplate(mixData.type, parseInt(newmix.getAttribute('data-number')), mixData);

    // Attach type change event listener
    
    const selectElement = newmix.querySelector(`#reviewer-type-${parseInt(newmix.getAttribute('data-number'))}`);
    selectElement.addEventListener('change', (event) => handleTypeChange(event, parseInt(newmix.getAttribute('data-number')), mixData));

    mixContainer.appendChild(newmix);
    mixed_count++;
}

// Function to switch term and definition
function switchTermAndDefinition(count) {
    const termInput = document.querySelector(`textarea[name="answer-${count}"]`);
    const definitionInput = document.querySelector(`textarea[name="question-${count}"]`);
    
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
        const optionInputs = mix.querySelectorAll('.option-input');
        const optionCheckboxes = mix.querySelectorAll('.correct-answer-checkbox');
        const definitionInput = mix.querySelector('.definition-input');
        const imageInput = mix.querySelector('input[type="file"]');
        const imageLabel = mix.querySelector('label.image-button');
        const base64ImageInput = mix.querySelector(`input[type="hidden"]`);
        const removeImageButton = mix.querySelector('.remove-image-button');

        if (termInput) {
            termInput.setAttribute('name', `option-mixed-${newNumber}-0`);
            termInput.setAttribute('id', `option-mixed-${newNumber}-0`);
        }

        // Update options inputs and checkboxes
        optionInputs.forEach((input, optionIndex) => {
            input.setAttribute('name', `option-mixed-${newNumber}-${optionIndex}`);
            input.setAttribute('id', `option-mixed-${newNumber}-${optionIndex}`);
        });

        optionCheckboxes.forEach((checkbox, optionIndex) => {
            checkbox.setAttribute('name', `option-mixed-${newNumber}`);
            checkbox.setAttribute('value', `${optionIndex}`);
        });

        if (definitionInput) {
            definitionInput.setAttribute('name', `question-mixed-${newNumber}`);
            definitionInput.setAttribute('id', `question-mixed-${newNumber}`);
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