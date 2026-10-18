'use strict';
module.exports = Object.freeze({
  repository: 'darby9123-arch/Lolite-OS',
  manifest: 'lolite-desktop.json',
  installer: 'LoliteOS-Setup.exe',
  origin: 'lolite://app',
  launcherOrigin: 'lolite://launcher',
  // Set the certificate subject in desktop/signing.json before a signed release.
  publisher: require('../signing.json').publisher,
  maxDownloadBytes: 2 * 1024 ** 3,
  maxFileBytes: 256 * 1024 ** 2
});
