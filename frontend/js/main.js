console.log("VERSION 777");
console.log("JS працює!");

// ==========================
// Елементи сторінки
// ==========================

const button = document.getElementById("sleepButton");
const buttonText = document.getElementById("buttonText");
const timer = document.getElementById("sleepTimer");

const saveButton = document.getElementById("saveSleep");
const dreamInput = document.getElementById("dreamInput");
const noteInput = document.getElementById("noteInput");

const stars = document.querySelectorAll("#ratingStars span");
const moods = document.querySelectorAll(".moods button");

const modal = document.getElementById("sleepModal");
const modalDuration = document.getElementById("modalDuration");

// ==========================
// Змінні
// ==========================

let sleeping = false;
let startTime = null;
let interval = null;

let hours = 0;
let minutes = 0;

let selectedRating = 5;
let selectedMood = "😊";

// ==========================
// Початковий стан
// ==========================

stars.forEach(star => star.classList.add("active"));
moods[0].classList.add("active");

// ==========================
// Кнопка Почати сон
// ==========================

button.addEventListener("click", () => {

    if (!sleeping) {

        sleeping = true;

        startTime = new Date();

        localStorage.setItem("sleepStart", startTime.toISOString());

        buttonText.textContent = "Прокинувся";

        button.style.background = "#8B5CF6";
        button.style.color = "white";

        updateTimer();

        interval = setInterval(updateTimer, 1000);

    } else {

        sleeping = false;

        clearInterval(interval);

        localStorage.removeItem("sleepStart");

        buttonText.textContent = "Почати сон";

        button.style.background = "";
        button.style.color = "";

        timer.textContent = "😴 Сон завершено";

        modal.style.display = "flex";

        modalDuration.textContent =
            `Ви спали ${hours} год ${minutes} хв`;
    }

});

// ==========================
// Таймер
// ==========================

function updateTimer() {

    const now = new Date();

    const diff = now - startTime;

    hours = Math.floor(diff / 1000 / 60 / 60);

    minutes = Math.floor(diff / 1000 / 60) % 60;

    const seconds = Math.floor(diff / 1000) % 60;

    timer.innerHTML = `
        😴 Сон триває<br><br>
        ${String(hours).padStart(2, "0")}:
        ${String(minutes).padStart(2, "0")}:
        ${String(seconds).padStart(2, "0")}
    `;

}

// ==========================
// Відновлення таймера
// ==========================

function restoreSleep() {

    const savedTime = localStorage.getItem("sleepStart");

    if (!savedTime) return;

    sleeping = true;

    startTime = new Date(savedTime);

    buttonText.textContent = "Прокинувся";

    button.style.background = "#8B5CF6";
    button.style.color = "white";

    updateTimer();

    interval = setInterval(updateTimer, 1000);

}

restoreSleep();

// ==========================
// Закриття модального вікна
// ==========================

document.querySelector(".close-modal").addEventListener("click", () => {

    modal.style.display = "none";

});

// ==========================
// Вибір рейтингу
// ==========================

stars.forEach(star => {

    star.addEventListener("click", () => {

        selectedRating = Number(star.dataset.rating);

        stars.forEach(s => {

            if (Number(s.dataset.rating) <= selectedRating) {

                s.classList.add("active");

            } else {

                s.classList.remove("active");

            }

        });

    });

});

// ==========================
// Вибір настрою
// ==========================

moods.forEach(mood => {

    mood.addEventListener("click", () => {

        selectedMood = mood.dataset.mood;

        moods.forEach(btn => btn.classList.remove("active"));

        mood.classList.add("active");

    });

});

// ==========================
// Формат часу
// ==========================

function formatDuration(minutes) {

    const h = Math.floor(minutes / 60);

    const m = minutes % 60;

    return `${h} год ${m} хв`;

}

function getMoodText(mood) {

    switch (mood) {

        case "😄":
            return "Почуваюсь чудово";

        case "😊":
            return "Почуваюсь добре";

        case "😐":
            return "Нормально";

        case "😴":
            return "Хочу ще спати";

        case "😣":
            return "Погано";

        default:
            return "";

    }

}

// ==========================
// Завантаження останнього запису
// ==========================

async function loadLastSleep() {

    console.log("loadLastSleep запустилась");

    const response = await fetch("/sleep/latest");

    console.log("Відповідь отримана");

    const sleep = await response.json();

    console.log("sleep =", sleep);

    if (!sleep.start_time) {
        console.log("Записів немає");
        return;
    }

    const start = new Date(sleep.start_time);
    const end = new Date(sleep.end_time);

    document.getElementById("lastDate").textContent =
        start.toLocaleDateString("uk-UA");

    document.getElementById("lastTime").textContent =
        `${start.toLocaleTimeString("uk-UA", {
            hour: "2-digit",
            minute: "2-digit"
        })} — ${end.toLocaleTimeString("uk-UA", {
            hour: "2-digit",
            minute: "2-digit"
        })}`;

    document.getElementById("lastDuration").textContent =
        `🌙 ${formatDuration(sleep.duration)}`;

    document.getElementById("lastMood").textContent =
        sleep.mood;

    document.getElementById("lastRating").textContent =
        "⭐".repeat(sleep.rating) +
        "☆".repeat(5 - sleep.rating);

    console.log("Оновлюю верхню картку");

    document.getElementById("mainDuration").textContent =
        formatDuration(sleep.duration);

    document.getElementById("mainRating").textContent =
        "⭐".repeat(sleep.rating) +
        "☆".repeat(5 - sleep.rating);

    document.getElementById("mainMood").textContent =
        `${sleep.mood} ${getMoodText(sleep.mood)}`;

    console.log("Все оновлено");
}

function formatLocalDate(date) {

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");

    const minutes = String(date.getMinutes()).padStart(2, "0");

    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

}

// ==========================
// Збереження сну
// ==========================

saveButton.addEventListener("click", async () => {

    if (!startTime) return;

    const endTime = new Date();

    const duration = hours * 60 + minutes;

    const response = await fetch("/sleep", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            start_time: formatLocalDate(startTime),

            end_time: formatLocalDate(endTime),

            duration,

            rating: selectedRating,

            mood: selectedMood,

            dream: dreamInput.value,

            note: noteInput.value

        })

    });

    const data = await response.json();

    console.log(data);

    await loadLastSleep();
    await loadStats();
    await loadHistory();

    alert("Сон успішно збережено!");

    modal.style.display = "none";

    dreamInput.value = "";
    noteInput.value = "";

    selectedRating = 5;
    selectedMood = "😊";

    stars.forEach(star => star.classList.add("active"));

    moods.forEach(btn => btn.classList.remove("active"));
    moods[0].classList.add("active");

    startTime = null;

});

// ==========================

loadLastSleep();
loadStats();
loadHistory();

async function loadStats() {

    const response = await fetch("/sleep/stats");

    const stats = await response.json();

    document.getElementById("totalSleep").textContent =
        formatDuration(stats.total_duration);

    document.getElementById("averageSleep").textContent =
        formatDuration(stats.average_duration);

    document.getElementById("sleepDays").textContent =
        stats.sleep_days;

    document.getElementById("goalDays").textContent =
        stats.goal_days;

}

async function loadHistory() {

    const response = await fetch("/sleep");

    const records = await response.json();

    const history = document.getElementById("historyList");

    history.innerHTML = "";

    records.forEach(record => {

        const start = new Date(record.start_time);

        const end = new Date(record.end_time);

        history.innerHTML += `

        <div class="history-card">

            <h3>
                ${start.toLocaleDateString("uk-UA")}
            </h3>

            <p>
                🕒
                ${start.toLocaleTimeString("uk-UA", {
                    hour: "2-digit",
                    minute: "2-digit"
                })}
                —
                ${end.toLocaleTimeString("uk-UA", {
                    hour: "2-digit",
                    minute: "2-digit"
                })}
            </p>

            <p>
                🌙 ${formatDuration(record.duration)}
            </p>

            <p>
                ${"⭐".repeat(record.rating)}
                ${"☆".repeat(5 - record.rating)}
            </p>

            <p>
                ${record.mood} ${getMoodText(record.mood)}
            </p>

            ${record.dream ?
                `<p>💭 ${record.dream}</p>` : ""}

            ${record.note ?
                `<p>📝 ${record.note}</p>` : ""}

        </div>

        `;

    });

}
