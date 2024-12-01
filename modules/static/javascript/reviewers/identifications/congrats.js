document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paper-confetti');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiParticles = [];

    function generateConfetti() {
        for (let i = 0; i < 10; i++) {
            const size = Math.random() * 10 + 10;
            const xPos = Math.random() * canvas.width;
            const yPos = -size;
            const speed = Math.random() * 4 + 2;
            const rotationSpeed = Math.random() * 2 + 1;
            const drift = Math.random() * 4 - 2;
            const shape = Math.random() > 0.5 ? 'rect' : 'circle';
            const color = `hsl(${Math.random() * 360}, 100%, ${Math.random() * 50 + 40}%)`;

            confettiParticles.push({
                size,
                xPos,
                yPos,
                speed,
                rotation: Math.random() * 360,
                rotationSpeed,
                drift,
                shape,
                color,
                gravity: Math.random() * 0.3 + 0.2,
                life: Math.random() * 80 + 80,
            });
        }
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        confettiParticles.forEach((particle, index) => {
            ctx.save();
            ctx.translate(particle.xPos + particle.drift, particle.yPos);
            ctx.rotate(particle.rotation * Math.PI / 180);
            ctx.fillStyle = particle.color;

            if (particle.shape === 'rect') {
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            } else if (particle.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();

            particle.speed += particle.gravity;
            particle.yPos += particle.speed;
            particle.rotation += particle.rotationSpeed;
            particle.drift *= 0.98;
            particle.life -= 1;

            if (particle.life <= 0 || particle.yPos > canvas.height) {
                confettiParticles.splice(index, 1);
            }
        });

        requestAnimationFrame(animateConfetti);
    }

    function startConfetti() {
        const confettiInterval = setInterval(generateConfetti, 100);
        animateConfetti();

        const confettiDuration = 5000;
        setTimeout(() => {
            clearInterval(confettiInterval);
        }, confettiDuration);
    }

    startConfetti();
});


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
                    row.style.backgroundColor = "#e2e3e5";
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
        console.warn("No data found in localStorage.");
    }
};
