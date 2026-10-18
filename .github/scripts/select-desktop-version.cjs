'use strict';
const fs=require('node:fs');
const path=require('node:path');
const semver=require('../../desktop/node_modules/semver');
function chooseVersion(requested,releases,{ref,sha,event}){
  if(!semver.valid(requested))throw Error('Invalid desktop package version.');
  if(ref.startsWith('refs/tags/desktop-v')){
    if(ref!==`refs/tags/desktop-v${requested}`)throw Error('Tag and package version do not match.');
    return {version:requested,publish:!releases.some(r=>r.tag_name===`desktop-v${requested}`)};
  }
  if(ref!=='refs/heads/main'||event==='pull_request')return {version:requested,publish:false};
  const beta=!!semver.prerelease(requested);
  const channel=releases.filter(r=>/^desktop-v/.test(r.tag_name)&&semver.valid(r.tag_name.slice(9))&&!!semver.prerelease(r.tag_name.slice(9))===beta);
  const built=channel.find(r=>r.target_commitish===sha&&!r.draft);
  if(built)return {version:built.tag_name.slice(9),publish:false};
  const latest=channel.map(r=>r.tag_name.slice(9)).sort(semver.rcompare)[0];
  const version=!latest||semver.gt(requested,latest)?requested:beta?semver.inc(latest,'prerelease',String(semver.prerelease(requested)[0])):semver.inc(latest,'patch');
  return {version,publish:true};
}
async function main(){
  const root=path.resolve(__dirname,'../../desktop'),pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'))),releases=[];
  for(let page=1;page<=20;page++){
    const response=await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/releases?per_page=100&page=${page}`,{headers:{Authorization:`Bearer ${process.env.GH_TOKEN}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw Error('Could not resolve desktop release version: HTTP '+response.status);
    const rows=await response.json();releases.push(...rows);if(rows.length<100)break;if(page===20)throw Error('Release history exceeds the version resolver limit.');
  }
  const result=chooseVersion(pkg.version,releases,{ref:process.env.GITHUB_REF,sha:process.env.GITHUB_SHA,event:process.env.GITHUB_EVENT_NAME});
  pkg.version=result.version;fs.writeFileSync(path.join(root,'package.json'),JSON.stringify(pkg,null,2)+'\n');
  const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json')));lock.version=result.version;lock.packages[''].version=result.version;fs.writeFileSync(path.join(root,'package-lock.json'),JSON.stringify(lock,null,2)+'\n');
  if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`version=${result.version}\npublish=${result.publish}\n`);
  console.log(`Desktop ${result.version} · ${result.publish?'publish after Windows verification':'already released or test build'}`);
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={chooseVersion};
