let currentMix = 1;
const mixed = JSON.parse(document.getElementById("data-json").textContent);
const totalMixed = document.getElementById("data-length").textContent;

// Update mix display (show/hide based on currentMix)
function updateMixDisplay() {
    // Hide all mixed
    document.querySelectorAll('.mix').forEach((mix) => {
        mix.style.display = 'none';
    });

    // Show the current mix
    document.getElementById(`mix-${currentMix}`).style.display = 'block';

    // Update the counter display
    document.getElementById('current-count').textContent = currentMix;

    // Update button states and text
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    prevButton.disabled = currentMix === 1;
}

// Function to navigate to the next mix or finish
function showNextMix() {
    if (currentMix < totalMixed) {
        currentMix++;
        updateMixDisplay();
    } else {
        // Gather user answers
        let userAnswers = [];
        document.querySelectorAll('.answer-text').forEach((answer) => {
            userAnswers.push(answer.value);
        });

        let correct = 0;
        let mistake = 0;
        let missing = 0;
        console.log(mixed)
        mixed.forEach((mix, index) => {
            const userAnswer = userAnswers[index]?.trim().toLowerCase() || "";
            const correctAnswer = mix['answer'][0][0].trim().toLowerCase();

            if (userAnswer === correctAnswer) {
                correct++;
            } else if (userAnswer === "") {
                missing++;
            } else {
                mistake++;
            }
        });

        // save data to local storage
        localStorage.setItem('score', correct);
        localStorage.setItem('mistakes', mistake);
        localStorage.setItem('missing', missing);
        localStorage.setItem('mixed', JSON.stringify(mixed));
        localStorage.setItem('userAnswers', JSON.stringify(userAnswers));

        // redirect to the congrats page
        window.location.href = document.getElementById("congrats-url").value;
    }
}

// Function to navigate to the previous mix
function showPreviousMix() {
    if (currentMix > 1) {
        currentMix--;
        updateMixDisplay();
    }
}

// Initial display
updateMixDisplay();