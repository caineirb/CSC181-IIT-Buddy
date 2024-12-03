// kulang nga mga functions:
// 1. ang delete kay reset dapat like mo balik sa gi set nga time
// 2. mo display sa lain route even tho timer is still running
// 3. let's see haha galibog nakooooooooooo
// 4. think shir nga countdown dili like ano ano
// galibog naaaaaaaaaaaaaaaaaaaaaaa

let timer;
let hours = 0;
let minutes = 0;
let seconds = 0;
let isRunning = false;
let isTimerSet = false;

const timeDisplay = document.getElementById('time-display');
const modal = document.getElementById('set-timer-modal');
const setBtn = document.getElementById('set-btn');
const playStopBtn = document.getElementById('play-stop-btn');
const pauseResumeBtn = document.getElementById('pause-resume-btn');
const playIcon = document.getElementById('play-icon');
const resetIcon = document.getElementById('reset-icon');
const pauseCircle = document.getElementById('pause-circle');
const playCircle = document.getElementById('play-circle'); // cholera ga libog nakoooooooooooo

// mo red ang timer if 10 sec and less na
function updateDisplay() {
    timeDisplay.textContent = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
    if (hours === 0 && minutes === 0 && seconds <= 10 && isRunning) {
        timeDisplay.style.color = 'red';
    } else {
        timeDisplay.style.color = '';
    }
}

// aron two digit and format sa timer not one
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

// enabled and disabled si mr set timer btn
function disableSetButton(disable) {
    setBtn.style.pointerEvents = disable ? 'none' : 'auto';
    setBtn.style.opacity = disable ? '0.5' : '1';
}

// start ang timer
function startTimer() {
    if (!isRunning && isTimerSet) {
        isRunning = true;
        disableSetButton(true); // ma disabled an set timer btn if i click sa start/play btn
        disablePauseResume(false); // and obcurs ma enable si pause-resume btn
        timer = setInterval(() => {
            if (hours === 0 && minutes === 0 && seconds === 0) {
                clearInterval(timer);
                isRunning = false;
                isTimerSet = false;
                alert("Time's up!");
                togglePlayStopIcon(false);
                disablePauseResume(true);
                disableTimerControls(true);
                disableSetButton(false);
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

// stop timer
function stopTimer() {
    clearInterval(timer);
    isRunning = false;
}

// reset timer
function resetTimer() {
    stopTimer();
    // reset to the set nga time daan
    const savedHours = parseInt(document.getElementById('modal-hours').value) || 0;
    const savedMinutes = parseInt(document.getElementById('modal-minutes').value) || 0;
    const savedSeconds = parseInt(document.getElementById('modal-seconds').value) || 0;

    hours = savedHours;
    minutes = savedMinutes;
    seconds = savedSeconds;

    updateDisplay();
    isRunning = false;
    isTimerSet = savedHours !== 0 || savedMinutes !== 0 || savedSeconds !== 0;

    disableTimerControls(!isTimerSet);
    disablePauseResume(true);
    togglePlayStopIcon(false);
    togglePauseResumeIcon(false);
    disableSetButton(false);
}

// toggle play/stop icons
function togglePlayStopIcon(isPlaying) {
    playIcon.style.display = isPlaying ? 'none' : 'inline';
    resetIcon.style.display = isPlaying ? 'inline' : 'none';
}

// toggle pause/resume icons
function togglePauseResumeIcon(isPaused) {
    pauseCircle.style.display = isPaused ? 'none' : 'inline';
    playCircle.style.display = isPaused ? 'inline' : 'none';
}

// disable or enable timer controls
function disableTimerControls(disable) {
    playStopBtn.style.pointerEvents = disable ? 'none' : 'auto';
    playStopBtn.style.opacity = disable ? '0.5' : '1';
}

// disabled resume pause/resume 
function disablePauseResume(disable) {
    pauseResumeBtn.style.pointerEvents = disable ? 'none' : 'auto';
    pauseResumeBtn.style.opacity = disable ? '0.5' : '1';
}

// function switch2 ang play-stop button
playStopBtn.addEventListener('click', () => {
    if (isRunning) {
        resetTimer();
    } else {
        startTimer();
        togglePlayStopIcon(true);
    }
});

// same goes here switch2 btn/icon
pauseResumeBtn.addEventListener('click', () => {
    if (isRunning) {
        stopTimer();
        togglePauseResumeIcon(true);
    } else {
        startTimer();
        togglePauseResumeIcon(false);
    }
});

// modal sa pag set sa timer, pag ni
setBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

// cancel adtong sa set timer modal
document.getElementById('cancel-timer').addEventListener('click', () => {
    modal.style.display = 'none';
});

// set/save sa set timer modal
document.getElementById('save-timer').addEventListener('click', () => {
    hours = parseInt(document.getElementById('modal-hours').value) || 0;
    minutes = parseInt(document.getElementById('modal-minutes').value) || 0;
    seconds = parseInt(document.getElementById('modal-seconds').value) || 0;

    if (hours === 0 && minutes === 0 && seconds === 0) {
        alert('Please set a valid timer.');
    } else {
        isTimerSet = true;
        updateDisplay();
        modal.style.display = 'none';

        disableTimerControls(false);
        togglePlayStopIcon(false); 
    }
});

updateDisplay();
disableTimerControls(true);
disablePauseResume(true);
disableSetButton(false);

// function appear and ma close si clock container
const clockIcon = document.getElementById('clock-icon');
const clockContainer = document.getElementById('clock-container');
const closeClock = document.getElementById('close-clock');

// kabuing na dugayyyyy ko diri huhu
function positionClockContainer() {
    const iconRect = clockIcon.getBoundingClientRect();
    clockContainer.style.top = `${iconRect.top}px`;
    clockContainer.style.left = `${iconRect.left}px`;
}

clockIcon.addEventListener('click', () => {
    positionClockContainer();
    toggleClockContainer(true);
});

function toggleClockContainer(show) {
    if (show) {
        positionClockContainer();
        clockContainer.style.display = 'block';
        clockIcon.style.display = 'none';
    } else {
        clockContainer.style.display = 'none';
        clockIcon.style.display = 'inline';
    }
}

// show icon kung ma click ang specific icon and vice verse
clockIcon.addEventListener('click', () => toggleClockContainer(true));
closeClock.addEventListener('click', () => toggleClockContainer(false));
