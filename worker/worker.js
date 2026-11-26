(function () {
  const WORKER_URL = "https://adhkar.abdcode.workers.dev";
  const KEY_STORAGE = "abdcode_vapid_p256_v1";

  function b64uToBytes(str) {
    const clean = String(str || "").trim().replace(/-/g, "+").replace(/_/g, "/");
    const pad = "=".repeat((4 - (clean.length % 4)) % 4);
    const bin = atob(clean + pad);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function bytesToB64u(bytes) {
    let bin = "";
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  async function getOrCreateVapidKeys() {
    const saved = localStorage.getItem(KEY_STORAGE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.publicKey && parsed.privateKey) return parsed;
      } catch {}
    }
    const pair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign"]
    );
    const rawPub = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
    const jwkPriv = await crypto.subtle.exportKey("jwk", pair.privateKey);
    const keys = {
      publicKey: bytesToB64u(rawPub),
      privateKey: jwkPriv.d
    };
    localStorage.setItem(KEY_STORAGE, JSON.stringify(keys));
    return keys;
  }

  function collectLiveSettings() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem("adhkar_settings") || "{}") || {};
    } catch {
      saved = {};
    }

    const settings = {
      morning: {
        on: Boolean(saved.morning?.on),
        t: String(saved.morning?.t || "").slice(0, 5)
      },
      evening: {
        on: Boolean(saved.evening?.on),
        t: String(saved.evening?.t || "").slice(0, 5)
      },
      sleep: {
        on: Boolean(saved.sleep?.on),
        t: String(saved.sleep?.t || "").slice(0, 5)
      }
    };

    document.querySelectorAll("input, select").forEach((el) => {
      const id = (el.id || el.name || "").toLowerCase();
      const key = id.includes("morn")
        ? "morning"
        : id.includes("even")
        ? "evening"
        : id.includes("sleep") || id.includes("night")
        ? "sleep"
        : null;
      if (!key) return;

      if (el.type === "checkbox") {
        settings[key].on = Boolean(el.checked);
      } else if (el.value) {
        settings[key].t = String(el.value).slice(0, 5);
      }
    });

    return settings;
  }

  window.syncAdhkarSchedule = async function (customSub) {
    if (!("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = customSub || (await reg.pushManager.getSubscription());
    if (!sub) return;

    const vapid = await getOrCreateVapidKeys();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jerusalem";
    const settings = collectLiveSettings();

    await fetch(`${WORKER_URL}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sub: sub.toJSON ? sub.toJSON() : sub,
        vapid,
        settings,
        tz
      })
    });
  };

  window.enableAdhkarPush = async function () {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return;

    const reg = await navigator.serviceWorker.ready;
    const vapid = await getOrCreateVapidKeys();
    const existing = await reg.pushManager.getSubscription();
    if (existing) await existing.unsubscribe();

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: b64uToBytes(vapid.publicKey)
    });

    await window.syncAdhkarSchedule(sub);
  };

  window.addEventListener("change", () => {
    window.syncAdhkarSchedule().catch(() => {});
  });

  window.addEventListener("input", () => {
    window.syncAdhkarSchedule().catch(() => {});
  });
})();
