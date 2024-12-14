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
        const dataNumber = mix.getAttribute('data-number');
        const term = mix.querySelector('.term-input');
        const definition = mix.querySelector('.definition-input');
        const imageInput = mix.querySelector(`input[type="file"]`);
        const base64ImageInput = document.getElementById(`mix-image-base64-${dataNumber}`);

        if (term.value.trim() && definition.value.trim()) {
            validmixCount++;
            term.style.borderColor = "";
            definition.style.borderColor = "";

            formData.append(`mixed[${dataNumber}][term]`, term.value.trim());
            formData.append(`mixed[${dataNumber}][definition]`, definition.value.trim());
            formData.append(`mixed[${dataNumber}][dataNumber]`, dataNumber);

            if (imageInput && imageInput.files[0]) {
                formData.append(`mixed[${dataNumber}][image]`, imageInput.files[0]);
            } else if (base64ImageInput && base64ImageInput.value) {
                formData.append(`mixed[${dataNumber}][image_base64]`, base64ImageInput.value);
            }
        } else {
            hasIncompletemixed = true;
            if (!term.value.trim()) term.style.borderColor = "red";
            if (!definition.value.trim()) definition.style.borderColor = "red";
        }
    });

    if (hasIncompletemixed) {
        Swal.fire({
            title: "Incomplete Questions Detected.",
            text: "Complete every Answer and Question pair first before playing.",
            icon: "warning"
          });
    } else if (validmixCount > 0) {
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
