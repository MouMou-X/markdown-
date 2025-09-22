# Markdown Notebook

A modular, browser-based notebook for authoring Markdown with live preview.

## Getting started

Open `src/index.html` in any modern browser. The application is built with native ES Modules and does not require a build step.

## Architecture overview

The UI is composed of four top-level regions that are wired together through a shared state store:

| Component | Location | Responsibility |
| --- | --- | --- |
| `Toolbar` | `src/components/Toolbar.js` + `src/styles/toolbar.css` | Global actions for creating, saving, deleting and exporting notes. Keeps buttons in sync with the editor state. |
| `NotebookSidebar` | `src/components/NotebookSidebar.js` + `src/styles/notebook-sidebar.css` | Displays saved notes, allows activation of a note which loads its content into the editor and preview. |
| `Editor` | `src/components/Editor.js` + `src/styles/editor.css` | Textarea-based Markdown editor that publishes user input back into the store. |
| `Preview` | `src/components/Preview.js` + `src/styles/preview.css` | Renders live Markdown preview using the [`marked`](https://marked.js.org/) renderer loaded on demand from a CDN. |

Shared layout primitives live in `src/styles/layout.css`. The entry point that wires all components together is `src/main.js`.

### Data flow

- `src/state/store.js` implements a minimal observable store with `subscribe`, `getState`, and `setState` APIs.
- `Editor` pushes Markdown changes into the store (`markdown` key). Other components subscribe to the `markdown` channel and react automatically.
- `Toolbar` mutates the store for note management (`notes` and `activeNoteId`).
- `NotebookSidebar` listens for store updates to render the notebook list, and writes to `markdown`/`activeNoteId` when a note is activated.
- `Preview` subscribes to `markdown` updates and re-renders via `marked`.

The store notifies both key-specific listeners and global (`*`) listeners, keeping components decoupled yet coordinated.

### Styling system

Each component owns a dedicated CSS module using a shared design token palette (`--color-*` variables) defined in `layout.css`. This keeps visual rules modular while ensuring consistency across the app. Layout CSS uses responsive grid and flex utilities so the notebook adapts from large screens to mobile.

### Extending the system

- **Add new UI widgets**: create another component module under `src/components/`, pair it with a scoped stylesheet in `src/styles/`, and register it inside `src/main.js`.
- **Enhance state**: extend the store's initial state in `src/main.js` and leverage `store.setState()` to broadcast updates. Because listeners are keyed, you can introduce new channels without affecting existing ones.
- **Persist notes**: hook into the store inside `Toolbar` or `NotebookSidebar` to save/load notes from `localStorage` or an API.
- **Custom renderers**: swap the Markdown renderer by updating `Preview.js`. The component awaits a renderer module and injects generated HTML, so replacing `marked` or adding syntax highlighting is straightforward.

## License

MIT
