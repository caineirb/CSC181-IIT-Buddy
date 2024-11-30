let currentIdentification = 1;
const identifications = JSON.parse(document.getElementById("data-json").textContent);
const totalIdentifications = document.getElementById("data-length").textContent;

// Update identification display (show/hide based on currentIdentification)
function updateIdentificationDisplay() {
    // Hide all identifications
    document.querySelectorAll('.identification').forEach((identification) => {
        identification.style.display = 'none';
    });

    // Show the current identification
    document.getElementById(`identification-${currentIdentification}`).style.display = 'block';

    // Update the counter display
    document.getElementById('current-count').textContent = currentIdentification;

    // Update button states and text
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    prevButton.disabled = currentIdentification === 1;
}

// Function to navigate to the next identification or finish
function showNextIdentification() {
    if (currentIdentification < totalIdentifications) {
        currentIdentification++;
        updateIdentificationDisplay();
    } else {
        // Gather user answers
        let userAnswers = [];
        document.querySelectorAll('.answer-text').forEach((answer) => {
            userAnswers.push(answer.value);
        });

        let correct = 0;
        let mistake = 0;
        let missing = 0;

        identifications.forEach((identification, index) => {
            const userAnswer = userAnswers[index]?.trim().toLowerCase() || "";
            const correctAnswer = identification['answer'].trim().toLowerCase();

            if (userAnswer === correctAnswer) {
                correct++;
            } else if (userAnswer === "") {
                missing++;
            } else {
                mistake++;
            }
        });

        localStorage.setItem('score', correct);
        localStorage.setItem('mistakes', mistake);
        localStorage.setItem('missing', missing);
        localStorage.setItem('identifications', JSON.stringify(identifications));
        localStorage.setItem('userAnswers', JSON.stringify(userAnswers));

        // Redirect to the congrats page
        window.location.href = document.getElementById("congrats-url").value;
    }
}

// Function to navigate to the previous identification
function showPreviousIdentification() {
    if (currentIdentification > 1) {
        currentIdentification--;
        updateIdentificationDisplay();
    }
}

// Initial display
updateIdentificationDisplay();

// let userAnswers = [];
        // document.querySelectorAll('.answer-text').forEach((answer) => {
        //     userAnswers.push(answer.value);
        // });
        // let correct = 0;
        // let mistake = 0;
        // let missing = 0;

        // identifications.forEach((identification, index) => {
        //     const userAnswer = userAnswers[index]?.trim().toLowerCase() || "";
        //     const correctAnswer = identification['answer'].trim().toLowerCase();
        //     const question = identification['question'];

        //     if (userAnswer === correctAnswer) {
        //         correct++;
        //     } else if (userAnswer === "") {
        //         missing++;
        //     } else {
        //         mistake++;
        //     }

        //     console.log(`Question: ${question}`);
        //     console.log(`Correct Answer: ${identification['answer']}`);
        //     console.log(`Your Answer: ${userAnswers[index]}`);
        // });
        // console.log(`Score: ${correct}`);
        // console.log(`Mistakes: ${mistake}`);
        // console.log(`Unanswered: ${missing}`);