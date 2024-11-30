let currentidentification = 1;
const identifications = JSON.parse(document.getElementById("data-json").textContent);
const totalidentifications = document.getElementById("data-length").textContent;

// Update identification display (show/hide based on currentidentification)
function updateidentificationDisplay() {
    // Hide all identifications
    document.querySelectorAll('.identification').forEach((identification) => {
        identification.style.display = 'none';
    });

    // Show the current identification
    document.getElementById(`identification-${currentidentification}`).style.display = 'block';

    // Update the counter display
    document.getElementById('current-count').textContent = currentidentification;

    // Update button states and text
    const prevButton = document.getElementById('prev-btn');
    prevButton.disabled = currentidentification === 1;
}

// Function to navigate to the next identification or finish
function showNextidentification() {
    if (currentidentification < totalidentifications) {
        currentidentification++;
        updateidentificationDisplay();
    } else {
        // Redirect to the "congrats" page when finished
        window.location.href = document.getElementById("congrats-url").value;
    }
}

// Function to navigate to the previous identification
function showPreviousidentification() {
    if (currentidentification > 1) {
        currentidentification--;
        updateidentificationDisplay();
    }
}

// Initial display
updateidentificationDisplay();
