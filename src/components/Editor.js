export class Editor {
  constructor(root, store) {
    this.root = root;
    this.store = store;
    this.unsubscribe = null;
    this.textarea = null;
  }

  mount() {
    this.root.classList.add('editor-pane');

    const header = document.createElement('div');
    header.className = 'editor-pane__header';
    header.innerHTML = '<h2>Editor</h2>';

    const textarea = document.createElement('textarea');
    textarea.className = 'editor-pane__input';
    textarea.setAttribute('aria-label', 'Markdown editor');
    textarea.value = this.store.getState('markdown') ?? '';

    textarea.addEventListener('input', (event) => {
      this.store.update('markdown', event.target.value);
    });

    this.unsubscribe = this.store.subscribe('markdown', (markdown) => {
      if (textarea.value !== markdown) {
        textarea.value = markdown ?? '';
      }
    });

    this.textarea = textarea;

    this.root.replaceChildren(header, textarea);
  }

  focus() {
    if (this.textarea) {
      this.textarea.focus();
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
