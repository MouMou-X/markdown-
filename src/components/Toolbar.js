function deriveTitle(markdown) {
  if (!markdown) {
    return 'Untitled note';
  }
  const firstLine = markdown.trim().split(/\n/)[0] ?? '';
  const clean = firstLine.replace(/^#+\s*/, '').trim();
  return clean.length ? clean.slice(0, 80) : 'Untitled note';
}

function downloadMarkdown(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export class Toolbar {
  constructor(root, store) {
    this.root = root;
    this.store = store;
    this.unsubscribe = null;
    this.buttons = {};
  }

  mount() {
    this.root.classList.add('toolbar');

    const title = document.createElement('h1');
    title.className = 'toolbar__title';
    title.textContent = 'Markdown Notebook';

    const actions = document.createElement('div');
    actions.className = 'toolbar__actions';

    const buttons = [
      { key: 'new', label: 'New note', handler: () => this.#handleNewNote() },
      { key: 'save', label: 'Save note', handler: () => this.#handleSaveNote() },
      { key: 'delete', label: 'Delete note', handler: () => this.#handleDeleteNote() },
      { key: 'export', label: 'Download', handler: () => this.#handleDownload() },
    ];

    buttons.forEach(({ key, label, handler }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'toolbar__button';
      button.textContent = label;
      button.addEventListener('click', handler);
      this.buttons[key] = button;
      actions.appendChild(button);
    });

    this.root.replaceChildren(title, actions);

    this.unsubscribe = this.store.subscribe('*', (_, state) => {
      this.#syncButtonStates(state);
    });
    this.#syncButtonStates(this.store.getState());
  }

  #syncButtonStates(state) {
    const hasActive = Boolean(state.activeNoteId);
    const hasContent = Boolean((state.markdown ?? '').trim().length);
    if (this.buttons.delete) {
      this.buttons.delete.disabled = !hasActive;
    }
    if (this.buttons.save) {
      this.buttons.save.disabled = !hasContent;
    }
    if (this.buttons.export) {
      this.buttons.export.disabled = !hasContent;
    }
  }

  #handleNewNote() {
    this.store.setState({ markdown: '', activeNoteId: null });
  }

  #handleSaveNote() {
    const state = this.store.getState();
    const markdown = state.markdown ?? '';
    const generateId = () =>
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `note-${Date.now()}`;
    const id = state.activeNoteId ?? generateId();
    const note = {
      id,
      title: deriveTitle(markdown),
      content: markdown,
      updatedAt: new Date().toISOString(),
    };

    const nextNotes = Array.isArray(state.notes) ? [...state.notes] : [];
    const existingIndex = nextNotes.findIndex((item) => item.id === id);
    if (existingIndex >= 0) {
      nextNotes[existingIndex] = note;
    } else {
      nextNotes.unshift(note);
    }

    this.store.setState({
      notes: nextNotes,
      activeNoteId: id,
    });
  }

  #handleDeleteNote() {
    const state = this.store.getState();
    if (!state.activeNoteId) return;
    const remaining = (state.notes ?? []).filter(
      (note) => note.id !== state.activeNoteId,
    );
    this.store.setState({
      notes: remaining,
      activeNoteId: null,
      markdown: '',
    });
  }

  #handleDownload() {
    const state = this.store.getState();
    const markdown = state.markdown ?? '';
    if (!markdown.trim()) return;
    const title = deriveTitle(markdown).replace(/\s+/g, '-').toLowerCase();
    const filename = `${title || 'note'}.md`;
    downloadMarkdown(filename, markdown);
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    Object.values(this.buttons).forEach((button) => {
      button.replaceWith(button.cloneNode(true));
    });
    this.buttons = {};
  }
}
