/**
 * Escape Room WhatsApp – main app
 */

(function () {
  // Apply admin edits from localStorage (if any)
  if (typeof CONV !== 'undefined') {
    try {
      const stored = localStorage.getItem('em_rotorua_conv_edits');
      if (stored) {
        const edits = JSON.parse(stored);
        const setByPath = (path, text) => {
          if (path.startsWith('j0_batch.batch.')) {
            const i = parseInt(path.split('.')[2], 10);
            const obj = CONV.steps.j0_batch?.batch?.[i]?.message;
            if (obj) obj.text = text;
          } else {
            const obj = CONV.steps[path]?.message;
            if (obj) obj.text = text;
          }
        };
        Object.entries(edits).forEach(([path, text]) => setByPath(path, text));
      }
    } catch (_) {}
  }

  const logEvent = (typeof FirebaseLogger !== 'undefined' && typeof FirebaseLogger.log === 'function')
    ? (...args) => FirebaseLogger.log(...args)
    : () => {};
  const startScreen = document.getElementById('start-screen');
  const chatScreen = document.getElementById('chat-screen');
  const chatMessages = document.getElementById('chat-messages');
  const chatScrollArea = () => chatMessages?.closest('.chat-scroll-area');

  function scrollChatToBottom() {
    requestAnimationFrame(() => {
      const area = chatScrollArea();
      if (area) area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
    });
  }

  const BUBBLE_SOUND = 'assets/audio/bubble.mp3';
  function playBubbleSound() {
    try {
      const audio = new Audio(BUBBLE_SOUND);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (_) {}
  }
  const startBtn = document.getElementById('start-btn');
  const decisionModal = document.getElementById('decision-modal');
  const decisionForm = document.getElementById('decision-form');
  const modalSelect = document.getElementById('modal-select');

  let state = {
    currentStep: null,
    currentThread: 'jimmy',
    history: [],
    waitingForChoice: false,
  };

  function formatTime(date = new Date()) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  function formatDate(date = new Date()) {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'TODAY';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
  }

  function setStartScreenTimes() {
    const now = new Date();
    document.getElementById('start-date')?.replaceChildren(formatDate(now));
    const t = formatTime(now);
    document.getElementById('notif-time-1')?.replaceChildren(t);
    document.getElementById('notif-time-2')?.replaceChildren(t);
  }

  function showChatScreen() {
    startScreen?.classList.remove('active');
    chatScreen?.classList.add('active');
    updateHeader();
    runStep(CONV.startStep);
  }

  function updateHeader() {
    const thread = CONV.threads[state.currentThread];
    if (!thread) return;
    document.getElementById('header-name')?.replaceChildren(thread.name);
    document.getElementById('header-status')?.replaceChildren(thread.status === 'online' ? 'online' : `today at ${formatTime()}`);
    const avatar = document.getElementById('header-avatar');
    if (avatar) {
      avatar.className = 'header-avatar' + (state.currentThread === 'rotorua_police' ? ' header-avatar-police' : '');
      avatar.replaceChildren();
      if (thread.avatarImage) {
        const img = document.createElement('img');
        img.src = thread.avatarImage;
        img.alt = thread.name;
        img.className = 'header-avatar-img';
        avatar.appendChild(img);
      }
    }
  }

  function clearChat() {
    if (!chatMessages) return;
    chatMessages.replaceChildren();
  }

  function switchToNewConversation(threadId, thenRunStep) {
    state.currentThread = threadId;
    clearChat();
    updateHeader();
    if (thenRunStep) runStep(thenRunStep);
  }

  function appendMessage(text, from, isRead = false, playSound = true) {
    const row = document.createElement('div');
    row.className = `message-row ${from === 'player' ? 'sent' : 'received'}`;
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${from === 'player' ? 'sent' : 'received'}`;
    bubble.textContent = text;
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = formatTime();
    meta.appendChild(time);
    if (isRead && from === 'player') {
      const read = document.createElement('span');
      read.className = 'message-read';
      read.innerHTML = '✓✓';
      meta.appendChild(read);
    }
    bubble.appendChild(meta);
    row.appendChild(bubble);
    chatMessages?.appendChild(row);
    if (playSound) playBubbleSound();
    scrollChatToBottom();
  }

  function appendMissedCall() {
    const row = document.createElement('div');
    row.className = 'message-row';
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble missed-call';
    bubble.innerHTML = `
      <span class="missed-call-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
      </span>
      <span class="missed-call-text">Missed call at ${formatTime()}<span class="missed-call-tap">Tap to call back</span></span>
    `;
    row.appendChild(bubble);
    chatMessages?.appendChild(row);
    scrollChatToBottom();
  }

  function appendDateSeparator() {
    const row = document.createElement('div');
    row.className = 'date-separator';
    row.innerHTML = `<span>${formatDate()}</span>`;
    chatMessages?.appendChild(row);
  }

  function appendReplyButton(onClick) {
    const wrap = document.createElement('div');
    wrap.className = 'message-row reply-btn-row';
    wrap.innerHTML = '<button class="reply-btn">Reply</button>';
    wrap.querySelector('.reply-btn').addEventListener('click', onClick);
    chatMessages?.appendChild(wrap);
    scrollChatToBottom();
  }

  function showDecisionModal() {
    state.waitingForChoice = true;
    decisionModal?.classList.add('active');
    decisionModal?.setAttribute('aria-hidden', 'false');
    decisionForm?.reset();
    modalSelect.disabled = true;
  }

  function hideDecisionModal() {
    state.waitingForChoice = false;
    decisionModal?.classList.remove('active');
    decisionModal?.setAttribute('aria-hidden', 'true');
  }

  function runStep(stepId) {
    if (!stepId) return;
    const step = CONV.steps[stepId];
    if (!step) return;

    if (step.threadId && step.threadId !== state.currentThread) {
      state.currentThread = step.threadId;
      updateHeader();
    }

    if (step.batch) {
      step.batch.forEach((item) => {
        if (item.missedCall) {
          appendMissedCall();
        } else if (item.message) {
          appendMessage(item.message.text, item.message.from, false, false);
        }
      });
      runStep(step.next);
      return;
    }

    if (step.missedCall) {
      appendMissedCall();
      setTimeout(() => runStep(step.next), 500);
      return;
    }

    if (step.triggerCall) {
      const contactId = step.callContact || step.threadId;
      const contactName = CONV.threads[contactId]?.name || 'Rotorua Police';
      const ringAudio = 'assets/audio/phone-ring.mp3';
      const callAudio = 'assets/audio/police-call.mp3';
      CallModule.showIncoming(contactName, ringAudio);
      CallModule.onAnswer = () => {
        logEvent('call_answered', { branch: 'call_police' });
        CallModule.showActive(contactName, callAudio);
        CallModule.onEnd = () => {
          switchToNewConversation(step.threadId, step.next);
        };
      };
      CallModule.onDecline = () => {
        logEvent('call_declined', { branch: 'call_police' });
        const declineNext = step.declineNext || step.next;
        if (declineNext) switchToNewConversation(step.threadId, declineNext);
      };
      return;
    }

    if (step.choices) {
      appendReplyButton(() => showDecisionModal());
      return;
    }

    if (step.message) {
      const duration = step.typingDuration || 0;
      const pauseAfter = step.pauseAfter ?? 1000;
      const delayBefore = step.delayBefore ?? 0;
      const doAppend = () => {
        appendMessage(step.message.text, step.message.from);
        setTimeout(() => runStep(step.next), pauseAfter);
      };
      if (duration > 0) {
        TypingIndicator.init(chatMessages);
        TypingIndicator.show();
        setTimeout(() => {
          TypingIndicator.hide();
          doAppend();
        }, duration);
      } else if (delayBefore > 0) {
        setTimeout(doAppend, delayBefore);
      } else {
        doAppend();
      }
      return;
    }

    runStep(step.next);
  }

  function handleChoice(branchId) {
    hideDecisionModal();
    logEvent('branch_selected', { branchId });

    const nextStepId = CONV.branches[branchId];
    if (!nextStepId) return;

    if (branchId === 'call_police') {
      runStep(nextStepId);
      return;
    }

    if (branchId === 'escape_with_jimmy') {
      document.querySelector('.reply-btn-row')?.remove();
      runStep(nextStepId);
      return;
    }

    runStep(nextStepId);
  }

  function init() {
    setStartScreenTimes();
    TypingIndicator.init(chatMessages);
    CallModule.init();

    if (typeof FirebaseLogger !== 'undefined') {
      FirebaseLogger.init?.();
    }

    startBtn?.addEventListener('click', () => {
      logEvent('start_tapped');
      showChatScreen();
    });

    decisionForm?.querySelectorAll('input[name="choice"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        modalSelect.disabled = false;
      });
    });

    modalSelect?.addEventListener('click', () => {
      const selected = decisionForm?.querySelector('input[name="choice"]:checked');
      if (selected) {
        handleChoice(selected.value);
      }
    });

    decisionModal?.addEventListener('click', (e) => {
      if (e.target === decisionModal) hideDecisionModal();
    });

    let backTapCount = 0;
    let backTapReset = null;
    document.querySelector('.header-back')?.addEventListener('click', () => {
      backTapCount++;
      if (backTapReset) clearTimeout(backTapReset);
      backTapReset = setTimeout(() => { backTapCount = 0; backTapReset = null; }, 5000);
      if (backTapCount >= 10) {
        location.reload();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
