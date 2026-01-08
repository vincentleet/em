import { appendMessage } from "./ui.js";
import { dom } from "./dom.js";
import { playRing, playVoice, playEnd } from "./audio.js";
import { ermaLog } from "./erma.js";

const escapeScript = [
  { sender: "me", text: "Can you get the door code?" },
  { sender: "them", text: "I’ve got it. The code is 5291." }
];

export function startEscapeBranch() {
  let i = 0;
  function next() {
    if (i >= escapeScript.length) {
      ermaLog("CONVERSATION_ENDED");
      return;
    }
    appendMessage(escapeScript[i].text, escapeScript[i].sender);
    i++;
    setTimeout(next, 800);
  }
  next();
}

export function startPoliceBranch() {
  dom.callOverlay.style.display = "flex";
  playRing();

  setTimeout(() => {
    playVoice();
  }, 5000);

  setTimeout(() => {
    dom.callOverlay.style.display = "none";
    playEnd();
    startPoliceChat();
  }, 13000);
}

function startPoliceChat() {
  dom.avatar.innerHTML = `<img src="assets/rotorua_police.png">`;
  dom.chatName.textContent = "Rotorua Police";
  dom.chatStatus.textContent = "online";

  // dom.chatBody.innerHTML = `<div class="date-divider">Today</div>`;

  [
    "Thank you for reporting the robbery.",
    "Exit code is 5291.",
    "A unit is on the way."
  ].forEach((msg, i) =>
    setTimeout(() => appendMessage(msg, "them"), i * 1200)
  );
}
