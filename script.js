function padZero(num) {
  return num < 10 ? "0" + num : num;
}

// Fungsi untuk mengupdate jam
function updateClock() {
  const clockElement = document.getElementById("clock");
  const now = new Date();
  const hours = padZero(now.getHours());
  const minutes = padZero(now.getMinutes());
  const seconds = padZero(now.getSeconds());

  clockElement.textContent = `${hours}:${minutes}:${seconds}`;
}

// Fungsi untuk mengatur ucapan selamat
function setGreeting() {
  const greetingElement = document.getElementById("greeting");
  const hour = new Date().getHours();

  if (hour < 12) {
    greetingElement.textContent = "Selamat Pagi!";
  } else if (hour < 15) {
    greetingElement.textContent = "Selamat Siang!";
  } else if (hour < 18) {
    greetingElement.textContent = "Selamat Sore!";
  } else {
    greetingElement.textContent = "Selamat Malam!";
  }
}

setGreeting();
updateClock();

setInterval(updateClock, 1000);

document.getElementById("search-input").focus();
