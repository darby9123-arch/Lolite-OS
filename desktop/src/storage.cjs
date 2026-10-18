'use strict';
const fs = require('node:fs');
const path = require('node:path');
const defaults = Object.freeze({checkOnStartup:true, autoDownload:false, launchAfterUpdate:true, beta:false, fullscreen:false, startMinimized:false});
class Store {
  constructor(directory) {
    this.directory = directory;
    fs.mkdirSync(directory, {recursive:true});
    this.file = path.join(directory, 'launcher.json');
    try { this.data = JSON.parse(fs.readFileSync(this.file, 'utf8')); }
    catch { this.data = {}; }
    this.data.settings = {...defaults, ...this.data.settings};
    this.data.history ||= [];
  }
  save() {
    const temp = this.file + '.tmp';
    fs.writeFileSync(temp, JSON.stringify(this.data, null, 2), {mode:0o600});
    fs.renameSync(temp, this.file);
  }
  settings(patch) {
    for (const [key,value] of Object.entries(patch || {})) {
      if (!Object.hasOwn(defaults,key) || typeof value !== 'boolean') throw Error('Invalid launcher setting.');
      this.data.settings[key] = value;
    }
    this.save(); return {...this.data.settings};
  }
  history(action, version, detail = '') {
    this.data.history.unshift({date:new Date().toISOString(), action, version, detail});
    this.data.history = this.data.history.slice(0,100); this.save();
  }
  log(message) {
    const file = path.join(this.directory, 'launcher.log');
    try {
      if (fs.existsSync(file) && fs.statSync(file).size > 2 * 1024 ** 2) fs.renameSync(file, file + '.previous');
      fs.appendFileSync(file, `${new Date().toISOString()} ${String(message).slice(0,3000)}\n`, {mode:0o600});
    } catch { /* A logging failure must not prevent recovery. */ }
  }
}
module.exports = {Store, defaults};
