let currentMix = 1;
const multi = JSON.parse(document.getElementById("data-json").textContent);
const totalMixed = parseInt(document.getElementById("data-length").textContent, 10);

// Update mul display (show/hide based on currentMix)
function updateMixDisplay() {
    // Hide all mules
    document.querySelectorAll('.mul').forEach((mul) => {
        mul.style.display = 'none';
    });

    // Show the current mul
    document.getElementById(`mul-${currentMix}`).style.display = 'block';

    // Update the counter display
    document.getElementById('current-count').textContent = currentMix;

    // Update button states
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');

    prevButton.disabled = currentMix === 1;
    nextButton.disabled = currentMix > totalMixed;
}

// Function to navigate to the next mul or finish
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
        
        for (let i = 0; i <= totalMixed; i++){
            const user_choice = document.getElementsByName(`options-${i}`);
            if (user_choice.length > 0){
                let user_selected = null;

                user_choice.forEach((option, mindex) => {
                    if(parseInt(option.value) === 1){
                        correctAnswers[i] = option.getAttribute('data-text');
                    }
                    if (option.checked){
                        userAnswers[i] = option.getAttribute('data-text');
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
                    userAnswers[i] = null;
                    missing++;
                }
            }
        }
        
        // Save data to local storage
        localStorage.setItem('score', correct);
        localStorage.setItem('mistakes', mistake);
        localStorage.setItem('missing', missing);
        localStorage.setItem('multi', JSON.stringify(multi));
        localStorage.setItem('correctAnswers', JSON.stringify(correctAnswers));
        localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
        console.log(userAnswers);
        // Redirect to the congrats page
        window.location.href = document.getElementById("congrats-url").value;
    }
}

// Function to navigate to the previous mul
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
