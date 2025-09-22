export class NotebookSidebar {
  constructor(root, store) {
    this.root = root;
    this.store = store;
    this.unsubscribe = null;
    this.list = null;
  }

  mount() {
    this.root.classList.add('notebook-sidebar');

    const header = document.createElement('div');
    header.className = 'notebook-sidebar__header';
    header.innerHTML = '<h2>Notebook</h2>';

    const hint = document.createElement('p');
    hint.className = 'notebook-sidebar__hint';
    hint.textContent = 'Save notes from the toolbar to build your notebook.';

    const list = document.createElement('ul');
    list.className = 'notebook-sidebar__list';
    list.setAttribute('role', 'listbox');

    list.addEventListener('click', (event) => {
      const target = event.target.closest('[data-note-id]');
      if (!target) return;
      const noteId = target.getAttribute('data-note-id');
      this.#activateNote(noteId);
    });

    this.list = list;
    this.root.replaceChildren(header, hint, list);

    this.unsubscribe = this.store.subscribe('*', (_, state) => {
      this.render(state.notes ?? [], state.activeNoteId);
    });

    const initialState = this.store.getState();
    this.render(initialState.notes ?? [], initialState.activeNoteId);
  }

  render(notes, activeNoteId) {
    if (!this.list) return;

    if (!notes.length) {
      this.list.innerHTML =
        '<li class="notebook-sidebar__empty" aria-disabled="true">No saved notes yet.</li>';
      return;
    }

    const items = notes
      .map((note) => {
        const isActive = note.id === activeNoteId;
        const classes = ['notebook-sidebar__item'];
        if (isActive) {
          classes.push('is-active');
        }
        const date = new Date(note.updatedAt).toLocaleString();
        return `
          <li class="${classes.join(' ')}" data-note-id="${note.id}" role="option" aria-selected="${isActive}">
            <div class="notebook-sidebar__item-title">${note.title}</div>
            <div class="notebook-sidebar__item-meta">${date}</div>
          </li>
        `;
      })
      .join('');

    this.list.innerHTML = items;
  }

  #activateNote(noteId) {
    if (!noteId) return;
    this.store.setState((state) => {
      const note = (state.notes ?? []).find((item) => item.id === noteId);
      if (!note) {
        return {};
      }
      return {
        markdown: note.content,
        activeNoteId: note.id,
      };
    });
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
