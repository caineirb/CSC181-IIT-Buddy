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
                <div class="ms-5 dropdowns">
                    <div class="d-flex">
                        <select name="question-type" id="question-type" class="form-select" style="max-width: 200px; color: black; transform: translate(100px, -145px);" disabled>
                            <option value="Identification" selected>Identification</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="identification-content">
            <div class="input-container">
                <textarea class="term-input" name="term-${count}" placeholder="Enter term" maxlength="150" readonly>${identificationData.answer}</textarea>
                <label class="input-label">ANSWER</label>
            </div>
            <div class="input-container">
                <textarea class="definition-input" name="definition-${count}" placeholder="Enter definition" maxlength="255" readonly>${identificationData.question}</textarea>
                <label class="input-label">QUESTION</label>
            </div>
            <input type="file" name="identification-image-${count}" id="identification-image-${count}" style="display: none;" accept="image/*" onchange="previewImage(event, ${count})" disabled>
            <input type="hidden" id="identification-image-base64-${count}" value="${imageUrl}">
            <label for="identification-image-${count}" class="image-button" style="${imageUrl ? 'background-image: url(' + imageUrl + '); background-size: cover;' : ''}">
                <span class="button-label" ${imageUrl ? 'style="display: none;"' : ''}>IMAGE</span>
            </label>
        </div>
    `;

    identificationContainer.appendChild(newidentification);
    identificationCount = count + 1;
}

function takeReview(){
    if (identificationCount > 1){
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