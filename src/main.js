import { Store } from './state/store.js';
import { Editor } from './components/Editor.js';
import { Preview } from './components/Preview.js';
import { NotebookSidebar } from './components/NotebookSidebar.js';
import { Toolbar } from './components/Toolbar.js';

const store = new Store({
  markdown: '# Welcome to the Markdown Notebook\n\nStart typing on the left to see a live preview.',
  notes: [],
  activeNoteId: null,
});

function bootstrap() {
  const editorRoot = document.getElementById('editor-root');
  const previewRoot = document.getElementById('preview-root');
  const notebookRoot = document.getElementById('notebook-root');
  const toolbarRoot = document.getElementById('toolbar-root');

  if (!editorRoot || !previewRoot || !notebookRoot || !toolbarRoot) {
    throw new Error('Unable to locate application mount points.');
  }

  const editor = new Editor(editorRoot, store);
  const preview = new Preview(previewRoot, store);
  const notebook = new NotebookSidebar(notebookRoot, store);
  const toolbar = new Toolbar(toolbarRoot, store, {
    editor,
    preview,
    notebook,
  });

  editor.mount();
  preview.mount();
  notebook.mount();
  toolbar.mount();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
