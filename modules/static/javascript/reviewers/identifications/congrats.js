// fetch data questions, correct answer, and user answer
window.onload = function () {
    // retrieve data from localStorage
    const correct = localStorage.getItem('score');
    const mistake = localStorage.getItem('mistakes');
    const missing = localStorage.getItem('missing');
    const identifications = JSON.parse(localStorage.getItem('identifications')) || [];
    const userAnswers = JSON.parse(localStorage.getItem('userAnswers')) || [];

    const resultsContainer = document.querySelector('.results');

    if (identifications.length && userAnswers.length) {
        identifications.forEach((identification, index) => {
            const userAnswer = (userAnswers[index]?.trim() || "No Answer").toLowerCase();
            const correctAnswer = identification['answer'].trim().toLowerCase();

            const row = document.createElement('div');
            row.classList.add('table-row');

            // coloring book background hoo
            row.addEventListener('mouseover', function() {
                if (userAnswer === correctAnswer) {
                    row.style.backgroundColor = "#c3e6cb";
                } else if (userAnswer === "no answer") {
                    row.style.backgroundColor = "#f8f9fa";
                } else {
                    row.style.backgroundColor = "#f1c6c1";
                }
            });

            row.addEventListener('mouseout', function() {
                row.style.backgroundColor = "white";
            });

            const questionCell = document.createElement('div');
            questionCell.classList.add('table-column');
            questionCell.textContent = identification['question'];

            // Check if there is an image associated with the question
            if (identification['image']) {
                const qimage = document.createElement("img");
                console.log("Blob received:", identification['image']);

                qimage.setAttribute('src', `data:image/jpeg;base64,${identification['image']}`);
                qimage.setAttribute('height', '150px');
                qimage.setAttribute('width', '150px');
                qimage.setAttribute('alt', `Question ${index + 1}`);
                qimage.style.display = 'block';

                // Append image to question cell
                questionCell.appendChild(qimage);
            } else {
                console.log(`No image provided for Question ${index + 1}`);
            }

            const correctAnswerCell = document.createElement('div');
            correctAnswerCell.classList.add('table-column');
            correctAnswerCell.textContent = identification['answer'];

            const userAnswerCell = document.createElement('div');
            userAnswerCell.classList.add('table-column');
            userAnswerCell.textContent = userAnswers[index]?.trim() || "No Answer";

            row.appendChild(questionCell);
            row.appendChild(correctAnswerCell);
            row.appendChild(userAnswerCell);

            if (userAnswer === correctAnswer) {
                userAnswerCell.style.color = '#155724';
            } else if (userAnswer === "no answer") {
                userAnswerCell.style.color = '#e2e3e5';
            } else {
                userAnswerCell.style.color = '#721c24';
            }

            resultsContainer.appendChild(row);
        });

        const scoreDisplay = document.querySelector('#user-score');
        const mistakesDisplay = document.querySelector('#user-mistakes');
        const unansweredDisplay = document.querySelector('#user-unanswered');

        scoreDisplay.textContent = correct || 0;
        mistakesDisplay.textContent = mistake || 0;
        unansweredDisplay.textContent = missing || 0;

        // clear data from localStorage after rendering
        localStorage.removeItem('score');
        localStorage.removeItem('mistakes');
        localStorage.removeItem('missing');
        localStorage.removeItem('identifications');
        localStorage.removeItem('userAnswers');
    } else {
        const review = document.createElement('div');
        review.textContent = "No data to review. Go back to answering, and avoid refreshing the page. Thank you."
        review.style = "margin: 0 auto";
        
        resultsContainer.appendChild(review);
        console.warn("No data found in localStorage.");
    }
};
