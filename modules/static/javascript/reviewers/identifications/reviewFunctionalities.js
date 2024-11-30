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
        // Redirect to the "congrats" page when finished
        // window.location.href = document.getElementById("congrats-url").value;
        let userAnswers = [];
        document.querySelectorAll('.answer-text').forEach((answer) => {
            userAnswers.push(answer.value);
        })
        let correct = 0;
        let mistake = 0;
        let missing = 0;
        
        identifications.forEach((identification, index) => {
            const userAnswer = userAnswers[index]; 
            const correctAnswer = identification['answer']; 
            const question = identification['question']; 
            
            if (userAnswer.trim() === correctAnswer) correct++;
            else if (userAnswer.trim() !== '') missing++;
            else mistake++;
            console.log(`Question: ${question}`);
            console.log(`Correct Answer: ${correctAnswer}`);
            console.log(`Your Answer: ${userAnswer}`);
        });
    }
}

// Function to navigate to the previous identification
function showPreviousIdentification() {
    if (currentIdentification > 1) {
        currentIdentification--;
        updateIdentificationDisplay();
    }
}

function showReviewPage() {
    const resultsSection = document.querySelector('.results');
    
    const existingRows = resultsSection.querySelectorAll('.table-row');
    existingRows.forEach(row => row.remove());

    identifications['cards'].forEach((identification, index) => {
        const userAnswer = userAnswers[index] || 'No answer provided';
        const correctAnswer = identification['correct_answer'];

        const tableRow = document.createElement('div');
        tableRow.classList.add('table-row');

        tableRow.innerHTML = `
            <div class="table-column">${identification['question']}</div>
            <div class="table-column">${correctAnswer}</div>
            <div class="table-column">${userAnswer}</div>
        `;
        
        resultsSection.appendChild(tableRow);
    });

    document.querySelector('.identifications-container').style.display = 'none';
    resultsSection.style.display = 'block';
}

// Initial display
updateIdentificationDisplay();
