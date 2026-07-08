// Minimal chrome.* shim so the sidepanel runs inside a preview iframe.
(function () {
  const store = {};
  window.chrome = {
    runtime: {
      getURL: (p) => new URL(p, location.href).toString(),
      sendMessage: (_m, cb) => { if (cb) cb({}); },
      onMessage: { addListener: () => {} },
      lastError: null,
    },
    storage: {
      local: {
        async get(keys) {
          if (!keys) return { ...store };
          const arr = Array.isArray(keys) ? keys : typeof keys === "string" ? [keys] : Object.keys(keys);
          const out = {};
          arr.forEach((k) => {
            if (k in store) out[k] = store[k];
            else if (keys && typeof keys === "object" && !Array.isArray(keys)) out[k] = keys[k];
          });
          return out;
        },
        async set(obj) { Object.assign(store, obj); },
        async remove(k) { (Array.isArray(k) ? k : [k]).forEach((x) => delete store[x]); },
        async clear() { Object.keys(store).forEach((k) => delete store[k]); },
      },
      sync: {
        async get() { return {}; },
        async set() {},
      },
    },
    tabs: {
      query: async () => [{ id: 1, url: location.href, title: document.title }],
      sendMessage: (_id, _m, cb) => { if (cb) cb({}); },
    },
    scripting: {
      executeScript: async () => [{ result: null }],
    },
    alarms: {
      create: () => {}, clear: () => {}, clearAll: () => {},
      get: async () => null, getAll: async () => [],
      onAlarm: { addListener: () => {} },
    },
    notifications: { create: () => {}, clear: () => {} },
  };
})();
