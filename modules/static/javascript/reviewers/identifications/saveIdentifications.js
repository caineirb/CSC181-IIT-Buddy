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
            sendFlashcardsToBackend(nextUrl);
        } else if (result.isDenied) {
            window.location.href = nextUrl;
        }
    });
}