function handleCredentialResponse(response) {
    const studentURL = document.getElementById("login-url").value;
    const csrfToken = document.getElementById("_csrf_token").value;
    const jwtToken = response.credential;  // The raw JWT token

    fetch(studentURL, {
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken
        },
        method: "POST",
        body: JSON.stringify({ 'token': jwtToken })  // Send the token to Flask
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        if (data.redirect_url) {
            window.location.href = data.redirect_url;  // Redirect if provided by backend
        }
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
    });
}