let timer; 
let hours = 0;
let minutes = 0;
let seconds = 0;
let isRunning = false;
let isPaused = false;
let isTimerSet = false;
let set_hours = 0;
let set_minutes = 0;
let set_seconds =  0;

const timeDisplay = document.getElementById('time-display');
const modal = document.getElementById('set-timer-modal');
const setBtn = document.getElementById('set-btn');
const playStopBtn = document.getElementById('play-stop-btn');
const pauseResumeBtn = document.getElementById('pause-resume-btn');
const playIcon = document.getElementById('play-icon');
const resetIcon = document.getElementById('reset-icon');
const pauseCircle = document.getElementById('pause-circle');
const playCircle = document.getElementById('play-circle');

// mo red ang timer if 10 sec and less na
function updateDisplay() {
    formatTime();
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

// input format and constrainttts
function handleTimeInput(event, minValue, maxValue) {
    let value = parseInt(event.target.value) || 0;
    if (value < minValue) {
        value = minValue;
    } else if (value > maxValue) {
        value = maxValue;
    }
    event.target.value = formatTime(value);
}

document.getElementById('modal-hours').addEventListener('input', function (event) {
    handleTimeInput(event, 0, 99);
});

document.getElementById('modal-minutes').addEventListener('input', function (event) {
    handleTimeInput(event, 0, 59);
});

document.getElementById('modal-seconds').addEventListener('input', function (event) {
    handleTimeInput(event, 0, 59);
});

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
                isPaused = false;
                Swal.fire({
                    title: "Ooops! Time's up!",
                    text: "Your timer has finished.",
                    iconHtml: '<i class="bi bi-alarm tickle"></i>',
                    confirmButtonText: 'OK',
                });

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
    if (isRunning || isPaused) {
        isPaused = false;
        resetTimer();
    } else {
        startTimer();
        togglePlayStopIcon(true);
    }
});

// same goes here switch2 btn/icon
pauseResumeBtn.addEventListener('click', () => {
    isPaused = !isPaused;
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
        Swal.fire({
            title: "Invalid Timer",
            text: "Please set a valid timer.",
            icon: 'error',
            confirmButtonText: 'OK'
        });
    } else {
        
        isTimerSet = true;
        updateDisplay();
        modal.style.display = 'none';
        
        const time_set = { 
            "set_hours": hours,
            "set_minutes": minutes,
            "set_seconds": seconds
        };
        const clockCSRF = document.getElementById('clock_csrf').value;
        fetch('/set-timer',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "X-CSRFToken": clockCSRF
            },
            body: JSON.stringify(time_set)
        })

        disableTimerControls(false);
        togglePlayStopIcon(false); 
    }
});

document.getElementById('default').addEventListener('click', () => {
    document.getElementById('modal-hours').value = formatTime(0);
    document.getElementById('modal-minutes').value = formatTime(0);
    document.getElementById('modal-seconds').value = formatTime(0);

    //gi apil nlng sab nako ang time display
    const timerDisplay = document.querySelector('.time-display');
    timerDisplay.style.display = 'block';
    timerDisplay.textContent = formatTime(0) + ':' + formatTime(0) + ':' + formatTime(0);

    const time_reset = {
        "set_hours": 0,
        "set_minutes": 0,
        "set_seconds": 0
    };

    const clockCSRF = document.getElementById('clock_csrf').value;
    fetch('/set-timer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-CSRFToken": clockCSRF
        },
        body: JSON.stringify(time_reset)
    })
    .then(response => response.json())
    .then(data => {
        isTimerSet = false;
    });
    disableTimerControls(true); 
});

updateDisplay();
disableTimerControls(true);
disablePauseResume(true);
disableSetButton(false);

// function appear and ma close si clock container
const clockIcon = document.getElementById('clock-icon');
const clockContainer = document.getElementById('clock-container');
const closeClock = document.getElementById('close-clock');

// dynamic positioning for the clockcontainer
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

window.addEventListener('beforeunload', () => {
    const time = { 
        "hours": hours, 
        "minutes": minutes, 
        "seconds": seconds, 
        "isRunning": isRunning,
        "isPaused": isPaused
    };
    const clockCSRF = document.getElementById('clock_csrf').value;
    fetch('/timer',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-CSRFToken": clockCSRF
        },
        body: JSON.stringify(time)
    })
});

window.addEventListener('load', async () => {
    try {
        const time_state = await fetch('/timer');
        if (!time_state.ok) throw new Error('Failed to fetch timer state');
        const timerState = await time_state.json();

        const time_set = await fetch('/set-timer');
        if (!time_set.ok) throw new Error('Failed to fetch timer state');
        const timerSet = await time_set.json();

        if (timerState) {
            hours = timerState.hours || 0;
            minutes = timerState.minutes || 0;
            seconds = timerState.seconds || 0;
            isRunning = timerState.isRunning || false;
            isPaused = timerState.isPaused || false;

            // for the reset of the timer
            document.getElementById('modal-hours').value = formatTime(timerSet.set_hours || 0);
            document.getElementById('modal-minutes').value = formatTime(timerSet.set_minutes || 0);
            document.getElementById('modal-seconds').value = formatTime(timerSet.set_seconds || 0);

            if (isRunning || isPaused) {
                toggleClockDisplay(true);   // Only open after loading if the time is still > 0
                togglePlayStopIcon(true);
                isRunning = false;
                isTimerSet = true;
                startTimer();
                disableTimerControls(false);
                if (isPaused){
                    pauseResumeBtn.click();
                    isPaused = true;
                }
                updateDisplay();
            }
        }
        
        updateClockDisplay();
    } catch (error) {
        console.error('Error fetching timer state:', error);
    }
});

function toggleClockDisplay(isClockContainerOpen) {
    const modal = document.getElementById('clock-container');
    const clockIcon = document.getElementById('clock-icon');

    if (isClockContainerOpen) {
        if (modal) modal.style.display = 'block';
        if (clockIcon) clockIcon.style.display = 'none';
    } else {
        if (modal) modal.style.display = 'none';
        if (clockIcon) clockIcon.style.display = 'block';
    }
}

clockIcon.addEventListener('click', () => {
    toggleClockDisplay(true);
});

const closeclock = document.getElementById('close-clock');
if (closeclock) {
    closeclock.addEventListener('click', () => {
        toggleClockDisplay(false);
    });
}

function updateClockDisplay() {
    const clockDisplay = document.getElementById('clock-display');
    if (clockDisplay) {
        clockDisplay.textContent = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
    }
}