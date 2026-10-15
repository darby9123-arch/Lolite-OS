/* Scramjet browser for Lolite OS. Requires the Node server routes configured in server.mjs. */
(() => {
  const previousPage = window.page;
  const style = document.createElement("style");
  style.textContent = ".sj-app{height:100%;display:flex;flex-direction:column;gap:10px;min-height:0}.sj-bar{display:flex;gap:8px}.sj-bar input{flex:1;min-width:0;padding:10px;border-radius:8px;background:#0d1118;color:#fff;border:1px solid #303847}.sj-state{padding:10px;border:1px solid #344052;border-radius:8px;color:#cbd5e1;font-size:12px}.sj-state.error{border-color:#65333d;color:#ffb0b8}.sj-stage{flex:1;min-height:220px;display:flex;background:#fff;border-radius:10px;overflow:hidden}.sj-frame{width:100%;height:100%;min-height:220px;border:0;background:#fff}";
  document.head.appendChild(style);
  const page = () => '<div class="sj-app"><h2>Scramjet Browser</h2><form id="sj-form" class="sj-bar"><input id="sj-url" placeholder="Enter a website or search the web" aria-label="Website address" autocomplete="url" spellcheck="false"><button class="primary" type="submit">Go</button><button class="soft" id="sj-home" type="button">Home</button><button class="soft" id="sj-reload" type="button">Reload</button><button class="soft" id="sj-open-tab" type="button">Open in tab ↗</button></form><div id="sj-state" class="sj-state" role="status">Preparing browser…</div><div id="sj-stage" class="sj-stage"><iframe class="sj-frame" id="sj-frame" title="Scramjet browsing area" allow="fullscreen; clipboard-read; clipboard-write"></iframe></div></div>';
  const script = (src) => new Promise((resolve, reject) => {
    const existing = [...document.scripts].find(s => new URL(s.src, location.href).pathname === src);
    if (existing) { if (existing.dataset.loaded === "1") resolve(); else { existing.addEventListener("load", resolve, {once:true}); existing.addEventListener("error", () => reject(new Error("Could not load " + src)), {once:true}); } return; }
    const el = document.createElement("script"); el.src = src; el.onload = () => { el.dataset.loaded = "1"; resolve(); }; el.onerror = () => reject(new Error("Could not load " + src)); document.head.appendChild(el);
  });
  const status = (el, text, error=false) => { el.textContent = text; el.classList.toggle("error", error); };
  const normalize = raw => {
    let value = String(raw || "").trim();
    if (!value) return "";
    if (!/^[a-z][a-z\d+.-]*:\/\//i.test(value)) value = /^(localhost|[\w-]+\.)+[a-z]{2,}([/:?#]|$)/i.test(value) ? "https://" + value : "https://duckduckgo.com/?q=" + encodeURIComponent(value);
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP and HTTPS websites are supported.");
    return url.href;
  };
  async function init(content) {
    const resume = () => {
      content.dataset.loliteBrowserSignedIn = "1";
      void init(content);
    };
    content._loliteBrowserResume = resume;
    if (!content.dataset.loliteBrowserSignedIn) {
      const allowed = await window.LoliteBrowserAccounts?.guard(content, resume);
      if (!allowed) {
        const state = content.querySelector("#sj-state");
        if (state) state.textContent = "Sign in with your Lolite Chat account to use the browser.";
        return;
      }
      content.dataset.loliteBrowserSignedIn = "1";
    }
    const input = content.querySelector("#sj-url");
    const statusEl = content.querySelector("#sj-state");
    const frameEl = content.querySelector("#sj-frame");
    let frame = null;
    let directUrl = "";
    const go = raw => {
      if (content.dataset.loliteBrowserSignedIn !== "1") {
        status(statusEl, "Sign in to Lolite Chat before browsing.", true);
        return;
      }
      try { const url = normalize(raw); if (!url) return; input.value = url; if(frame){frame.go(url);status(statusEl,"Loading "+new URL(url).hostname+" through Scramjet…");}
        else{
          directUrl=url;frameEl.src=url;
          status(statusEl,"Standard browsing mode · "+new URL(url).hostname+". This does not use a proxy. Some websites do not allow embedding; use Open in tab if needed.");
        } }
      catch (e) { status(statusEl, e.message || "Could not open that address.", true); }
    };
    content.querySelector("#sj-form").onsubmit = e => { e.preventDefault(); go(input.value); };
    content.querySelector("#sj-home").onclick = () => go("https://example.com/");
    content.querySelector("#sj-reload").onclick = () => { if(frame)frame.reload(); else if(directUrl)frameEl.src=directUrl; else status(statusEl,"Enter a website to browse."); };
    content.querySelector("#sj-open-tab").onclick = () => {const url=directUrl||(()=>{try{return normalize(input.value)}catch{return ""}})();if(url)window.open(url,"_blank","noopener,noreferrer");else status(statusEl,"Enter a website first.");};
    // Scramjet's proxy transport is not available on the public Lolite hosts.
    // Use an ordinary iframe instead of attempting a failing service worker.
    status(statusEl, "Standard browser mode is ready. Enter a web address or search. Some websites block embedding; Open in tab works in those cases.");
    const initial = new URLSearchParams(location.search).get("sj");
    if (initial) go(initial);
  }
  window.page = id => id === "scramjet" ? page() : previousPage(id);
  const previousOpen = window.openApp;
  window.openApp = function(id, title, w, h) {
    previousOpen(id, title || (id === "scramjet" ? "Scramjet Browser" : title), w || 900, h || 650);
    if (id !== "scramjet") return;
    setTimeout(() => {
      const content = window.state?.windows?.[id]?.el?.querySelector(".content") || document.querySelector("#windows .window:last-child .content");
      if (!content || content.dataset.scramjetBrowserReady) return;
      content.dataset.scramjetBrowserReady = "1";
      init(content);
    }, 0);
  };
  function addLauncher() {
    const icons = document.getElementById("icons");
    if (icons && !document.getElementById("scramjet-launcher")) {
      const button = document.createElement("button");
      button.id = "scramjet-launcher"; button.className = "desktop-icon";
      button.setAttribute('aria-label','Scramjet Browser');button.innerHTML=window.LoliteIcons.tile('scramjet')+'<span>Scramjet Browser</span>';
      button.ondblclick = () => window.openApp("scramjet", "Scramjet Browser", 900, 650);
      icons.appendChild(button);
    }
    const start = document.getElementById("start");
    const list = start?.querySelector(".start-list");
    if (list && !list.querySelector("[data-scramjet-launch]")) {
      const button = document.createElement("button");
      button.dataset.scramjetLaunch = "1"; button.innerHTML = window.LoliteIcons.tile('scramjet')+'<span>Scramjet Browser</span>';
      button.onclick = () => { window.openApp("scramjet", "Scramjet Browser", 900, 650); start.classList.add("hidden"); };
      list.appendChild(button);
    }
  }
  new MutationObserver(addLauncher).observe(document.documentElement, {childList:true, subtree:true});
  addLauncher();
  window.LoliteScramjetBrowser = {open: () => window.openApp("scramjet", "Scramjet Browser", 900, 650)};
})();
