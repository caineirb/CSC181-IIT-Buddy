function deleteCard(){
    const csrfToken = document.getElementById("_token_csrf").value;
    const deleteURL = document.getElementById("deleteURL").value;
    const reviewerId = document.getElementById("reviewer-id").value;
    const reviewerName = document.getElementById("reviewer-title").value;

    Swal.fire({
        title: "Are you sure you want to delete this flashcard?",
        text: "Once deleted, it can never be recovered.",
        icon: "warning",
        showCancelButton: true
    }).then((willDelete) => {
        if (willDelete.isConfirmed){
            fetch(deleteURL, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify({'reviewerId': reviewerId})
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(responseData => {
                console.log(responseData)
                Swal.fire({
                    text:  `Reviewer ${reviewerName} has been deleted successfully.`,
                    icon: "success"
                }).then(() => {
                    window.location.href = "/";
                });
            })
            .catch(error => {
                console.error('Error updating:', error);
            });
        } else {
            Swal.fire({
                text: "Reviewer deletion is cancelled."
            });
        }
    });
}