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
            sendmixedToBackend(nextUrl);
        } else if (result.isDenied) {
            window.location.href = nextUrl;
        }
    });
}

function sendmixedToBackend(next_url = null) {
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

    document.querySelectorAll('.mix').forEach(mix => {
        const type = mix.querySelector('.question-type');
        const dataNumber = mix.getAttribute('data-number');
        const idenAnswer = mix.querySelector('.term-input');
        const optionInputs = mix.querySelectorAll('.option-input');
        const optionCheckboxes = mix.querySelectorAll('.correct-answer-checkbox');
        const questions = mix.querySelector('.definition-input');
        const imageInput = mix.querySelector(`input[type="file"]`);
        const base64ImageInput = document.getElementById(`mix-image-base64-${dataNumber}`);
        console.log(type.value);
        if (type.value === "Identification"){
            if (idenAnswer.value.trim() && questions.value.trim()) {
                validmixCount++;
                idenAnswer.style.borderColor = "";
                questions.style.borderColor = "";
    
                formData.append(`mixed[${dataNumber}][correct_answer]`, idenAnswer.value.trim());
                formData.append(`mixed[${dataNumber}][question]`, questions.value.trim());
                formData.append(`mixed[${dataNumber}][dataNumber]`, dataNumber);
                formData.append(`mixed[${dataNumber}][item_type]`, type.value);

                if (imageInput && imageInput.files[0]) {
                    formData.append(`mixed[${dataNumber}][image]`, imageInput.files[0]);
                } else if (base64ImageInput && base64ImageInput.value) {
                    formData.append(`mixed[${dataNumber}][image_base64]`, base64ImageInput.value);
                }
            } else {
                hasIncompletemixed = true;
                if (!idenAnswer.value.trim()) idenAnswer.style.borderColor = "red";
                if (!questions.value.trim()) questions.style.borderColor = "red";
            }
        } else {
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
                    formData.append(`mixed[${dataNumber}][question]`, questions.value.trim());
                    formData.append(`mixed[${dataNumber}][dataNumber]`, dataNumber);
                    formData.append(`mixed[${dataNumber}][item_type]`, type.value);

                    if (imageInput && imageInput.files[0]) {
                        formData.append(`mixed[${dataNumber}][image]`, imageInput.files[0]);
                    } else if (base64ImageInput && base64ImageInput.value) {
                        formData.append(`mixed[${dataNumber}][image_base64]`, base64ImageInput.value);
                    }

                    optionInputs.forEach((input, optionIndex) => {
                        input.style.borderColor = "";
                        if (optionIndex === parseInt(correct_answer)){
                            formData.append(`mixed[${dataNumber}][correct_answer]`, input.value.trim());
                        } else {
                            formData.append(`mixed[${dataNumber}][incorrect_answer]`, input.value.trim());
                        }
                    });
                    validmixCount++;
                }
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
        formData.append("mixed_count", validmixCount);
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
