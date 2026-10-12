/* Scramjet browser launcher for Lolite OS. */
(() => {
  const previousPage = window.page;
  const style = document.createElement('style');
  style.textContent = '.sj-app{height:100%;display:flex;flex-direction:column;gap:10px;min-height:0}.sj-bar{display:flex;gap:8px}.sj-bar input{flex:1;min-width:0;padding:10px;border-radius:8px;background:#0d1118;color:#fff;border:1px solid #303847}.sj-state{padding:12px;border:1px solid #65333d;border-radius:8px;color:#ffb0b8}.sj-stage{flex:1;min-height:220px;display:grid;place-items:center;text-align:center;padding:24px;background:#10141c;border-radius:10px}';
  document.head.appendChild(style);
  function showHostNotice(el, message) { el.textContent = message; if (location.hostname.endsWith('github.io')) { el.append(document.createTextNode(' ')); const link = document.createElement('a'); link.href = 'https://lolite-os.vercel.app/'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Open the Node-backed Lolite OS deployment'; link.style.color = '#c9baff'; link.style.textDecoration = 'underline'; el.append(link); } }
  const browserPage = () '<div class="sj-app"><h2>Scramjet Browser</h2><form id="sj-form" class="sj-bar"><input id="sj-url" placeholder="Enter a website or search the web" aria-label="Website address"><button class="primary">Go</button></form><div id="sj-state" class="sj-state" role="status">Checking Scramjet runtime…</div><div id="sj-stage" class="sj-stage"><div><h3>Scramjet runtime required</h3><p class="muted">The Scramjet client, controller, service worker and proxy transport must be built and served before browsing can work.</p></div></div></div>';
  window.page = id => id === 'scramjet' ? browserPage() : previousPage(id);
  const previousOpen = window.openApp;
  window.openApp = function(id, title, w, h) {
    previousOpen(id, title || (id === 'scramjet' ? 'Scramjet Browser' : title), w || 900, h || 650);
    if (id !== 'scramjet') return;
    setTimeout(async () => {
      const content = window.state?.windows?.[id]?.el?.querySelector('.content');
      if (!content || content.dataset.scramjetBrowserReady) return;
      content.dataset.scramjetBrowserReady = '1';
      const input = content.querySelector('#sj-url');
      const status = content.querySelector('#sj-state');
      const stage = content.querySelector('#sj-stage');
      const go = async raw => {
        let url = String(raw || '').trim();
        if (!url) return;
        if (!/^[a-z][a-z\d+.-]*:\/\//i.test(url)) url = /^(localhost|[\w-]+\.)+[a-z]{2,}([/:?#]|$)/i.test(url) ? 'https://' + url : 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
        try { const parsed = new URL(url); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only HTTP and HTTPS are supported.'); url = parsed.href; }
        catch (error) { status.textContent = error.message || 'Invalid address.'; return; }
        input.value = url;
        const paths = ['/scramjet/scramjet.bundle.js', '/controller/controller.mjs', '/controller/controller.sw.js'];
        const checks = await Promise.all(paths.map(async path => { try { const response = await fetch(path, {method:'HEAD', cache:'no-store'}); return {path, ok:response.ok, status:response.status}; } catch { return {path, ok:false, status:'network error'}; } }));
        const missing = checks.filter(item => !item.ok);
        if (missing.length) {
          showHostNotice(status, 'Scramjet cannot browse yet. Missing: ' + missing.map(item => item.path + ' (' + item.status + ')').join(', ') + '.');
          stage.innerHTML = '<div><h3>Runtime not installed</h3><p class="muted">This host does not serve the required Scramjet runtime. GitHub Pages is static-only; full browsing needs the Node proxy server and a built Scramjet client/controller.</p></div>';
          return;
        }
        status.textContent = 'Runtime files were found, but the Scramjet controller initialization bundle is not connected.';
      };
      content.querySelector('#sj-form').onsubmit = event => { event.preventDefault(); go(input.value); };
      try {
        const response = await fetch('/scramjet/scramjet.bundle.js', {method:'HEAD', cache:'no-store'});
        if (!response.ok) throw new Error('Scramjet client bundle returned HTTP ' + response.status);
        status.textContent = 'Scramjet client asset found. Enter a website to check the controller.';
      } catch (error) {
        showHostNotice(status, 'Scramjet runtime is not bundled on this host. ' + error.message);
      }
    }, 0);
  };
  function addLauncher() {
    const icons = document.getElementById('icons');
    if (icons && !document.getElementById('scramjet-launcher')) {
      const button = document.createElement('button');
      button.id = 'scramjet-launcher'; button.className = 'desktop-icon';
      button.innerHTML = '<b class="app-symbol app-browser" aria-hidden="true"></b><span>Scramjet Browser</span>';
      button.ondblclick = () => window.openApp('scramjet', 'Scramjet Browser', 900, 650);
      icons.appendChild(button);
    }
    const start = document.getElementById('start');
    const list = start?.querySelector('.start-list');
    if (list && !list.querySelector('[data-scramjet-launch]')) {
      const button = document.createElement('button');
      button.dataset.scramjetLaunch = '1'; button.textContent = 'Scramjet Browser';
      button.onclick = () => { window.openApp('scramjet', 'Scramjet Browser', 900, 650); start.classList.add('hidden'); };
      list.appendChild(button);
    }
  }
  new MutationObserver(addLauncher).observe(document.documentElement, {childList:true, subtree:true});
  addLauncher();
  window.LoliteScramjetBrowser = {open: () => window.openApp('scramjet', 'Scramjet Browser', 900, 650)};
})();