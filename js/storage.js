const memory = new Map();
const timers = new Map();

function read(key, fallback) {
  if (memory.has(key)) return memory.get(key);
  try {
    const raw = localStorage.getItem(key);
    const value = raw == null ? fallback : JSON.parse(raw);
    memory.set(key, value);
    return value;
  } catch {
    memory.set(key, fallback);
    return fallback;
  }
}

function persist(key) {
  timers.delete(key);
  try { localStorage.setItem(key, JSON.stringify(memory.get(key))); } catch { /* storage may be unavailable */ }
}

export const storage = {
  get: read,
  set(key, value, { debounce = 120 } = {}) {
    memory.set(key, value);
    clearTimeout(timers.get(key));
    if (debounce === 0) persist(key);
    else timers.set(key, setTimeout(() => persist(key), debounce));
    return value;
  },
  update(key, fallback, updater, options) {
    return this.set(key, updater(read(key, fallback)), options);
  },
  remove(key) {
    memory.delete(key);
    clearTimeout(timers.get(key));
    timers.delete(key);
    localStorage.removeItem(key);
  },
  flush() {
    for (const key of timers.keys()) {
      clearTimeout(timers.get(key));
      persist(key);
    }
  }
};

addEventListener('pagehide', () => storage.flush());
