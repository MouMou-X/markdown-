let rendererPromise = null;

async function getRenderer() {
  if (!rendererPromise) {
    rendererPromise = import(
      'https://cdn.jsdelivr.net/npm/marked@12.0.1/lib/marked.esm.js'
    ).then((module) => {
      const { marked } = module;
      marked.use({
        breaks: true,
        gfm: true,
      });
      return marked;
    });
  }
  return rendererPromise;
}

export class Preview {
  constructor(root, store) {
    this.root = root;
    this.store = store;
    this.unsubscribe = null;
    this.content = null;
  }

  mount() {
    this.root.classList.add('preview-pane');

    const header = document.createElement('div');
    header.className = 'preview-pane__header';
    header.innerHTML = '<h2>Preview</h2>';

    const content = document.createElement('article');
    content.className = 'preview-pane__content';
    content.innerHTML = '<p>Loading preview...</p>';

    this.content = content;
    this.root.replaceChildren(header, content);

    this.unsubscribe = this.store.subscribe('markdown', (markdown) => {
      this.render(markdown ?? '');
    });

    this.render(this.store.getState('markdown') ?? '');
  }

  async render(markdown) {
    try {
      const marked = await getRenderer();
      this.content.innerHTML = marked.parse(markdown);
    } catch (error) {
      console.error('Failed to render markdown preview', error);
      this.content.innerHTML =
        '<p class="preview-pane__error">Unable to load Markdown renderer. Check your connection and try again.</p>';
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
