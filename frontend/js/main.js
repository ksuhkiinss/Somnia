console.log("JS працює!");
const button = document.getElementById("sleepButton");
const buttonText = document.getElementById("buttonText");
const timer = document.getElementById("sleepTimer");

let sleeping = false;
let startTime;
let interval;
let hours = 0;
let minutes = 0;

button.addEventListener("click", () => {

    if (!sleeping) {

        sleeping = true;

        startTime = new Date();

        localStorage.setItem("sleepStart", startTime.toISOString());

        buttonText.textContent = "Прокинувся";

        button.style.background = "#8B5CF6";

        button.style.color = "white";

        interval = setInterval(updateTimer, 1000);

    } 

    else {

    sleeping = false;

    clearInterval(interval);
    localStorage.removeItem("sleepStart");

    buttonText.textContent = "Почати сон";

    button.style.background = "";

    button.style.color = "";

    timer.textContent = "😴 Сон завершено";
console.log("Відкриваю модальне вікно");
    // показуємо модальне вікно
    document.getElementById("sleepModal").style.display = "flex";

    // показуємо тривалість
    document.getElementById("modalDuration").textContent =
        `Ви спали ${hours} год ${minutes} хв`;

}

});

function updateTimer(){

    const now = new Date();

    const diff = now - startTime;

    hours = Math.floor(diff / 1000 / 60 / 60);
    minutes = Math.floor(diff / 1000 / 60) % 60;
    const seconds = Math.floor(diff / 1000) % 60;

    timer.innerHTML = `
    😴 Сон триває<br><br>
    ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}
`;
}
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

const closeButton = document.querySelector(".close-modal");

if (closeButton) {

    closeButton.addEventListener("click", () => {

        document.getElementById("sleepModal").style.display = "none";

    });

}