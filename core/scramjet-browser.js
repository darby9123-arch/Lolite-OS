/* Scramjet's browser window uses direct navigation on Lolite's web hosts. */
(() => {
 'use strict';
 const open = () => window.openApp('scramjet', 'Scramjet Browser', 900, 650);
 window.LoliteBrowserNavigation.register(['scramjet'], 'Scramjet Browser', { query: 'sj' });
 window.LoliteScramjetBrowser = { open };

 function addShortcut() {
  const icons = document.getElementById('icons');
  if (!icons || document.getElementById('scramjet-launcher')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'scramjet-launcher';
  button.className = 'desktop-icon';
  button.setAttribute('aria-label', 'Scramjet Browser');
  button.innerHTML = window.LoliteIcons.tile('scramjet') + '<span>Scramjet Browser</span>';
  button.ondblclick = open;
  icons.appendChild(button);
 }

 const icons = document.getElementById('icons');
 if (icons) new MutationObserver(addShortcut).observe(icons, { childList: true });
 addShortcut();
})();
