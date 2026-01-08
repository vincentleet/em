import { dom } from "./dom.js";

export function openModal() {
  dom.modal.style.display = "flex";
}

export function closeModal() {
  dom.modal.style.display = "none";
}

export function showToast(text, duration = 2500) {
  dom.toast.textContent = text;
  dom.toast.classList.add("show");
  setTimeout(() => dom.toast.classList.remove("show"), duration);
}

export function appendMessage(text, sender) {
  const row = document.createElement("div");
  row.className = `message-row ${sender}`;

  const bubble = document.createElement("div");
  bubble.className = `bubble ${sender}`;

  bubble.innerHTML = `
    <span>${text}</span>
    <div class="meta-line">
      <span class="time">${getTime()}</span>
    </div>
  `;

  row.appendChild(bubble);
  dom.chatBody.appendChild(row);
  dom.chatBody.scrollTop = dom.chatBody.scrollHeight;
}

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}
