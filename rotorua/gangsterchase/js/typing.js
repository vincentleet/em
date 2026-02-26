/**
 * Typing indicator – three animated dots in a bubble
 */

const TypingIndicator = {
  container: null,
  element: null,

  init(container) {
    this.container = container;
    this.element = document.createElement('div');
    this.element.className = 'message-row';
    this.element.setAttribute('aria-live', 'polite');
    this.element.innerHTML = `
      <div class="typing-bubble" role="status" aria-label="Typing">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
  },

  show() {
    if (!this.container || !this.element) return;
    this.container.appendChild(this.element);
    requestAnimationFrame(() => {
      const scrollArea = this.container.closest('.chat-scroll-area');
      if (scrollArea) scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: 'smooth' });
    });
  },

  hide() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
  },

  isVisible() {
    return this.element && this.element.parentNode;
  },
};
