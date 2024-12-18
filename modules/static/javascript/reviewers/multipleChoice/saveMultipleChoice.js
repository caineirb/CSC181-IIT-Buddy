function handleGoBack() {
    Swal.fire({
        title: "Do you want to save the changes before going back?",
        icon: "question",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Yes",
        denyButtonText: `Don't save`
    }).then((result) => {
        const nextUrl = "/";  // The URL to redirect to after saving
        if (result.isConfirmed) {
            sendmultiple_choiceToBackend(nextUrl);
        } else if (result.isDenied) {
            window.location.href = nextUrl;
        }
    });
}

function sendmultiple_choiceToBackend(next_url = null) {
    const formData = new FormData();
    const csrfToken = document.getElementById("_token_csrf").value;
    const smixedURL = document.getElementById("save_mix_url").value;
    const reviewerId = document.getElementById("reviewer-id").value;
    const isRandomize = document.getElementById('shuffle-switch').checked;

    formData.append("csrf_token", csrfToken);
    formData.append("id", reviewerId);
    formData.append("isRandom", isRandomize);

    let validmixCount = 0;
    let hasIncompletemixed = false;

    document.querySelectorAll('.mul').forEach(mul => {
        const type = mul.querySelector('.question-type');
        const dataNumber = mul.getAttribute('data-number');
        const optionInputs = mul.querySelectorAll('.option-input');
        const optionCheckboxes = mul.querySelectorAll('.correct-answer-checkbox');
        const questions = mul.querySelector('.definition-input');
        const imageInput = mul.querySelector(`input[type="file"]`);
        const base64ImageInput = document.getElementById(`mul-image-base64-${dataNumber}`);
        
        let correct_answer = null;

        if (!questions.value.trim()) {
            questions.style.borderColor = "red";
            hasIncompletemixed = true;
        } else {
            questions.style.borderColor = "";
        }

        // Check if all options have inputs
        optionInputs.forEach((input, optionIndex) => {
            if (!input.value.trim() || input.value.trim() === "") {
                input.style.borderColor = "red";
                hasIncompletemixed = true;
            }
            else input.style.borderColor = "";
        });

        // Check if there is selected
        optionCheckboxes.forEach((checkbox, optionIndex) => {
            if (checkbox.checked){
                correct_answer = checkbox.value;
            } 
        });

        if (correct_answer === null){
            optionInputs.forEach((input, optionIndex) => {
                input.style.borderColor = "red";
            });
            hasIncompletemixed = true;
        } else {
            if (!hasIncompletemixed){
                formData.append(`multiple_choice[${dataNumber}][question]`, questions.value.trim());
                formData.append(`multiple_choice[${dataNumber}][dataNumber]`, dataNumber);

                if (imageInput && imageInput.files[0]) {
                    formData.append(`multiple_choice[${dataNumber}][image]`, imageInput.files[0]);
                } else if (base64ImageInput && base64ImageInput.value) {
                    formData.append(`multiple_choice[${dataNumber}][image_base64]`, base64ImageInput.value);
                }
                
                optionInputs.forEach((input, optionIndex) => {
                    input.style.borderColor = "";
                    if (optionIndex === parseInt(correct_answer)){
                        formData.append(`multiple_choice[${dataNumber}][correct_answer]`, input.value.trim());
                    } else {
                        formData.append(`multiple_choice[${dataNumber}][incorrect_answer]`, input.value.trim());
                    }
                });
                
                validmixCount++;
            }
        }
    });

    if (hasIncompletemixed) {
        Swal.fire({
            title: "Incomplete Questions Detected.",
            text: "Complete every Answer and Question pair first before playing.",
            icon: "warning"
          });
    } else if (validmixCount > 0 || next_url) {
        formData.append("multi_count", validmixCount);
        console.log(formData);
        fetch(smixedURL, {
            method: 'PUT',
            headers: {
                'X-CSRF-Token': csrfToken
            },
            body: formData
        })
        .then(response => response.json())
        .then(responseData => {
            if (next_url) {
                window.location.href = next_url;
            } else if (responseData.redirect_url) {
                window.location.href = responseData.redirect_url;
            }
        })
        .catch(error => {
            console.error('Error saving mixed:', error);
        });
    } else {
        console.log('No valid mixed to save.');
    }
}
