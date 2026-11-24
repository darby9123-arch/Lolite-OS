/* Startup Home uses the existing release history, game player, wallpaper library and icon preferences. */
(() => {
 'use strict';
 const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
 }[c]));
 const wallpaperFallback = 'assets/wallpapers/cosmos-orbit.svg';
 const shapes = [['rounded', 'Rounded'], ['square', 'Square'], ['circle', 'Circle']];
 const finishes = [['solid', 'Solid'], ['glass', 'Glass'], ['minimal', 'Transparent']];
 const homes = () => document.querySelectorAll('.lolite-home');

 function newestUpdate() {
  const update = window.LoliteWhatsNew?.getLatest?.();
  if (!update) return '<h2>Lolite updates</h2><p>Release notes are loading.</p>';
  return '<div class="lh-update-meta"><span>Newest update</span><time datetime="' + escape(update.date) + '">' +
   escape(update.dateLabel) + '</time></div><h2>' + escape(update.title) + '</h2><p>' +
   escape(update.summary) + '</p><button type="button" class="lh-button" data-lu-action="detail" data-lu-index="0">Read update</button>';
 }

 function image(src, fallback) {
  const backup = fallback && fallback !== src ? ' data-lh-image-fallback="' + escape(fallback) + '"' : '';
  return '<img class="lh-pick-image" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="' +
   escape(src) + '"' + backup + '>';
 }

 function gamePick(previous) {
  const game = window.LoliteGameStoreGallery?.randomGame?.(previous);
  if (!game) return { id: '', html: '<p class="lh-empty">No games are available right now.</p>' };
  return {
   id: game.file,
   html: image(game.cover, game.poster) +
    '<div class="lh-pick-details"><div class="lh-pick-name"><h3>' + escape(game.title) + '</h3><p>' +
    escape(game.category) + '</p></div><button type="button" class="lh-button lh-primary" data-lh-action="play" aria-label="Play ' +
    escape(game.title) + '">Play</button></div>'
  };
 }

 function wallpaperPick(previous) {
  const api = window.LoliteWallpapers;
  const all = api?.collection.filter(wall =>
   wall.category !== 'Embedded Wallpapers' && (wall.poster || wall.src)) || [];
  const current = api?.current()?.id;
  const alternatives = all.filter(wall => wall.id !== previous);
  const unapplied = alternatives.filter(wall => wall.id !== current);
  const pool = unapplied.length ? unapplied : alternatives.length ? alternatives : all;
  const wall = pool[Math.floor(Math.random() * pool.length)];
  if (!wall) return { id: '', html: '<p class="lh-empty">No wallpapers are available right now.</p>' };
  const applied = wall.id === current;
  return {
   id: wall.id,
   html: image(wall.src || wall.poster, wall.poster && wall.poster !== wall.src ? wall.poster : wallpaperFallback) +
    '<div class="lh-pick-details"><div class="lh-pick-name"><h3>' + escape(wall.name) + '</h3><p>' +
    escape(wall.category) + '</p></div><button type="button" class="lh-button lh-primary" data-lh-action="apply" ' +
    (applied ? 'aria-disabled="true">Applied' : '>Apply wallpaper') + '</button></div>'
  };
 }

 function discovery(kind, title, another, pick) {
  return '<section class="lh-card"><div class="lh-discovery-heading"><h2>' + title +
   '</h2><button type="button" class="lh-button lh-subtle" data-lh-action="another-' + kind + '">' + another +
   '</button></div><div class="lh-pick" data-lh-pick="' + kind + '" data-pick-id="' + escape(pick.id) +
   '" aria-live="polite">' + pick.html + '</div></section>';
 }

 function iconOptions(name, field, choices, value) {
  return '<div class="lh-option-row"><span>' + name + '</span><div class="lh-options" role="group" aria-label="' + name + '">' +
   choices.map(([key, label]) => '<button type="button" data-lh-icon="' + field + '" value="' + key +
    '" aria-pressed="' + (key === value) + '">' + label + '</button>').join('') + '</div></div>';
 }

 function iconEditor() {
  const appearance = window.LoliteIconCustomization?.get?.();
  if (!appearance) return '';
  const samples = ['games', 'files', 'music'].map(id => window.LoliteIcons?.tile(id) || '').join('');
  return '<section class="lh-card lh-icon-editor"><div class="lh-icon-controls"><div class="lh-icon-heading">' +
   '<h2>Stylize your app icons</h2><button type="button" class="lh-button lh-subtle" data-cr-settings="icons">More icon settings</button></div>' +
   iconOptions('Shape', 'shape', shapes, appearance.shape) +
   iconOptions('Finish', 'finish', finishes, appearance.finish) +
   '<div class="lh-option-row lh-opacity"><span>Opacity</span><div><input type="range" min="0" max="100" step="1" aria-label="Icon opacity" data-lh-opacity value="' +
   appearance.opacity + '"><output data-lh-opacity-value>' + appearance.opacity + '%</output></div></div></div>' +
   '<div class="lh-icon-preview" aria-hidden="true" style="--lh-icon-radius:' + radius(appearance.shape) +
    ';--lh-icon-opacity:' + appearance.opacity / 100 + '">' + samples + '</div></section>';
 }

 function radius(shape) {
  if (shape === 'circle') return '50%';
  return shape === 'square' ? '5px' : '15px';
 }

 function syncAppearance() {
  const appearance = window.LoliteIconCustomization?.get?.();
  if (!appearance) return;
  for (const home of homes()) {
   const preview = home.querySelector('.lh-icon-preview');
   if (!preview) continue;
   preview.style.setProperty('--lh-icon-radius', radius(appearance.shape));
   preview.style.setProperty('--lh-icon-opacity', String(appearance.opacity / 100));
   home.querySelectorAll('[data-lh-icon]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.value === appearance[button.dataset.lhIcon]));
   });
   const range = home.querySelector('[data-lh-opacity]');
   if (range.value !== String(appearance.opacity)) range.value = String(appearance.opacity);
   home.querySelector('[data-lh-opacity-value]').value = appearance.opacity + '%';
  }
 }

 function syncWallpaper() {
  const current = window.LoliteWallpapers?.current()?.id;
  for (const home of homes()) {
   const pick = home.querySelector('[data-lh-pick="wallpaper"]');
   const apply = pick.querySelector('[data-lh-action="apply"]');
   if (!apply) continue;
   const applied = pick.dataset.pickId === current;
   apply.setAttribute('aria-disabled', String(applied));
   apply.textContent = applied ? 'Applied' : 'Apply wallpaper';
  }
 }

 function markup({ quick, recent, themes }) {
  return '<div class="lolite-home"><section class="lh-update" aria-label="Newest update">' +
   '<div class="lh-update-copy" data-lh-update>' + newestUpdate() + '</div></section><div class="lh-discover">' +
   discovery('game', 'Try out a game', 'Another game', gamePick()) +
   discovery('wallpaper', 'Try this wallpaper', 'Another wallpaper', wallpaperPick()) +
   '</div>' + iconEditor() +
   '<section class="lh-shortcuts"><h2>Quick access</h2><div class="lh-apps">' + quick + '</div></section>' +
   (recent ? '<section class="lh-shortcuts"><h2>Recently opened</h2><div class="win-start-recent">' + recent + '</div></section>' : '') +
   (themes ? '<details class="lh-themes"><summary>Workspace themes</summary>' + themes + '</details>' : '') + '</div>';
 }

 function changePick(home, kind) {
  const node = home.querySelector('[data-lh-pick="' + kind + '"]');
  const next = kind === 'game' ? gamePick(node.dataset.pickId) : wallpaperPick(node.dataset.pickId);
  node.dataset.pickId = next.id;
  node.innerHTML = next.html;
 }

 document.addEventListener('click', event => {
  const button = event.target.closest('.lolite-home button');
  if (!button) return;
  const home = button.closest('.lolite-home');
  if (button.dataset.lhIcon) {
   window.LoliteIconCustomization?.setAppearance({ [button.dataset.lhIcon]: button.value });
   return;
  }
  switch (button.dataset.lhAction) {
   case 'another-game': changePick(home, 'game'); break;
   case 'another-wallpaper': changePick(home, 'wallpaper'); break;
   case 'play': window.loliteStoreAction?.(button.closest('[data-lh-pick]').dataset.pickId); break;
   case 'apply': {
    if (button.getAttribute('aria-disabled') === 'true') return;
    const id = button.closest('[data-lh-pick]').dataset.pickId;
    if (!window.LoliteWallpapers?.apply(id)) {
     window.toast?.('This wallpaper is no longer available.');
     changePick(home, 'wallpaper');
    }
    break;
   }
  }
 });
 document.addEventListener('input', event => {
  if (event.target.matches('.lolite-home [data-lh-opacity]'))
   window.LoliteIconCustomization?.setAppearance({ opacity: Number(event.target.value) });
 });
 document.addEventListener('error', event => {
  const img = event.target;
  if (!img.matches?.('.lolite-home img[data-lh-image-fallback]')) return;
  const fallback = img.dataset.lhImageFallback;
  delete img.dataset.lhImageFallback;
  img.src = fallback;
 }, true);
 window.addEventListener('lolite:iconappearancechange', syncAppearance);
 window.addEventListener('lolite:wallpaperchange', syncWallpaper);
 window.LoliteWhatsNew?.load?.().then(() => {
  const update = newestUpdate();
  document.querySelectorAll('.lolite-home [data-lh-update]').forEach(el => {
   if (el.innerHTML === update) return;
   const focused = el.contains(document.activeElement);
   el.innerHTML = update;
   if (focused) el.querySelector('button')?.focus({ preventScroll: true });
  });
 });
 window.LoliteHome = Object.freeze({ markup });
})();
