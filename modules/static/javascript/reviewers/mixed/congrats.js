// Fetch data questions, correct answer, and user answer
window.onload = function () {
    // Retrieve data from localStorage
    const correct = localStorage.getItem('score');
    const mistake = localStorage.getItem('mistakes');
    const missing = localStorage.getItem('missing');
    const mixed = JSON.parse(localStorage.getItem('mixed')) || {};
    const correctAnswers = JSON.parse(localStorage.getItem('correctAnswers')) || {};
    const userAnswers = JSON.parse(localStorage.getItem('userAnswers')) || {};
    const resultsContainer = document.querySelector('.results');

    if (Object.keys(mixed).length > 0) {
        mixed.forEach((mix, index) => {
            const userKey = Object.keys(userAnswers)[index];
            const correctKey = Object.keys(correctAnswers)[index];
            const userAnswer = (userAnswers[userKey]?.trim() || "No Answer").toLowerCase();
            const correctAnswer = correctAnswers[correctKey].trim().toLowerCase();

            const row = document.createElement('div');
            row.classList.add('table-row');

            // Add background color on hover
            row.addEventListener('mouseover', function () {
                if (userAnswer === correctAnswer) {
                    row.style.backgroundColor = "#c3e6cb"; // Correct
                } else if (userAnswer === "no answer") {
                    row.style.backgroundColor = "#f8f9fa"; // Missing
                } else {
                    row.style.backgroundColor = "#f1c6c1"; // Incorrect
                }
            });

            row.addEventListener('mouseout', function () {
                row.style.backgroundColor = "white"; // Reset
            });

            // Question Column
            const questionCell = document.createElement('div');
            questionCell.classList.add('table-column');
            questionCell.textContent = mix.question;

            // Add image if available
            if (mix.image) {
                const qImage = document.createElement("img");
                qImage.setAttribute('src', `data:image/jpeg;base64,${mix.image}`);
                qImage.setAttribute('height', '150px');
                qImage.setAttribute('width', '150px');
                qImage.setAttribute('alt', `Question ${index + 1}`);
                qImage.style.display = 'block';

                questionCell.appendChild(qImage);
            }

            // Correct Answer Column
            const correctAnswerCell = document.createElement('div');
            correctAnswerCell.classList.add('table-column');
            correctAnswerCell.textContent = correctAnswers[correctKey];; // Display all possible answers

            // User Answer Column
            const userAnswerCell = document.createElement('div');
            userAnswerCell.classList.add('table-column');
            userAnswerCell.textContent = userAnswers[userKey] || "No Answer";

            // Apply color based on correctness
            if (userAnswer === correctAnswer) {
                userAnswerCell.style.color = '#155724'; // Green for correct
            } else if (userAnswer === "no answer") {
                userAnswerCell.style.color = '#e2e3e5'; // Gray for missing
            } else {
                userAnswerCell.style.color = '#721c24'; // Red for incorrect
            }

            row.appendChild(questionCell);
            row.appendChild(correctAnswerCell);
            row.appendChild(userAnswerCell);

            resultsContainer.appendChild(row);
        });

        // Display summary scores
        document.querySelector('#user-score').textContent = correct || 0;
        document.querySelector('#user-mistakes').textContent = mistake || 0;
        document.querySelector('#user-unanswered').textContent = missing || 0;

        // Clear data from localStorage after rendering
        localStorage.removeItem('score');
        localStorage.removeItem('mistakes');
        localStorage.removeItem('missing');
        localStorage.removeItem('mixed');
        localStorage.removeItem('correctAnswers');
        localStorage.removeItem('userAnswers');
    } else {
        // Show message if no data is available
        const review = document.createElement('div');
        review.textContent = "No data to review. Go back to answering, and avoid refreshing the page. Thank you.";
        review.style = "margin: 0 auto; text-align: center;";
        
        resultsContainer.appendChild(review);
        console.warn("No data found in localStorage.");
    }
};
