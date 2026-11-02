// Poster saya: every poster is kept in this browser's own database (IndexedDB), photos included.
// Nothing leaves the device. If the browser blocks storage (some private modes),
// posters live in memory until the page closes, and the home page says so.
const Store = (() => {
  let db = null, ok = false;
  const mem = new Map();

  function req(mode, fn) {
    return new Promise((resolve, reject) => {
      const t = db.transaction("posters", mode), r = fn(t.objectStore("posters"));
      t.oncomplete = () => resolve(r.result);
      t.onerror = t.onabort = () => reject(t.error);
    });
  }

  return {
    get ok() { return ok; },
    async init() {
      try {
        db = await new Promise((resolve, reject) => {
          const r = indexedDB.open("mu-studio", 1);
          r.onupgradeneeded = () => r.result.createObjectStore("posters", { keyPath: "id" });
          r.onsuccess = () => resolve(r.result);
          r.onerror = () => reject(r.error);
        });
        ok = true;
        // ask the browser not to clear our data when space runs low
        if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
      } catch { ok = false; }
    },
    all: () => (ok ? req("readonly", (s) => s.getAll()) : Promise.resolve([...mem.values()])),
    get: (id) => (ok ? req("readonly", (s) => s.get(id)) : Promise.resolve(mem.get(id))),
    put: (p) => (ok ? req("readwrite", (s) => s.put(p)) : Promise.resolve(mem.set(p.id, p))),
    del: (id) => (ok ? req("readwrite", (s) => s.delete(id)) : Promise.resolve(mem.delete(id))),

    // versions before 1.5 kept one draft per template in localStorage; turn each into a saved poster once
    async importOldDrafts(templates) {
      for (const id of Object.keys(templates)) {
        let data = null;
        try { data = JSON.parse(localStorage.getItem("mu:" + id) || "null"); } catch {}
        if (!data) continue;
        const now = Date.now();
        await this.put({ id: "p" + now.toString(36) + id, tpl: id, data, images: {}, thumb: "", created: now, updated: now });
        try { localStorage.removeItem("mu:" + id); } catch {}
      }
    },
  };
})();
