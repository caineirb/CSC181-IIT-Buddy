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
                    <div class="dropdowns">
                        <select name="reviewer-type-${count}" id="reviewer-type-${count}" class="form-select question-type" style="max-width: 200px; color: black; transform: translate(100px, -145px);" disabled>
                            <option value="Identification" selected>Identification</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="identification-content">
                <div class="input-container">
                    <textarea class="definition-input" name="question-mixed-${count}" id="question-mixed-${count}" placeholder="Enter question" maxlength="255" readonly>${mixData.question || ''}</textarea>
                    <label class="input-label">QUESTION</label>
                </div>
                <div class="input-container">
                    <textarea class="term-input" name="option-mixed-${count}-0" id="option-mixed-${count}-0" placeholder="Enter answer" maxlength="150" readonly>${mixData.answer[0][0] || ''}</textarea>
                    <label class="input-label">ANSWER</label>
                </div>
                <input type="file" name="mix-image-${count}" id="mix-image-${count}" style="display: none;" accept="image/*" onchange="previewImage(event, ${count})" disabled>
                <input type="hidden" id="mix-image-base64-${count}" value="${imageUrl}">
                <label for="mix-image-${count}" class="image-button" style="${imageUrl ? `background-image: url(${imageUrl}); background-size: cover;` : ''}">
                    <span class="button-label" ${imageUrl ? 'style="display: none;"' : ''}>IMAGE</span>
                </label>
            </div>
        `
    } else {
        return `
            <div class="mix-header">
                <span class="mix-number">${count}</span>
                <div class="mix-actions">
                    <div class="dropdowns">
                        <select name="reviewer-type-${count}" id="reviewer-type-${count}" class="form-select question-type" style="max-width: 200px; color: black; transform: translate(100px, -145px);" disabled>
                            <option value="Multiple Choice" selected>Multiple Choice</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="mul-content">
                <div class="mul-question-container">
                    <div class="mul-question-input">
                        <textarea class="definition-input" name="question-mixed-${count}" id=name="question-mixed-${count}" placeholder="Enter question" maxlength="255" readonly>${mixData.question}</textarea>
                        <label class="input-label">QUESTION</label>
                    </div>
                    <input type="file" name="mix-image-${count}" id="mix-image-${count}" style="display: none;" accept="image/*" onchange="previewImage(event, ${count})" disabled>
                    <input type="hidden" id="mix-image-base64-${count}" value="${imageUrl}">
                    <label for="mix-image-${count}" class="image-button" style="${imageUrl ? `background-image: url(${imageUrl}); background-size: cover;` : ''}">
                        <span class="button-label" ${imageUrl ? 'style="display: none;"' : ''}>IMAGE</span>
                    </label>
                </div>
                <p class="input-label" style="margin: 10px auto;">OPTIONS</p>
                <div class="options-container" id="options-container-${count}">
                    <div class="option">
                        <input type="radio" name="option-mixed-${count}" value="0" class="correct-answer-checkbox" title="Check if this Option is Correct" disabled>
                        <input type="text" class="option-input" id="option-mixed-${count}-0" name="option-mixed-${count}-0" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mixData.answer[0][0] || ''}" readonly>
                    </div>
                    <div class="option">
                        <input type="radio" name="option-mixed-${count}" value="1" class="correct-answer-checkbox" title="Check if this Option is Correct" disabled>
                        <input type="text" class="option-input" id="option-mixed-${count}-1" name="option-mixed-${count}-1" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mixData.answer[1][0] || ''}" readonly>
                    </div>
                    <div class="option">
                        <input type="radio" name="option-mixed-${count}" value="2" class="correct-answer-checkbox" title="Check if this Option is Correct" disabled>
                        <input type="text" class="option-input" id="option-mixed-${count}-2" name="option-mixed-${count}-2" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mixData.answer[2][0] || ''}" readonly>
                    </div>
                    <div class="option">
                        <input type="radio" name="option-mixed-${count}" value="3" class="correct-answer-checkbox" title="Check if this Option is Correct" disabled>
                        <input type="text" class="option-input" id="option-mixed-${count}-3" name="option-mixed-${count}-3" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mixData.answer[3][0] || ''}" readonly>
                    </div>
                    <label class="remove-chosen-label" for="remove-chosen=${count}">Remove Chosen</label>
                    <input type="button" id="remove-chosen=${count}" onclick="removeChosen(${count})" style="display: none;" disabled>
                </div>
            </div>
        `
    }
}

function takeReview(){
    if (mixed_count > 1){
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