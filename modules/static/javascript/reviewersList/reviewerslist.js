document.addEventListener('DOMContentLoaded', function () {
    // Check if there's an error message and open the modal if true
    if (document.querySelector('.alert-danger')) {
    var createReviewerModal = new bootstrap.Modal(document.getElementById('exampleModal2'), {});
    createReviewerModal.show();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // Elements
    const dropdownList = document.getElementById("list");
    const input = document.getElementById("search_input");

    // Handle dropdown change event
    dropdownList.addEventListener("change", function() {
        const selectedField = dropdownList.options[dropdownList.selectedIndex].getAttribute("data-field");

        // Update search input placeholder based on selected option
        input.placeholder = selectedField === "All" ? "Search here..." : `Search in ${selectedField}...`;
    });
});
