function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

function handleCredentialResponse(response) {
    // Decode the ID token
    const userData = parseJwt(response.credential);
    
    const studentURL = document.getElementById("login-url").value;
    const csrfToken = document.getElementById("_csrf_token").value;
    const student = {
        'id': `${userData.sub}`,
        'name': `${userData.name}`,
        'email': `${userData.email}`
    }
    
    fetch(studentURL,{
        headers: { 
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
        method: "POST",
        body: JSON.stringify(student),
    })
    .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
    })
    .then(data => {
        if (data.redirect_url) {
            window.location.href = data.redirect_url;  // Redirects to the new template
        }
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
    });
}