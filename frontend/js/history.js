console.log("HISTORY JS VERSION 777");
console.log("History page");

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
// Редагування
// ==========================

let editingId = null;

let editRating = 5;

let editMood = "😊";

const editModal = document.getElementById("editSleepModal");

const editDate = document.getElementById("editDate");

const editStart = document.getElementById("editStart");

const editEnd = document.getElementById("editEnd");

const editDream = document.getElementById("editDream");

const editNote = document.getElementById("editNote");

const saveEditSleep = document.getElementById("saveEditSleep");

const closeEditModal = document.getElementById("closeEditModal");

const editStars = document.querySelectorAll("#editRating span");

const editMoods = document.querySelectorAll("#editMoods button");


// ==========================
// Рейтинг
// ==========================

editStars.forEach(star => {

    star.addEventListener("click", () => {

        editRating = Number(star.dataset.rating);

        editStars.forEach(s => {

            if (Number(s.dataset.rating) <= editRating) {

                s.classList.add("active");

            } else {

                s.classList.remove("active");

            }

        });

    });

});


// ==========================
// Настрій
// ==========================

editMoods.forEach(mood => {

    mood.addEventListener("click", () => {

        editMood = mood.dataset.mood;

        editMoods.forEach(button => {
            button.classList.remove("active");
        });

        mood.classList.add("active");

    });

});


// ==========================
// Історія
// ==========================

async function loadHistory() {

    const response = await fetch("/sleep");

    if (!response.ok) {

        throw new Error("Не вдалося завантажити історію");

    }

    const records = await response.json();

    const history = document.getElementById("historyList");

    history.innerHTML = "";

    if (records.length === 0) {

        history.innerHTML = `
            <p>😴 Записів про сон ще немає.</p>
        `;

        return;

    }

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

            <div class="history-actions">

                <button
                    type="button"
                    class="record-button edit-button"
                    data-id="${record.id}">

                    ✏️ Редагувати

                </button>

                <button
                    type="button"
                    class="record-button delete-button"
                    data-id="${record.id}">

                    🗑️ Видалити

                </button>

            </div>

        </div>

        `;

    });


    // ==========================
    // Редагування запису
    // ==========================

    document.querySelectorAll(".edit-button").forEach(button => {

        button.addEventListener("click", () => {

            const id = Number(button.dataset.id);

            const record = records.find(
                record => record.id === id
            );

            if (!record) return;

            editingId = record.id;

            const start = new Date(record.start_time);

            const end = new Date(record.end_time);

            editDate.value =
                formatDate(start);

            editStart.value =
                formatTime(start);

            editEnd.value =
                formatTime(end);

            editRating = record.rating;

            editStars.forEach(star => {

                if (
                    Number(star.dataset.rating)
                    <= editRating
                ) {

                    star.classList.add("active");

                } else {

                    star.classList.remove("active");

                }

            });

            editMood = record.mood;

            editMoods.forEach(mood => {

                if (mood.dataset.mood === editMood) {

                    mood.classList.add("active");

                } else {

                    mood.classList.remove("active");

                }

            });

            editDream.value = record.dream || "";

            editNote.value = record.note || "";

            editModal.style.display = "flex";

        });

    });


    // ==========================
    // Видалення
    // ==========================

    document.querySelectorAll(".delete-button").forEach(button => {

        button.addEventListener("click", async () => {

            const id = Number(button.dataset.id);

            const confirmed = confirm(
                "Ви впевнені, що хочете видалити цей запис?"
            );

            if (!confirmed) return;

            const response = await fetch(
                `/sleep/${id}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {

                alert("Не вдалося видалити запис.");

                return;

            }

            alert("Запис видалено 🗑️");

            await loadHistory();

        });

    });

}


// ==========================
// Формат дати
// ==========================

function formatDate(date) {

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// ==========================
// Формат часу
// ==========================

function formatTime(date) {

    const hours =
        String(date.getHours()).padStart(2, "0");

    const minutes =
        String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;

}


// ==========================
// Закриття редагування
// ==========================

closeEditModal.addEventListener("click", () => {

    editModal.style.display = "none";

});


// ==========================
// Збереження змін
// ==========================

saveEditSleep.addEventListener("click", async () => {

    if (!editingId) return;

    const date = editDate.value;

    const start = editStart.value;

    const end = editEnd.value;

    if (!date || !start || !end) {

        alert(
            "Заповніть дату, початок і кінець сну."
        );

        return;

    }

    const startTime =
        new Date(`${date}T${start}`);

    const endTime =
        new Date(`${date}T${end}`);

    // Якщо сон переходить через північ

    if (endTime < startTime) {

        endTime.setDate(
            endTime.getDate() + 1
        );

    }

    const duration =
        Math.floor(
            (endTime - startTime)
            / 1000
            / 60
        );

    const response = await fetch(
        `/sleep/${editingId}`,
        {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                start_time:
                    formatLocalDate(startTime),

                end_time:
                    formatLocalDate(endTime),

                duration: duration,

                rating: editRating,

                mood: editMood,

                dream: editDream.value,

                note: editNote.value

            })

        }
    );

    if (!response.ok) {

        alert("Не вдалося оновити запис.");

        return;

    }

    alert("Запис успішно оновлено ✏️");

    editModal.style.display = "none";

    editingId = null;

    await loadHistory();

});


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


loadHistory();