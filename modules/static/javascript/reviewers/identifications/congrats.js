document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paper-confetti');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiParticles = [];

    function generateConfetti() {
        for (let i = 0; i < 5; i++) { 
            const size = Math.random() * 10 + 10;
            const xPos = Math.random() * canvas.width;
            const yPos = -size;
            const speed = Math.random() * 3 + 2;
            const rotationSpeed = Math.random() * 2 + 1;
            const drift = Math.random() * 2 - 1;
            const color = `hsl(${Math.random() * 360}, 100%, 75%)`;

            confettiParticles.push({
                size,
                xPos,
                yPos,
                speed,
                rotation: Math.random() * 360,
                rotationSpeed,
                drift,
                color
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
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            ctx.restore();

            particle.yPos += particle.speed;
            particle.rotation += particle.rotationSpeed;

            if (particle.yPos > canvas.height) {
                confettiParticles.splice(index, 1);
            }
        });

        requestAnimationFrame(animateConfetti);
    }

    setInterval(generateConfetti, 100);
    animateConfetti();
});
