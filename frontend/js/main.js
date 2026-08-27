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

// Виправлено:
// тепер беремо mood тільки з модального вікна завершення сну
const moods = document.querySelectorAll("#sleepModal .moods button");

const modal = document.getElementById("sleepModal");
const modalDuration = document.getElementById("modalDuration");

const manualButton = document.getElementById("addSleepButton");
const manualModal = document.getElementById("manualSleepModal");
const closeManual = document.getElementById("closeManualModal");

const manualDate = document.getElementById("manualDate");
const manualStart = document.getElementById("manualStart");
const manualEnd = document.getElementById("manualEnd");

const manualDream = document.getElementById("manualDream");
const manualNote = document.getElementById("manualNote");

const saveManualSleep = document.getElementById("saveManualSleep");

const manualStars = document.querySelectorAll("#manualRating span");

const manualMoods = document.querySelectorAll("#manualMoods button");

const openLastRecord = document.getElementById("openLastRecord");

const recordModal = document.getElementById("recordModal");

const closeRecordModal = document.getElementById("closeRecordModal");


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

let lastSleepRecord = null;

let manualRating = 5;
let manualMood = "😊";


// ==========================
// Поточна дата
// ==========================

function updateCurrentDate() {

    const date = new Date();

    document.getElementById("currentDate").textContent =
        "Сьогодні " +
        date.toLocaleDateString("uk-UA", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

}

updateCurrentDate();


// ==========================
// Початковий стан
// ==========================

stars.forEach(star => star.classList.add("active"));
moods[0].classList.add("active");

manualStars.forEach(star => star.classList.add("active"));
manualMoods[0].classList.add("active");


// ==========================
// Кнопка Почати сон
// ==========================

button.addEventListener("click", () => {

    if (!sleeping) {

        sleeping = true;

        startTime = new Date();

        localStorage.setItem(
            "sleepStart",
            startTime.toISOString()
        );

        buttonText.textContent = "Прокинувся";

        button.style.background = "#8B5CF6";
        button.style.color = "white";

        updateTimer();

        interval = setInterval(updateTimer, 1000);

    } else {

        sleeping = false;

        clearInterval(interval);
        interval = null;

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

const closeSleep =
    document.querySelector("#sleepModal .close-modal");

closeSleep.addEventListener("click", () => {

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


manualStars.forEach(star => {

    star.addEventListener("click", () => {

        manualRating = Number(star.dataset.rating);

        manualStars.forEach(s => {

            if (Number(s.dataset.rating) <= manualRating) {

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

        moods.forEach(btn =>
            btn.classList.remove("active")
        );

        mood.classList.add("active");

    });

});


manualMoods.forEach(button => {

    button.addEventListener("click", () => {

        manualMood = button.dataset.mood;

        manualMoods.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

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

    if (!response.ok) {

        console.error("Помилка завантаження останнього сну");

        return;

    }

    console.log("Відповідь отримана");

    const sleep = await response.json();

    lastSleepRecord = sleep;

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


// ==========================
// Формат локальної дати
// ==========================

function formatLocalDate(date) {

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    const hours =
        String(date.getHours()).padStart(2, "0");

    const minutes =
        String(date.getMinutes()).padStart(2, "0");

    const seconds =
        String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

}


// ==========================
// Локальна дата для input[type=date]
// ==========================

function getLocalDateString(date) {

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

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

    if (!response.ok) {

        alert("Не вдалося зберегти сон.");

        return;

    }

    const data = await response.json();

    console.log(data);

    await loadLastSleep();
    await loadStats();

    alert("Сон успішно збережено!");

    modal.style.display = "none";

    dreamInput.value = "";
    noteInput.value = "";

    selectedRating = 5;
    selectedMood = "😊";

    stars.forEach(star =>
        star.classList.add("active")
    );

    moods.forEach(btn =>
        btn.classList.remove("active")
    );

    moods[0].classList.add("active");

    // Повністю очищаємо стан завершеного сну
    startTime = null;
    sleeping = false;
    hours = 0;
    minutes = 0;
    interval = null;

});


// ==========================
// Завантаження даних
// ==========================

loadLastSleep();
loadStats();


// ==========================
// Статистика
// ==========================

async function loadStats() {

    const response = await fetch("/sleep/stats");

    if (!response.ok) {

        console.error("Помилка завантаження статистики");

        return;

    }

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


// ==========================
// Додавання сну
// ==========================

manualButton.addEventListener("click", () => {

    manualModal.style.display = "flex";

    // Використовуємо локальну дату,
    // а не UTC через toISOString()
    manualDate.value =
        getLocalDateString(new Date());

});


closeManual.addEventListener("click", () => {

    manualModal.style.display = "none";

});


saveManualSleep.addEventListener("click", async () => {

    const date = manualDate.value;
    const start = manualStart.value;
    const end = manualEnd.value;

    if (!date || !start || !end) {

        alert("Заповніть дату, початок і кінець сну.");

        return;

    }

    const startTime = new Date(`${date}T${start}`);
    const endTime = new Date(`${date}T${end}`);

    // Якщо сон закінчився після півночі
    if (endTime < startTime) {

        endTime.setDate(
            endTime.getDate() + 1
        );

    }

    const duration =
        Math.floor(
            (endTime - startTime) / 1000 / 60
        );

    const response = await fetch("/sleep", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            start_time: formatLocalDate(startTime),

            end_time: formatLocalDate(endTime),

            duration: duration,

            rating: manualRating,

            mood: manualMood,

            dream: manualDream.value,

            note: manualNote.value

        })

    });

    if (!response.ok) {

        alert("Не вдалося додати сон.");

        return;

    }

    const data = await response.json();

    console.log(data);

    await loadLastSleep();
    await loadStats();

    manualModal.style.display = "none";

    alert("Сон успішно додано!");

    manualRating = 5;
    manualMood = "😊";

    manualStars.forEach(star =>
        star.classList.add("active")
    );

    manualMoods.forEach(btn =>
        btn.classList.remove("active")
    );

    manualMoods[0].classList.add("active");

    manualStart.value = "";
    manualEnd.value = "";

    manualDream.value = "";
    manualNote.value = "";

});


// ==========================
// Перегляд останнього запису
// ==========================

openLastRecord.addEventListener("click", () => {

    if (!lastSleepRecord || !lastSleepRecord.start_time) {

        alert("Записів ще немає 😴");

        return;

    }

    const start =
        new Date(lastSleepRecord.start_time);

    const end =
        new Date(lastSleepRecord.end_time);

    document.getElementById("viewDate").textContent =
        "📅 " +
        start.toLocaleDateString("uk-UA");

    document.getElementById("viewTime").textContent =
        "🕒 " +
        start.toLocaleTimeString("uk-UA", {
            hour: "2-digit",
            minute: "2-digit"
        }) +
        " — " +
        end.toLocaleTimeString("uk-UA", {
            hour: "2-digit",
            minute: "2-digit"
        });

    document.getElementById("viewDuration").textContent =
        "🌙 " +
        formatDuration(lastSleepRecord.duration);

    document.getElementById("viewRating").textContent =
        "⭐".repeat(lastSleepRecord.rating) +
        "☆".repeat(5 - lastSleepRecord.rating);

    document.getElementById("viewMood").textContent =
        lastSleepRecord.mood +
        " " +
        getMoodText(lastSleepRecord.mood);

    document.getElementById("viewDream").textContent =
        lastSleepRecord.dream
            ? "💭 " + lastSleepRecord.dream
            : "💭 Сон не записаний";

    document.getElementById("viewNote").textContent =
        lastSleepRecord.note
            ? "📝 " + lastSleepRecord.note
            : "📝 Нотаток немає";

    recordModal.style.display = "flex";

});


closeRecordModal.addEventListener("click", () => {

    recordModal.style.display = "none";

});