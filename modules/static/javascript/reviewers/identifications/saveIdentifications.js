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
            sendidentificationsToBackend(nextUrl);
        } else if (result.isDenied) {
            window.location.href = nextUrl;
        }
    });
}

function sendidentificationsToBackend(next_url = null) {
    const formData = new FormData();
    const csrfToken = document.getElementById("_token_csrf").value;
    const sidentificationUrl = document.getElementById("save_identification_url").value;
    const reviewerId = document.getElementById("reviewer-id").value;
    const isRandomize = document.getElementById('shuffle-switch').checked;

    formData.append("csrf_token", csrfToken);
    formData.append("id", reviewerId);
    formData.append("isRandom", isRandomize);

    let valididentificationCount = 0;
    let hasIncompleteidentifications = false;

    document.querySelectorAll('.identification').forEach(identification => {
        const dataNumber = identification.getAttribute('data-number');
        const term = identification.querySelector('.term-input');
        const definition = identification.querySelector('.definition-input');
        const imageInput = identification.querySelector(`input[type="file"]`);
        const base64ImageInput = document.getElementById(`identification-image-base64-${dataNumber}`);

        if (term.value.trim() && definition.value.trim()) {
            valididentificationCount++;
            term.style.borderColor = "";
            definition.style.borderColor = "";

            formData.append(`identifications[${dataNumber}][term]`, term.value.trim());
            formData.append(`identifications[${dataNumber}][definition]`, definition.value.trim());
            formData.append(`identifications[${dataNumber}][dataNumber]`, dataNumber);

            if (imageInput && imageInput.files[0]) {
                formData.append(`identifications[${dataNumber}][image]`, imageInput.files[0]);
            } else if (base64ImageInput && base64ImageInput.value) {
                formData.append(`identifications[${dataNumber}][image_base64]`, base64ImageInput.value);
            }
        } else {
            hasIncompleteidentifications = true;
            if (!term.value.trim()) term.style.borderColor = "red";
            if (!definition.value.trim()) definition.style.borderColor = "red";
        }
    });

    if (hasIncompleteidentifications) {
        Swal.fire({
            title: "Incomplete Questions Detected.",
            text: "Complete every Answer and Question pair first before playing.",
            icon: "warning"
          });
    } else if (valididentificationCount > 0 || next_url) {
        formData.append("identification_count", valididentificationCount);
        fetch(sidentificationUrl, {
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
            console.error('Error saving identifications:', error);
        });
    } else {
        console.log('No valid identifications to save.');
    }
}
