/**
 * Call flow – incoming call, active call (speakerphone UI, audio, timer), missed call
 */

const CallModule = {
  incomingEl: null,
  activeEl: null,
  audioEl: null,
  timerEl: null,
  timerInterval: null,
  timerSeconds: 0,
  autoAnswerTimeout: null,
  onAnswer: null,
  onDecline: null,
  onEnd: null,

  init() {
    this.incomingEl = document.getElementById('incoming-call');
    this.activeEl = document.getElementById('active-call');
    this.audioEl = document.getElementById('call-audio');

    if (!this.incomingEl || !this.activeEl || !this.audioEl) return;

    this.timerEl = document.getElementById('call-timer');
    const answerBtn = document.getElementById('call-answer');
    const declineBtn = document.getElementById('call-decline');
    const endBtn = document.getElementById('call-end');

    if (answerBtn) answerBtn.addEventListener('click', () => this.handleAnswer());
    if (endBtn) endBtn.addEventListener('click', () => this.handleEnd());

    this.audioEl.addEventListener('ended', () => this.handleAudioEnded());
    this.audioEl.addEventListener('error', () => {
      // If audio fails (e.g. file missing), let timer run a few seconds then end
      setTimeout(() => this.handleAudioEnded(), 3000);
    });
  },

  showIncoming(contactName = 'Rotorua Police', audioSrc) {
    this.incomingEl?.classList.add('active');
    this.incomingEl?.setAttribute('aria-hidden', 'false');
    document.getElementById('call-name')?.replaceChildren(contactName);
    const callAvatar = document.getElementById('call-avatar');
    if (callAvatar) {
      callAvatar.replaceChildren();
      const avatarSrc = typeof CONV !== 'undefined' && CONV.threads?.rotorua_police?.avatarImage
        ? CONV.threads.rotorua_police.avatarImage
        : null;
      if (avatarSrc) {
        const img = document.createElement('img');
        img.src = avatarSrc;
        img.alt = contactName;
        img.className = 'call-avatar-img';
        callAvatar.appendChild(img);
      }
    }
    if (audioSrc && this.audioEl) {
      this.audioEl.src = audioSrc;
      this.audioEl.play().catch(() => this.handleAudioEnded());
    }
    if (this.autoAnswerTimeout) clearTimeout(this.autoAnswerTimeout);
    this.autoAnswerTimeout = setTimeout(() => this.handleAnswer(), 8000);
  },

  hideIncoming() {
    if (this.autoAnswerTimeout) {
      clearTimeout(this.autoAnswerTimeout);
      this.autoAnswerTimeout = null;
    }
    this.incomingEl?.classList.remove('active');
    this.incomingEl?.setAttribute('aria-hidden', 'true');
  },

  showActive(contactName = 'Rotorua Police', audioSrc) {
    this.hideIncoming();
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
    }
    this.activeEl?.classList.add('active');
    this.activeEl?.setAttribute('aria-hidden', 'false');
    document.getElementById('active-call-name')?.replaceChildren(contactName);
    const activeAvatar = document.getElementById('active-call-avatar');
    if (activeAvatar) {
      activeAvatar.replaceChildren();
      const avatarSrc = typeof CONV !== 'undefined' && CONV.threads?.rotorua_police?.avatarImage
        ? CONV.threads.rotorua_police.avatarImage
        : null;
      if (avatarSrc) {
        const img = document.createElement('img');
        img.src = avatarSrc;
        img.alt = contactName;
        img.className = 'call-avatar-img';
        activeAvatar.appendChild(img);
      }
    }

    this.timerSeconds = 0;
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateTimerDisplay();
    }, 1000);

    if (audioSrc && this.audioEl) {
      this.audioEl.src = audioSrc;
      setTimeout(() => {
        this.audioEl.play().catch(() => this.handleAudioEnded());
      }, 1000);
    } else {
      setTimeout(() => this.handleAudioEnded(), 10000);
    }
  },

  updateTimerDisplay() {
    if (!this.timerEl) return;
    const m = Math.floor(this.timerSeconds / 60);
    const s = this.timerSeconds % 60;
    this.timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  },

  hideActive() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
      this.audioEl.removeAttribute('src');
    }
    this.activeEl?.classList.remove('active');
    this.activeEl?.setAttribute('aria-hidden', 'true');
  },

  handleAnswer() {
    if (typeof this.onAnswer === 'function') {
      this.onAnswer();
    }
  },

  handleDecline() {
    this.hideIncoming();
    if (typeof this.onDecline === 'function') {
      this.onDecline();
    }
  },

  playEndSound() {
    try {
      const audio = new Audio('assets/audio/phone-end.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 1300);
    } catch (_) {}
  },

  handleEnd() {
    this.playEndSound();
    this.hideActive();
    const fn = this.onEnd;
    this.onEnd = null;
    if (typeof fn === 'function') fn();
  },

  handleAudioEnded() {
    this.playEndSound();
    this.hideActive();
    const fn = this.onEnd;
    this.onEnd = null;
    if (typeof fn === 'function') fn();
  },
};
