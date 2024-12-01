let timer;
let hours = 0;
let minutes = 0;
let seconds = 0;
let isRunning = false;

function updateDisplay() {
    const timeDisplay = document.getElementById('time-display');
    timeDisplay.textContent = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
}

// format sa timer
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

// start go
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(() => {
            seconds++;
            if (seconds === 60) {
                seconds = 0;
                minutes++;
                if (minutes === 60) {
                    minutes = 0;
                    hours++;
                }
            }
            updateDisplay();
        }, 1000);
    }
}

// stopp
function stopTimer() {
    clearInterval(timer);
    isRunning = false;
}

// resetttttt
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    hours = 0;
    minutes = 0;
    seconds = 0;
    updateDisplay();
}

function handleButtonHover(button) {
    button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#ddd';
        button.style.transform = 'scale(1.1)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = '';
        button.style.transform = '';
    });
}

function handleButtonClick(button) {
    button.addEventListener('click', () => {
        button.classList.toggle('clicked');
    });
}

document.getElementById('play-btn').addEventListener('click', startTimer);
document.getElementById('pause-btn').addEventListener('click', stopTimer);
document.getElementById('reset-btn').addEventListener('click', resetTimer);

const buttons = document.querySelectorAll('.play-timer, .pause-timer, .reset-timer');
    buttons.forEach(button => {
        handleButtonHover(button);
        handleButtonClick(button);
});