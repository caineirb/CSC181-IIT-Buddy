let multiple_choice_count = 1;

document.addEventListener("DOMContentLoaded", function() {
    const multiple_choice = JSON.parse(document.getElementById("data-json").textContent);
    // Load existing multiple_choice into the multiple_choice container
    multiple_choice.forEach((mulData, index) => {
        createmulFromData(mulData, index + 1);
    });
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
                    <textarea class="definition-input" name="question-multiple_choice-${count}" id=name="question-multiple_choice-${count}" placeholder="Enter question" maxlength="255" readonly>${mulData.question}</textarea>
                    <label class="input-label">QUESTION</label>
                </div>
                <input type="file" name="mul-image-${count}" id="mul-image-${count}" style="display: none;" accept="image/*" onchange="previewImage(event, ${count})">
                <input type="hidden" id="mul-image-base64-${count}" value="${imageUrl}">
                <label for="mul-image-${count}" class="image-button" style="${imageUrl ? `background-image: url(${imageUrl}); background-size: cover;` : ''}">
                    <span class="button-label" ${imageUrl ? 'style="display: none;"' : ''}>IMAGE</span>
                </label>
            </div>
            <p class="input-label" style="margin: 10px auto;">OPTIONS</p>
            <div class="options-container" id="options-container-${count}">
                <div class="option">
                    <input type="radio" name="option-multiple_choice-${count}" value="0" class="correct-answer-checkbox" title="Check if this Option is Correct">
                    <input type="text" class="option-input" id="option-multiple_choice-${count}-0" name="option-multiple_choice-${count}-0" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mulData.answer[0][0] || ''}" readonly>
                </div>
                <div class="option">
                    <input type="radio" name="option-multiple_choice-${count}" value="1" class="correct-answer-checkbox" title="Check if this Option is Correct">
                    <input type="text" class="option-input" id="option-multiple_choice-${count}-1" name="option-multiple_choice-${count}-1" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mulData.answer[1][0] || ''}" readonly>
                </div>
                <div class="option">
                    <input type="radio" name="option-multiple_choice-${count}" value="2" class="correct-answer-checkbox" title="Check if this Option is Correct">
                    <input type="text" class="option-input" id="option-multiple_choice-${count}-2" name="option-multiple_choice-${count}-2" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mulData.answer[2][0] || ''}" readonly>
                </div>
                <div class="option">
                    <input type="radio" name="option-multiple_choice-${count}" value="3" class="correct-answer-checkbox" title="Check if this Option is Correct">
                    <input type="text" class="option-input" id="option-multiple_choice-${count}-3" name="option-multiple_choice-${count}-3" placeholder="Enter option" maxlength="150" style="width: 90%;" value="${mulData.answer[3][0] || ''}" readonly>
                </div>
                <label class="remove-chosen-label" for="remove-chosen=${count}">Remove Chosen</label>
                <input type="button" id="remove-chosen=${count}" onclick="removeChosen(${count})" style="display: none;" disabled>
            </div>
        </div>
    `;

    newmul.querySelectorAll('.correct-answer-checkbox').forEach((checkbox, index) => {
        checkbox.checked = mulData.answer[index][1] === 1;
    });

    mulContainer.appendChild(newmul);
    multiple_choice_count = count + 1; // Ensure multiple_choice_count is updated
}

function takeReview(){
    if (multiple_choice_count > 1){
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