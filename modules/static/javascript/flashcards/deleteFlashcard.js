function deleteCard(){
    const csrfToken = document.getElementById("_token_csrf").value;
    const deleteURL = document.getElementById("deleteURL").value;
    const reviewerId = document.getElementById("reviewer-id").value;

    if (confirm('Are you sure you want to delete this flashcard?')) {
        fetch(deleteURL, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({'reviewerId': reviewerId})
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(responseData => {
            window.location.href = "/";
        })
        .catch(error => {
            console.error('Error updating:', error);
        });
    }
}