let currentMix = 1;
const mixed = JSON.parse(document.getElementById("data-json").textContent);
const totalMixed = parseInt(document.getElementById("data-length").textContent, 10);

// Update mix display (show/hide based on currentMix)
function updateMixDisplay() {
    // Hide all mixes
    document.querySelectorAll('.mix').forEach((mix) => {
        mix.style.display = 'none';
    });

    // Show the current mix
    document.getElementById(`mix-${currentMix}`).style.display = 'block';

    // Update the counter display
    document.getElementById('current-count').textContent = currentMix;

    // Update button states
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');

    prevButton.disabled = currentMix === 1;
    nextButton.disabled = currentMix > totalMixed;
}

// Function to navigate to the next mix or finish
function showNextMix() {
    if (currentMix < totalMixed) {
        currentMix++;
        updateMixDisplay();
    } else {
        let correct = 0;
        let mistake = 0;
        let missing = 0;

        // Gather user answers
        let userAnswers = {};
        let correctAnswers = {};
        //For Identification
        document.querySelectorAll('.answer-text').forEach(answer => {
            const answerNumber = parseInt(answer.getAttribute('data-num')) - 1;
            const correct_answer = mixed[answerNumber].answer[0][0];

            correctAnswers[answerNumber] = correct_answer;
            if (answer.value.trim().toLowerCase() === ""){
                missing++;
            } else if (answer.value.trim().toLowerCase() === correct_answer.trim().toLowerCase()) {
                correct++;
            } else {
                mistake++;
            }

            userAnswers[answerNumber] = answer.value;
        });
        
        for (let i = 0; i <= totalMixed; i++){
            const user_choice = document.getElementsByName(`options-${i}`);
            if (user_choice.length > 0){
                let user_selected = null;

                user_choice.forEach((option, mindex) => {
                    if(parseInt(option.value) === 1){
                        correctAnswers[i - 1] = option.getAttribute('data-text');
                    }
                    if (option.checked){
                        userAnswers[i - 1] = option.getAttribute('data-text');
                        user_selected = mindex;

                        if (parseInt(option.value) === 1){
                            correct++;
                        }
                        if (parseInt(option.value) === 0){
                            mistake++;
                        }
                    }
                });

                if (user_selected === null){
                    missing++;
                    userAnswers[i - 1] = null;
                }
            }
        }
        
        // Save data to local storage
        localStorage.setItem('score', correct);
        localStorage.setItem('mistakes', mistake);
        localStorage.setItem('missing', missing);
        localStorage.setItem('mixed', JSON.stringify(mixed));
        localStorage.setItem('correctAnswers', JSON.stringify(correctAnswers));
        localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
        
        // Redirect to the congrats page
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

function removeChosen(index) {
    const selected = document.querySelector(`input[name='options-${parseInt(index)}']:checked`);
    if (selected) selected.checked = false;
}
