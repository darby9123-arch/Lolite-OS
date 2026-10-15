/* Lolite Browser account gate. Uses the existing Lolite Chat Supabase Auth accounts. */
(() => {
  "use strict";
  const SUPABASE_URL = "https://rztxhwfdbrzuhdqpegar.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_I3eswNK0zu8qQvDp1Kcfbw_zZzzi18u";
  let client = null;
  const getClient = () => {
    if (!client && window.supabase?.createClient) {
      client = window.supabase.createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
      });
    }
    return client;
  };
  const isLocalBackend = () => location.hostname === "localhost" ||
    (!location.hostname.endsWith("github.io") && !!location.hostname);
  const showMessage = (container, message, error = false) => {
    const element = container.querySelector(".lb-account-message");
    if (element) {
      element.textContent = message;
      element.style.color = error ? "#ff9ca9" : "#c7d6e9";
    }
  };
  async function syncServerSession(session) {
    if (!isLocalBackend()) return false;
    // The same-origin Node backend verifies the Supabase access token; no passwords are sent to it.
    try {
      const response = await fetch("/api/browser/session", {
        method: session ? "POST" : "DELETE",
        credentials: "same-origin",
        cache: "no-store",
        headers: session ? { Authorization: "Bearer " + session.access_token } : {}
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  let lastSyncedToken = null;
  async function syncCurrentSession(session) {
    if (!session?.access_token) {
      lastSyncedToken = null;
      return syncServerSession(null);
    }
    if (lastSyncedToken === session.access_token) return true;
    const synced = await syncServerSession(session);
    if (synced) lastSyncedToken = session.access_token;
    return synced;
  }
  async function guard(content, resume) {
    const supabase = getClient();
    if (!supabase) {
      renderGate(content, resume, "Account sign-in is temporarily unavailable. Reload Lolite OS and retry.");
      return false;
    }
    const { data, error } = await supabase.auth.getSession();
    if (!error && data?.session?.user) {
      await syncCurrentSession(data.session);
      return true;
    }
    renderGate(content, resume);
    return false;
  }
  function renderGate(content, resume, initialError) {
    const stage = content.querySelector("#sj-stage") || content.querySelector(".uv-frame-wrap");
    if (!stage) return;
    stage.style.position = "relative";
    let gate = stage.querySelector(".lb-account-gate");
    if (!gate) {
      gate = document.createElement("section");
      gate.className = "lb-account-gate";
      gate.setAttribute("aria-label", "Lolite Browser sign in");
      gate.style.cssText = "position:absolute;inset:0;z-index:5;overflow:auto;display:flex;align-items:center;justify-content:center;background:#0c1423;color:#eaf1ff;padding:20px;text-align:center";
      gate.innerHTML = `<form class="lb-account-form" style="width:min(100%,330px);display:grid;gap:12px">
        <strong style="font-size:21px">Sign in to Lolite</strong>
        <span style="font-size:13px;color:#aebbd1">Use your Lolite Chat account. No second account is needed.</span>
        <label style="font-size:12px;text-align:left">Username
          <input name="username" autocomplete="username" required minlength="3" maxlength="24" pattern="[A-Za-z0-9_]{3,24}" placeholder="Username" style="width:100%;margin-top:5px;box-sizing:border-box">
        </label>
        <label style="font-size:12px;text-align:left">Password
          <input name="password" type="password" autocomplete="current-password" required placeholder="Password" style="width:100%;margin-top:5px;box-sizing:border-box">
        </label>
        <p class="lb-account-message" role="status" style="margin:0;font-size:12px"></p>
        <button type="submit" class="primary">Sign in</button>
        <button type="button" class="soft lb-create-account">Create an account in Lolite Chat</button>
      </form>`;
      stage.appendChild(gate);
      gate.querySelector(".lb-create-account").onclick = () => {
        if (typeof window.openApp === "function") window.openApp("chatroom", "Lolite Chat", 1100, 700);
        showMessage(gate, "Create your account in Lolite Chat, then sign in here.");
      };
      gate.querySelector("form").onsubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const username = form.elements.username.value.trim();
        const password = form.elements.password.value;
        const submit = form.querySelector('[type="submit"]');
        submit.disabled = true;
        showMessage(gate, "Signing in…");
        try {
          const sb = getClient();
          const { data, error } = await sb.auth.signInWithPassword({
            email: username.toLowerCase() + "@accounts.lolite.chat", password
          });
          if (error || !data?.session) throw new Error(error?.message || "Sign-in failed.");
          await syncCurrentSession(data.session);
          gate.remove();
          resume();
        } catch (error) {
          showMessage(gate, error?.message || "Unable to sign in.", true);
        } finally {
          submit.disabled = false;
        }
      };
    }
    if (initialError) showMessage(gate, initialError, true);
  }
  // A normal Lolite Chat sign-out also clears the backend session for this tab's origin.
  const sb = getClient();
  sb?.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") void syncCurrentSession(null);
    if (event === "TOKEN_REFRESHED" && session) void syncCurrentSession(session);
  });
  window.LoliteBrowserAccounts = { getClient, guard, syncCurrentSession };
})();