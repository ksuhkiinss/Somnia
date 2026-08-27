// ==========================
// Calendar
// ==========================

const calendarDays = document.getElementById("calendarDays");
const currentMonthElement = document.getElementById("currentMonth");

const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");

const selectedDateElement = document.getElementById("selectedDay");


// ==========================
// Calendar state
// ==========================

let currentDate = new Date();
let selectedDate = null;


// ==========================
// Sleep data
// ==========================

let sleepData = {};


// ==========================
// Month names
// ==========================

const monthNames = [
    "Січень",
    "Лютий",
    "Березень",
    "Квітень",
    "Травень",
    "Червень",
    "Липень",
    "Серпень",
    "Вересень",
    "Жовтень",
    "Листопад",
    "Грудень"
];


// ==========================
// Get date key
// ==========================

function getDateKey(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ==========================
// Format duration
// ==========================

function formatDuration(minutes) {

    if (!minutes) {
        return "0 хв";
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
        return `${mins} хв`;
    }

    if (mins === 0) {
        return `${hours} год`;
    }

    return `${hours} год ${mins} хв`;
}

// ==========================
// Format short duration
// ==========================

function formatShortDuration(minutes) {

    if (!minutes) {
        return "";
    }


    const hours =
        Math.floor(minutes / 60);

    const mins =
        minutes % 60;


    if (hours === 0) {
        return `${mins} хв`;
    }


    if (mins === 0) {
        return `${hours} год`;
    }


    return `${hours}г ${mins}хв`;
}

// ==========================
// Format time
// ==========================

function formatTime(dateString) {

    if (!dateString) {
        return "—";
    }

    const date = new Date(dateString);

    return date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit"
    });
}


// ==========================
// Load sleep data
// ==========================

async function loadSleepData() {

    try {

        const response = await fetch("/sleep");

        if (!response.ok) {
            throw new Error("Не вдалося отримати записи про сон");
        }

        const records = await response.json();


        // Очищаємо старі дані

        sleepData = {};


        // ==========================
        // Group records by date
        // ==========================

        records.forEach(record => {

            const startDate = new Date(record.start_time);

            const dateKey = getDateKey(startDate);


            if (!sleepData[dateKey]) {

                sleepData[dateKey] = {

                    duration: 0,

                    records: []

                };
            }


            sleepData[dateKey].duration += record.duration;

            sleepData[dateKey].records.push(record);

        });


        renderCalendar();

        updateSelectedDay();

    } catch (error) {

        console.error(
            "Помилка завантаження сну:",
            error
        );

        sleepData = {};

        renderCalendar();

        updateSelectedDay();
    }
}


// ==========================
// Render calendar
// ==========================

function renderCalendar() {

    calendarDays.innerHTML = "";


    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();


    currentMonthElement.textContent =
        `${monthNames[month]} ${year}`;


    // ==========================
    // First day of month
    // ==========================

    const firstDay = new Date(year, month, 1);

    let firstDayIndex = firstDay.getDay();


    if (firstDayIndex === 0) {

        firstDayIndex = 6;

    } else {

        firstDayIndex -= 1;
    }


    // ==========================
    // Days in month
    // ==========================

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();


    // ==========================
    // Previous month
    // ==========================

    const daysInPreviousMonth =
        new Date(year, month, 0).getDate();


    for (
        let i = firstDayIndex - 1;
        i >= 0;
        i--
    ) {

        const dayNumber =
            daysInPreviousMonth - i;

        const date =
            new Date(year, month - 1, dayNumber);

        createDay(
            dayNumber,
            date,
            true
        );
    }


    // ==========================
    // Current month
    // ==========================

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            new Date(year, month, day);

        createDay(
            day,
            date,
            false
        );
    }


    // ==========================
    // Next month
    // ==========================

    const totalDays =
        firstDayIndex + daysInMonth;

    const remainingDays =
        42 - totalDays;


    for (
        let day = 1;
        day <= remainingDays;
        day++
    ) {

        const date =
            new Date(year, month + 1, day);

        createDay(
            day,
            date,
            true
        );
    }
}


// ==========================
// Create calendar day
// ==========================

function createDay(
    dayNumber,
    date,
    otherMonth
) {

    const dayElement =
        document.createElement("div");


    dayElement.classList.add("day");

    dayElement.textContent = dayNumber;


    // ==========================
    // Other month
    // ==========================

    if (otherMonth) {

        dayElement.classList.add(
            "other-month"
        );
    }


    // ==========================
    // Today
    // ==========================

    const today = new Date();

    const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();


    if (isToday) {

        dayElement.classList.add("today");
    }


    // ==========================
    // Selected day
    // ==========================

    if (
        selectedDate &&
        date.toDateString() ===
        selectedDate.toDateString()
    ) {

        dayElement.classList.add("selected");
    }


    // ==========================
// Sleep record
// ==========================

const dateKey =
    getDateKey(date);

const sleep =
    sleepData[dateKey];


if (sleep) {

    dayElement.classList.add("has-sleep");


    // ==========================
    // Sleep quality by duration
    // ==========================

    if (sleep.duration >= 8 * 60) {

        dayElement.classList.add(
            "sleep-good"
        );

    } else if (sleep.duration >= 6 * 60) {

        dayElement.classList.add(
            "sleep-medium"
        );

    } else {

        dayElement.classList.add(
            "sleep-bad"
        );
    }


    const durationElement =
        document.createElement("span");


    durationElement.classList.add(
        "day-sleep-duration"
    );


    durationElement.textContent =
        formatShortDuration(sleep.duration);


    dayElement.appendChild(
        durationElement
    );
}


    // ==========================
    // Click
    // ==========================

    dayElement.addEventListener(
        "click",
        () => {

            selectedDate = date;


            // Якщо натиснули день
            // іншого місяця

            if (otherMonth) {

                currentDate = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    1
                );
            }


            updateSelectedDay();

            renderCalendar();

        }
    );


    calendarDays.appendChild(
        dayElement
    );
}


// ==========================
// Selected day information
// ==========================

function updateSelectedDay() {

    if (!selectedDate) {

        selectedDateElement.innerHTML = `

            <h3>🌙 Обери день</h3>

            <p>
                Натисни на дату,
                щоб переглянути інформацію про сон.
            </p>

        `;

        return;
    }


    const day =
        selectedDate.getDate();

    const month =
        monthNames[selectedDate.getMonth()];

    const year =
        selectedDate.getFullYear();


    const dateKey =
        getDateKey(selectedDate);

    const sleep =
        sleepData[dateKey];


   // ==========================
// There is sleep data
// ==========================

if (sleep) {

    const records = sleep.records;

    const firstRecord =
        records[records.length - 1];

    const lastRecord =
        records[0];


    // Беремо останній запис для
    // додаткової інформації

    const latestRecord =
        records[0];


    selectedDateElement.innerHTML = `

        <h3>
            🌙 ${day} ${month} ${year}
        </h3>


        <div class="sleep-details">


            <!-- ==========================
                 Duration
            ========================== -->

            <div class="sleep-duration">

                <div class="sleep-duration-icon">
                    🛏️
                </div>

                <div class="sleep-duration-text">

                    <span>
                        Загальна тривалість сну
                    </span>

                    <strong>
                        ${formatDuration(sleep.duration)}
                    </strong>

                </div>

            </div>


            <!-- ==========================
                 Sleep / wake time
            ========================== -->

            <div class="sleep-detail">

                🌙

                <span>
                    <strong>Заснула:</strong>
                    ${formatTime(firstRecord.start_time)}
                </span>

            </div>


            <div class="sleep-detail">

                ☀️

                <span>
                    <strong>Прокинулась:</strong>
                    ${formatTime(lastRecord.end_time)}
                </span>

            </div>


            <!-- ==========================
                 Rating
            ========================== -->

            ${
                latestRecord.rating
                    ? `
                        <div class="sleep-rating">
                            ⭐ Якість сну:
                            ${latestRecord.rating}
                        </div>
                      `
                    : ""
            }


            <!-- ==========================
                 Mood
            ========================== -->

            ${
                latestRecord.mood
                    ? `
                        <div class="sleep-detail">
                            😊

                            <span>
                                <strong>Настрій:</strong>
                                ${latestRecord.mood}
                            </span>
                        </div>
                      `
                    : ""
            }


            <!-- ==========================
                 Note
            ========================== -->

            ${
                latestRecord.note
                    ? `
                        <div class="sleep-note">

                            <div class="sleep-note-title">
                                📝 Нотатка
                            </div>

                            <div class="sleep-note-text">
                                ${latestRecord.note}
                            </div>

                        </div>
                      `
                    : ""
            }


            <!-- ==========================
                 Dream
            ========================== -->

            ${
                latestRecord.dream
                    ? `
                        <div class="sleep-note">

                            <div class="sleep-note-title">
                                🌙 Сон
                            </div>

                            <div class="sleep-note-text">
                                ${latestRecord.dream}
                            </div>

                        </div>
                      `
                    : ""
            }

        </div>

    `;

    return;
}


    // ==========================
    // No sleep data
    // ==========================

    selectedDateElement.innerHTML = `

        <h3>
            🌙 ${day} ${month} ${year}
        </h3>

        <div class="empty-sleep">

            <div class="empty-sleep-icon">
                💤
            </div>

            <div class="empty-sleep-content">

                <h4>
                    Немає запису про сон
                </h4>

                <p>
                    Для цього дня ще нічого не записано.
                </p>

            </div>

        </div>

    `;
}


// ==========================
// Previous month
// ==========================

prevMonthButton.addEventListener(
    "click",
    () => {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        renderCalendar();

    }
);


// ==========================
// Next month
// ==========================

nextMonthButton.addEventListener(
    "click",
    () => {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        renderCalendar();

    }
);


// ==========================
// Start
// ==========================

loadSleepData();