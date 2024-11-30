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
                color,
                gravity: Math.random() * 0.1 + 0.1,
                life: Math.random() * 50 + 50,
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

            particle.speed += particle.gravity;

            particle.yPos += particle.speed;
            particle.rotation += particle.rotationSpeed;

            particle.drift *= 0.99;

            particle.life -= 1;
            if (particle.life <= 0 || particle.yPos > canvas.height) {
                confettiParticles.splice(index, 1); 
            }
        });

        requestAnimationFrame(animateConfetti);
    }

    const confettiInterval = setInterval(generateConfetti, 100);
    animateConfetti();

    const confettiDuration = 5000;
    setTimeout(() => {
        clearInterval(confettiInterval);
    }, confettiDuration);
});