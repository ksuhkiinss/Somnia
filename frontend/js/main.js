console.log("JS працює!");
const button = document.getElementById("sleepButton");
const buttonText = document.getElementById("buttonText");
const timer = document.getElementById("sleepTimer");

let sleeping = false;
let startTime;
let interval;

button.addEventListener("click", () => {

    if (!sleeping) {

        sleeping = true;

        startTime = new Date();

        buttonText.textContent = "Прокинувся";

        button.style.background = "#8B5CF6";

        button.style.color = "white";

        interval = setInterval(updateTimer, 1000);

    } else {

        sleeping = false;

        clearInterval(interval);

        buttonText.textContent = "Почати сон";

        button.style.background = "";

        button.style.color = "";

        timer.textContent = "😴 Сон завершено";

    }

});

function updateTimer(){

    const now = new Date();

    const diff = now - startTime;

    const hours = Math.floor(diff / 1000 / 60 / 60);

    const minutes = Math.floor(diff / 1000 / 60) % 60;

    const seconds = Math.floor(diff / 1000) % 60;

    timer.textContent =
        `😴 Сон триває ${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;

}