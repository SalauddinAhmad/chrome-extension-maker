// Minimal chrome.* shim so popup.js runs inside a preview iframe (no extension APIs).
(function () {
  const store = {};
  window.chrome = {
    runtime: {
      getURL: (p) => new URL(p, location.href).toString(),
      sendMessage: () => {},
      onMessage: { addListener: () => {} },
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
        async remove(k) { delete store[Array.isArray(k) ? k[0] : k]; },
      },
    },
    alarms: {
      create: () => {},
      clear: () => {},
      clearAll: () => {},
      get: async () => null,
      onAlarm: { addListener: () => {} },
    },
    notifications: { create: () => {}, clear: () => {} },
    idle: { queryState: (_s, cb) => cb && cb("active"), onStateChanged: { addListener: () => {} } },
    offscreen: { hasDocument: async () => false, createDocument: async () => {}, closeDocument: async () => {} },
  };
})();
