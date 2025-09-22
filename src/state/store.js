export class Store {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.listeners = new Map();
  }

  subscribe(key, callback) {
    const channel = key ?? '*';
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    const callbacks = this.listeners.get(channel);
    callbacks.add(callback);

    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(channel);
      }
    };
  }

  getState(key) {
    if (typeof key === 'string') {
      return this.state[key];
    }
    return { ...this.state };
  }

  setState(updater) {
    const updates =
      typeof updater === 'function' ? updater(this.getState()) : { ...updater };

    if (!updates || typeof updates !== 'object') {
      return;
    }

    const changedKeys = [];
    Object.entries(updates).forEach(([key, value]) => {
      if (!Object.is(this.state[key], value)) {
        this.state[key] = value;
        changedKeys.push(key);
      }
    });

    changedKeys.forEach((key) => this.#notify(key));
    if (changedKeys.length > 0) {
      this.#notify('*');
    }
  }

  update(key, value) {
    if (typeof key !== 'string') return;
    this.setState({ [key]: value });
  }

  #notify(key) {
    const callbacks = this.listeners.get(key);
    if (!callbacks) return;
    callbacks.forEach((callback) => {
      try {
        callback(this.getState(key), this.getState());
      } catch (error) {
        console.error('Store listener failed', error);
      }
    });
  }
}
