const ring = document.getElementById("ringAudio");
const voice = document.getElementById("voiceAudio");
const end = document.getElementById("endAudio");

function safePlay(audio) {
  try {
    audio.currentTime = 0;
    audio.play();
  } catch {}
}

export function playRing() {
  safePlay(ring);
}

export function playVoice() {
  safePlay(voice);
}

export function playEnd() {
  safePlay(end);
}
