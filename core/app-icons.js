/* Lolite OS — shared Fluent-inspired SVG app icon library.
   Every icon is vector artwork: no emoji, remote assets, fonts or per-instance SVG IDs.
   Components are decorative (aria-hidden) and do not change an app's click handlers. */
(()=>{
  'use strict';
  const glyphs={
  "home": "<path fill=\"#F6FAFF\" d=\"M7 23.2 24 9l17 14.2v16.3a2.5 2.5 0 0 1-2.5 2.5h-29A2.5 2.5 0 0 1 7 39.5Z\"/><path fill=\"#AFDAFF\" d=\"M5.6 23.8 22.4 9.6a2.5 2.5 0 0 1 3.2 0l16.8 14.2-3.2 3.6L24 14.9 8.8 27.4Z\"/><rect x=\"20\" y=\"27\" width=\"8\" height=\"15\" rx=\"2\" fill=\"#3A81CF\"/>",
  "minecraft18": "<path d=\"M24 5 44 15v23L24 46 4 37V15Z\" fill=\"#5B9238\"/><path d=\"M4 15 24 5 44 15 24 25Z\" fill=\"#8BDD61\"/><path d=\"M4 15 24 25v21L4 37Z\" fill=\"#966139\"/><path d=\"M24 25 44 15v23L24 46Z\" fill=\"#6E492E\"/><path d=\"m7 20 5 2v6l-5-2Zm10 5 5 2v7l-5-2Zm11 1 5-2v6l-5 2Zm8-4 5-2v6l-5 2Z\" fill=\"#B87B49\"/><path d=\"m15 12 8-4 5 2-8 5Zm16 2 5 2-6 3-5-2Z\" fill=\"#B6F58E\"/>",
  "movies": "<rect x=\"4\" y=\"11\" width=\"40\" height=\"29\" rx=\"5\" fill=\"#D9E1FF\"/><path d=\"M4 19h40\" stroke=\"#5264B7\" stroke-width=\"4\"/><path d=\"m12 11 8 8m5-8 8 8\" stroke=\"#5264B7\" stroke-width=\"3\"/><path d=\"m20 25 0 10 10-5Z\" fill=\"#5C6ACA\"/>",
  "games": "<path d=\"M13 17h22a8 8 0 0 1 7.8 6.4l2.2 11.3c.9 4.7-4.4 8-8.1 5.1l-5.4-4H16.5l-5.4 4c-3.7 2.9-9 0-8.1-5.1l2.2-11.3A8 8 0 0 1 13 17Z\" fill=\"#F7F3FF\"/><rect x=\"12\" y=\"23\" width=\"4\" height=\"13\" rx=\"2\" fill=\"#6961C9\"/><rect x=\"7.5\" y=\"27.5\" width=\"13\" height=\"4\" rx=\"2\" fill=\"#6961C9\"/><circle cx=\"32\" cy=\"26\" r=\"3\" fill=\"#56B9F3\"/><circle cx=\"38\" cy=\"32\" r=\"3\" fill=\"#B094FC\"/><path d=\"M19 18h10\" stroke=\"#D5C8FF\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>",
  "files": "<path d=\"M5 15a4 4 0 0 1 4-4h11l4.2 5H39a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z\" fill=\"#FFB92D\"/><path d=\"M5 23a4 4 0 0 1 4-4h30a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z\" fill=\"#FFE38B\"/><path d=\"M10 25h28\" stroke=\"#FFF4C2\" stroke-width=\"2\" stroke-linecap=\"round\"/>",
  "browser": "<circle cx=\"24\" cy=\"24\" r=\"18\" fill=\"#E9FAFF\"/><circle cx=\"24\" cy=\"24\" r=\"14.5\" fill=\"#80D8F8\"/><path d=\"M24 9.5c-5 4.1-7.6 9-7.6 14.5S19 34.4 24 38.5c5-4.1 7.6-9 7.6-14.5S29 13.6 24 9.5Z\" fill=\"none\" stroke=\"#087CC0\" stroke-width=\"2.4\"/><path d=\"M10 24h28M13.3 17h21.4M13.3 31h21.4\" stroke=\"#E6FAFF\" stroke-width=\"2.2\" stroke-linecap=\"round\"/>",
  "scramjet": "<circle cx=\"24\" cy=\"24\" r=\"17.5\" fill=\"#E7FAFF\"/><path d=\"M10 27c6-11 21-14 31-5-3-11-16-17-27-9-5 4-7 10-4 14Z\" fill=\"#36DCC8\"/><path d=\"M38 25c-6 11-21 14-31 5 4 11 17 16 27 9 5-4 7-10 4-14Z\" fill=\"#2C8DEE\"/><circle cx=\"24\" cy=\"24\" r=\"6.5\" fill=\"#2B65CB\"/><circle cx=\"24\" cy=\"24\" r=\"3\" fill=\"#DDF7FF\"/>",
  "settings": "<path fill=\"#F1F5FA\" d=\"m21 6-1.1 5.4-4 1.7-4.6-3.1-5 5 3.1 4.6L7.7 24l-5.2 1v7l5.2 1 1.7 4-3.1 4.6 5 5 4.6-3.1 4 1.7L21 50h6l1.1-5.4 4-1.7 4.6 3.1 5-5-3.1-4.6 1.7-4 5.2-1v-7l-5.2-1-1.7-4 3.1-4.6-5-5-4.6 3.1-4-1.7L27 6Z\" transform=\"translate(3 1) scale(.86)\"/><circle cx=\"24\" cy=\"24\" r=\"9.5\" fill=\"#8EA3BC\"/><circle cx=\"24\" cy=\"24\" r=\"5.5\" fill=\"#394C69\"/>",
  "appstore": "<path d=\"M10 18h28l3 22a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3Z\" fill=\"#E8FFFF\"/><path d=\"M17 20v-6a7 7 0 0 1 14 0v6\" fill=\"none\" stroke=\"#C7F5FF\" stroke-width=\"4\" stroke-linecap=\"round\"/><rect x=\"14\" y=\"25\" width=\"9\" height=\"9\" rx=\"2\" fill=\"#3CB8E1\"/><rect x=\"25\" y=\"25\" width=\"9\" height=\"9\" rx=\"2\" fill=\"#55D7BC\"/>",
  "lowlight-ai": "<path d=\"M24 5.5c2.2 11.4 7.1 16.3 18.5 18.5C31.1 26.2 26.2 31.1 24 42.5 21.8 31.1 16.9 26.2 5.5 24 16.9 21.8 21.8 16.9 24 5.5Z\" fill=\"#FDF9FF\"/><path d=\"M38 7c.8 4.8 2.2 6.2 7 7-4.8.8-6.2 2.2-7 7-.8-4.8-2.2-6.2-7-7 4.8-.8 6.2-2.2 7-7Z\" fill=\"#D5C5FF\"/><circle cx=\"11\" cy=\"37\" r=\"2.3\" fill=\"#BCF5FF\"/>",
  "chatroom": "<path d=\"M7 12.5A5.5 5.5 0 0 1 12.5 7h24A5.5 5.5 0 0 1 42 12.5v19a5.5 5.5 0 0 1-5.5 5.5H22L12 44v-7A5.5 5.5 0 0 1 7 31.5Z\" fill=\"#F5F7FF\"/><path d=\"M15 18h18M15 25h13\" stroke=\"#6376DB\" stroke-width=\"3.7\" stroke-linecap=\"round\"/>",
  "notes": "<rect x=\"9\" y=\"7\" width=\"29\" height=\"36\" rx=\"5\" fill=\"#F7FBFF\"/><path d=\"M16 16h15M16 22.5h15M16 29h11\" stroke=\"#5E9EDB\" stroke-width=\"2.7\" stroke-linecap=\"round\"/><path d=\"M12 7v36\" stroke=\"#AED9F6\" stroke-width=\"2.8\"/><path d=\"M17 7v-2M29 7v-2\" stroke=\"#2E70B5\" stroke-width=\"3.5\" stroke-linecap=\"round\"/>",
  "calculator": "<rect x=\"11\" y=\"5\" width=\"26\" height=\"38\" rx=\"5.5\" fill=\"#F4F7FF\"/><rect x=\"15\" y=\"10\" width=\"18\" height=\"8\" rx=\"2\" fill=\"#A3DFF7\"/><g fill=\"#748DA5\"><rect x=\"15\" y=\"23\" width=\"5\" height=\"5\" rx=\"1.4\"/><rect x=\"22\" y=\"23\" width=\"5\" height=\"5\" rx=\"1.4\"/><rect x=\"29\" y=\"23\" width=\"5\" height=\"5\" rx=\"1.4\"/><rect x=\"15\" y=\"30\" width=\"5\" height=\"5\" rx=\"1.4\"/><rect x=\"22\" y=\"30\" width=\"5\" height=\"5\" rx=\"1.4\"/></g><rect x=\"29\" y=\"30\" width=\"5\" height=\"9\" rx=\"1.5\" fill=\"#4B9FEE\"/><rect x=\"15\" y=\"37\" width=\"12\" height=\"2.5\" rx=\"1\" fill=\"#B4C8DD\"/>",
  "paint": "<path d=\"M23 6c-10 0-18 7.6-18 18s7.2 18 18 18h2.3c4.1 0 5.5-3.8 2.6-6.3-2.4-2.3-1.7-6.2 2.4-6.2H34c7 0 10-5.6 8.5-11.5C40.7 11.4 33 6 23 6Z\" fill=\"#FFF1F8\"/><circle cx=\"16\" cy=\"16\" r=\"3.4\" fill=\"#F3858D\"/><circle cx=\"25\" cy=\"13.3\" r=\"3.4\" fill=\"#F1B850\"/><circle cx=\"35\" cy=\"19\" r=\"3.4\" fill=\"#58C9B6\"/><circle cx=\"13\" cy=\"27\" r=\"3.4\" fill=\"#82B5F5\"/><path d=\"m27 37 11-16\" stroke=\"#A17BEA\" stroke-width=\"4\" stroke-linecap=\"round\"/>",
  "wallpaper-editor": "<rect x=\"6\" y=\"9\" width=\"36\" height=\"30\" rx=\"5\" fill=\"#E7F4FF\"/><circle cx=\"33\" cy=\"18\" r=\"4\" fill=\"#FFCA70\"/><path d=\"M10 34 19 22l7 8 6-6 7 10Z\" fill=\"#81BDE9\"/><path d=\"m26 30 6-6 7 10H19Z\" fill=\"#6A95D8\"/><path d=\"M5 40h38\" stroke=\"#B4A2FF\" stroke-width=\"3\" stroke-linecap=\"round\"/>",
  "wallpaper": "<rect x=\"6\" y=\"9\" width=\"36\" height=\"30\" rx=\"5\" fill=\"#E7F4FF\"/><circle cx=\"33\" cy=\"18\" r=\"4\" fill=\"#FFCA70\"/><path d=\"M10 34 19 22l7 8 6-6 7 10Z\" fill=\"#81BDE9\"/>",
  "world": "<circle cx=\"24\" cy=\"24\" r=\"18\" fill=\"#92E4FD\"/><path d=\"m8 19 8-8 5 2 1 8-4 4-2 8-6-4Zm18-11 8 5-2 6-5 2 1 6 6 2-2 8-8 5-5-7 2-7-4-4 5-7Z\" fill=\"#71D8AA\"/><path d=\"M13 35c7 5 16 5 23 0\" fill=\"none\" stroke=\"#E1FFFF\" stroke-width=\"2.2\" stroke-linecap=\"round\"/>",
  "clock": "<circle cx=\"24\" cy=\"24\" r=\"18\" fill=\"#EDF8FF\"/><circle cx=\"24\" cy=\"24\" r=\"14\" fill=\"#B5E8FF\"/><path d=\"M24 14v11l8 5\" fill=\"none\" stroke=\"#217CAB\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"24\" cy=\"24\" r=\"2.6\" fill=\"#217CAB\"/>",
  "widgets": "<rect x=\"7\" y=\"7\" width=\"15\" height=\"15\" rx=\"3.5\" fill=\"#F5FBFF\"/><rect x=\"26\" y=\"7\" width=\"15\" height=\"15\" rx=\"3.5\" fill=\"#C1E7FF\"/><rect x=\"7\" y=\"26\" width=\"15\" height=\"15\" rx=\"3.5\" fill=\"#A1D5FF\"/><rect x=\"26\" y=\"26\" width=\"15\" height=\"15\" rx=\"3.5\" fill=\"#F5FBFF\"/>",
  "battery": "<rect x=\"7\" y=\"13\" width=\"31\" height=\"22\" rx=\"5\" fill=\"#ECFFEA\"/><rect x=\"38\" y=\"20\" width=\"4\" height=\"8\" rx=\"2\" fill=\"#D2FFD8\"/><rect x=\"11\" y=\"17\" width=\"21\" height=\"14\" rx=\"2.3\" fill=\"#79E1A0\"/><path d=\"m25 16-10 12h8l-1 6 11-14h-8Z\" fill=\"#F7FFF2\"/>",
  "terminal": "<rect x=\"6\" y=\"8\" width=\"36\" height=\"32\" rx=\"6\" fill=\"#1B293C\" stroke=\"#8D9DB0\" stroke-width=\"2\"/><path d=\"m13 18 7 6-7 6\" fill=\"none\" stroke=\"#86E3D8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M24 31h10\" stroke=\"#EAF5FF\" stroke-width=\"3.5\" stroke-linecap=\"round\"/>",
  "capture": "<rect x=\"5\" y=\"12\" width=\"38\" height=\"29\" rx=\"5\" fill=\"#FFF5F0\"/><path d=\"m16 12 3-5h10l3 5\" fill=\"#FFF5F0\"/><circle cx=\"24\" cy=\"26.5\" r=\"9.5\" fill=\"#F3A79A\"/><circle cx=\"24\" cy=\"26.5\" r=\"5.7\" fill=\"#FFF9F4\"/><circle cx=\"36\" cy=\"18\" r=\"2.1\" fill=\"#E17D7D\"/>",
  "utilities": "<path d=\"M12 9v30M24 9v30M36 9v30\" stroke=\"#EDF7FF\" stroke-width=\"3.5\" stroke-linecap=\"round\"/><rect x=\"7\" y=\"16\" width=\"10\" height=\"8\" rx=\"3\" fill=\"#85D7F5\"/><rect x=\"19\" y=\"28\" width=\"10\" height=\"8\" rx=\"3\" fill=\"#85D7F5\"/><rect x=\"31\" y=\"13\" width=\"10\" height=\"8\" rx=\"3\" fill=\"#85D7F5\"/>",
  "autoclick": "<path d=\"M14 7v30l8.6-7 6.1 11 6.2-3.5-6.1-10.8L39 26Z\" fill=\"#F8FBFF\"/><path d=\"M14 7v30l8.6-7 6.1 11 6.2-3.5-6.1-10.8L39 26Z\" fill=\"none\" stroke=\"#E6A46B\" stroke-width=\"1.5\"/><path d=\"m30 9 5-5M36 16h7M28 7V2\" stroke=\"#FFEAD1\" stroke-width=\"3\" stroke-linecap=\"round\"/>",
  "academy": "<path d=\"M7 12a5 5 0 0 1 5-5h12v33H12a5 5 0 0 0-5 3Z\" fill=\"#E7EFFF\"/><path d=\"M41 12a5 5 0 0 0-5-5H24v33h12a5 5 0 0 1 5 3Z\" fill=\"#B7C8FF\"/><path d=\"M14 15h7M14 21h7M27 15h7M27 21h7\" stroke=\"#5169C0\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><path d=\"m21 29 3-3 3 3\" fill=\"none\" stroke=\"#9870EE\" stroke-width=\"3\" stroke-linecap=\"round\"/>",
  "guide": "<rect x=\"10\" y=\"7\" width=\"28\" height=\"35\" rx=\"5\" fill=\"#FFF4DA\"/><path d=\"M16 14h16M16 20h10\" stroke=\"#E6AD56\" stroke-width=\"2.8\" stroke-linecap=\"round\"/><path d=\"m27 23-8 11h6l-1 6 9-12h-6Z\" fill=\"#F6A42D\"/>",
  "cloud-gaming": "<path d=\"M15 30a9 9 0 0 1 1.6-17.5C18 7.9 22 5 27 5c6.4 0 11.3 4.3 12.4 10 3.7 1.4 6.1 4.9 6.1 9 0 5.2-3.8 8.7-9.5 8.7H16c-.4 0-.7 0-1-.1Z\" fill=\"#E6F5FF\"/><path d=\"M16 25h16a5 5 0 0 1 4.9 4l1.6 7.4c.5 2.5-2.4 4.2-4.3 2.7l-4-3.1H18l-4 3.1c-2 1.5-4.9-.2-4.3-2.7L11.2 29A5 5 0 0 1 16 25Z\" fill=\"#638EF3\"/><path d=\"M19 29v8m-4-4h8\" stroke=\"#FFFFFF\" stroke-width=\"2.8\" stroke-linecap=\"round\"/><circle cx=\"28.5\" cy=\"31\" r=\"2\" fill=\"#B1FFF0\"/><circle cx=\"32.8\" cy=\"35\" r=\"2\" fill=\"#B1FFF0\"/>",
  "life-rp": "<rect x=\"5\" y=\"21\" width=\"16\" height=\"22\" rx=\"2.5\" fill=\"#D3F9FC\"/><path d=\"M3 23 13 12l10 11\" fill=\"none\" stroke=\"#8FEAF4\" stroke-width=\"4\" stroke-linejoin=\"round\"/><rect x=\"10\" y=\"29\" width=\"6\" height=\"14\" rx=\"1\" fill=\"#2480AA\"/><rect x=\"26\" y=\"8\" width=\"17\" height=\"35\" rx=\"3\" fill=\"#A0BFFA\"/><path d=\"M30 16h4m4 0h2M30 23h4m4 0h2M30 30h4m4 0h2\" stroke=\"#3163AA\" stroke-width=\"3\"/><path d=\"M2 44h44\" stroke=\"#D5FFFB\" stroke-width=\"3\"/>",
  "default": "<rect x=\"9\" y=\"9\" width=\"30\" height=\"30\" rx=\"7\" fill=\"#EAF3FF\"/><rect x=\"16\" y=\"16\" width=\"16\" height=\"16\" rx=\"4\" fill=\"#9AB7E6\"/><circle cx=\"24\" cy=\"24\" r=\"4\" fill=\"#FFFFFF\"/>"
};
  const palettes={
  "home": [
    "#4499EE",
    "#175CC1"
  ],
  "minecraft18": ["#6BC76C","#32683D"],
  "movies": ["#A597F5","#3B4B99"],
  "games": [
    "#9378F2",
    "#4D3CA6"
  ],
  "files": [
    "#E8A92C",
    "#B7750A"
  ],
  "browser": [
    "#46B4EC",
    "#126CB2"
  ],
  "scramjet": [
    "#3DD7C6",
    "#286BC2"
  ],
  "settings": [
    "#8399B1",
    "#43536B"
  ],
  "appstore": [
    "#34BCB5",
    "#117B92"
  ],
  "lowlight-ai": [
    "#AF88F9",
    "#623FB5"
  ],
  "chatroom": [
    "#6B8EFF",
    "#3C55B3"
  ],
  "notes": [
    "#72BDF3",
    "#367ABE"
  ],
  "calculator": [
    "#647B95",
    "#303F56"
  ],
  "paint": [
    "#F47FAA",
    "#B84A8F"
  ],
  "wallpaper-editor": [
    "#8D9AFF",
    "#5C56B4"
  ],
  "wallpaper": [
    "#85ABFF",
    "#5D67C9"
  ],
  "world": [
    "#51BDA3",
    "#257E96"
  ],
  "clock": [
    "#76CFF2",
    "#2877B1"
  ],
  "widgets": [
    "#568CD6",
    "#38629F"
  ],
  "battery": [
    "#51CE92",
    "#187D68"
  ],
  "terminal": [
    "#465A72",
    "#172234"
  ],
  "capture": [
    "#FA9F88",
    "#CA5B56"
  ],
  "utilities": [
    "#65A3EA",
    "#3C67AC"
  ],
  "autoclick": [
    "#F0B477",
    "#AD6C41"
  ],
  "guide": [
    "#F5B45D",
    "#BC742D"
  ],
  "academy": ["#8098FF","#7862D0"],
  "life-rp": ["#38D9C8","#2770AD"],
  "cloud-gaming": ["#4A97E8", "#2852A8"],
  "default": [
    "#7492C2",
    "#455B83"
  ]
};
  const aliases={
  "app-home": "home",
  "app-games": "games",
  "app-cloud-gaming": "cloud-gaming",
  "app-academy": "academy",
  "app-life-rp": "life-rp",
  "lolite-life-rp": "life-rp",
  "lolite-academy": "academy",
  "course": "academy",
  "cloudgaming": "cloud-gaming",
  "app-files": "files",
  "app-browser": "browser",
  "app-settings": "settings",
  "app-store": "appstore",
  "app-scramjet": "scramjet",
  "app-ai": "lowlight-ai",
  "app-chat": "chatroom",
  "app-notepad": "notes",
  "app-calculator": "calculator",
  "app-paint": "paint",
  "app-wallpaper": "wallpaper-editor",
  "app-capture": "capture",
  "app-widgets": "widgets",
  "app-terminal": "terminal",
  "app-clock": "clock",
  "app-battery": "battery",
  "app-utilities": "utilities",
  "ultraviolet": "browser",
  "ultraviolet-browser": "browser",
  "game-store": "games",
  "minecraft": "minecraft18",
  "minecraft-1.8": "minecraft18",
  "eaglercraft": "minecraft18",
  "file-explorer": "files",
  "lolite-ai": "lowlight-ai",
  "lolite-chat": "chatroom",
  "quick-notes": "notes",
  "wallpaper-editor": "wallpaper-editor",
  "hardware-guide": "guide",
  "hardware-acceleration-guide": "guide",
  "auto-clicker": "autoclick",
  "world-sandbox": "world",
  "screen-capture": "capture",
  "notepad": "notes",
  "appstore": "appstore",
  "paint": "paint",
  "settings": "settings",
  "scramjet-browser": "scramjet"
};
  function resolve(id){
    const raw=String(id||'').toLowerCase().trim();
    const key=aliases[raw]||raw;
    if(glyphs[key])return key;
    if(key.startsWith('game-')||key.startsWith('store-game-')||key.startsWith('html-game-'))return 'games';
    return 'default';
  }
  function tile(id){
    const key=resolve(id),palette=palettes[key]||palettes.default;
    return '<span class="lolite-icon lolite-icon--'+key+'" style="--icon-from:'+palette[0]+';--icon-to:'+palette[1]+'" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" focusable="false" aria-hidden="true">'+glyphs[key]+'</svg></span>';
  }
  window.LoliteIcons=Object.freeze({tile,resolve,names:Object.freeze(Object.keys(glyphs))});
})();
