import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),{digest}=require('../src/updater.cjs');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),pkg=require('../package.json'),file=path.join(root,'dist/LoliteOS-Setup.exe');
const manifest={schema:1,version:pkg.version,channel:pkg.version.includes('-')?'beta':'stable',platform:'win32-x64',file:'LoliteOS-Setup.exe',size:(await fs.stat(file)).size,sha512:await digest(file)};
await fs.writeFile(path.join(root,'dist/lolite-desktop.json'),JSON.stringify(manifest,null,2)+'\n');
await fs.writeFile(path.join(root,'dist/SHA512SUMS'),manifest.sha512+'  LoliteOS-Setup.exe\n');
console.log('Created verified release metadata for '+pkg.version);
