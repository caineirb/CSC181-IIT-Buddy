let timer;
let hours = 0;
let minutes = 0;
let seconds = 0;
let isRunning = false;

const timeDisplay = document.getElementById('time-display');
const modal = document.getElementById('set-timer-modal');
const setBtn = document.getElementById('set-btn');

function updateDisplay() {
    timeDisplay.textContent = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;

    // check if 10 seconds na ang time
    if (hours === 0 && minutes === 0 && seconds <= 10 && isRunning) {
        timeDisplay.style.color = 'red'; // then ma change ang color to red
    } else {
        timeDisplay.style.color = '';
    }
}

function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(() => {
            if (seconds === 0 && minutes === 0 && hours === 0) {
                clearInterval(timer);
                isRunning = false;
                alert("Time's up!");
            } else {
                if (seconds === 0) {
                    if (minutes === 0) {
                        if (hours > 0) {
                            hours--;
                            minutes = 59;
                            seconds = 59;
                        }
                    } else {
                        minutes--;
                        seconds = 59;
                    }
                } else {
                    seconds--;
                }
            }
            updateDisplay();
        }, 1000);
    }
}

function stopTimer() {
    clearInterval(timer);
    isRunning = false;
}

setBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

document.getElementById('cancel-timer').addEventListener('click', () => {
    modal.style.display = 'none';
});

document.getElementById('save-timer').addEventListener('click', () => {
    hours = parseInt(document.getElementById('modal-hours').value) || 0;
    minutes = parseInt(document.getElementById('modal-minutes').value) || 0;
    seconds = parseInt(document.getElementById('modal-seconds').value) || 0;
    updateDisplay();
    modal.style.display = 'none';
});

document.getElementById('play-stop-btn').addEventListener('click', () => {
    if (isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
});

document.getElementById('pause-resume-btn').addEventListener('click', () => {
    if (isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
});

function formatInput(input) {
    let value = parseInt(input.value) || 0;
    if (value < 10) {
        input.value = `0${value}`;
    } else {
        input.value = `${value}`;
    }
}

document.querySelectorAll('.modal-input').forEach(input => {
    input.addEventListener('input', () => {
        formatInput(input);
    });

    input.addEventListener('blur', () => {
        formatInput(input);
    });

    input.addEventListener('change', () => {
        if (parseInt(input.value) > parseInt(input.max)) {
            input.value = input.max;
        }
        formatInput(input);
    });
});
