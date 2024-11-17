document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('congrats-confetti');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // mao ni mga icon or confettis
    const icons = ['🎉', '✨', '💥', '🌟', '🎊'];
    const confettiParticles = [];

    // diri mag kuan, generate random confetti particles
    function generateConfetti() {
        const icon = icons[Math.floor(Math.random() * icons.length)];
        const size = Math.random() * 20 + 20;
        const xPos = Math.random() * canvas.width;
        const yPos = -size; // since confetti mn, mo fall siya from the top
        const speed = Math.random() * 5 + 2; // speed nis pagkahulog ish

        confettiParticles.push({
            icon,
            size,
            xPos,
            yPos,
            speed,
            rotation: Math.random() * 360
        });
    }

    // animate confetti kadtong emojies particle
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confettiParticles.forEach((particle, index) => {

            ctx.save();
            ctx.translate(particle.xPos, particle.yPos);
            ctx.rotate(particle.rotation * Math.PI / 180);
            ctx.font = `${particle.size}px Arial`;
            ctx.fillText(particle.icon, 0, 0);
            ctx.restore();

            particle.yPos += particle.speed;
            particle.rotation += 1;

            if (particle.yPos > canvas.height) {
                confettiParticles.splice(index, 1);
            }
        });
        requestAnimationFrame(animateConfetti);
    }

    setInterval(generateConfetti, 100); // mag generate confetti every 100ms
    animateConfetti();
});