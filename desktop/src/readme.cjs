'use strict';
const fs=require('node:fs/promises');
const path=require('node:path');
const config=require('./config.cjs');
const source=`https://github.com/${config.repository}/blob/main/README.md`;
const maxBytes=256*1024;
function valid(record){return record && typeof record.text==='string' && Buffer.byteLength(record.text)<=maxBytes;}
async function readReadme({directory,bundled,json,refresh=false}) {
  const cache=path.join(directory,'readme-cache.json');let previous;
  try{const saved=JSON.parse(await fs.readFile(cache,'utf8'));if(valid(saved))previous={...saved,kind:'cached'};}catch{}
  if(!previous)previous={text:await fs.readFile(bundled,'utf8'),kind:'bundled',fetchedAt:null};
  if(!refresh)return {...previous,source};
  try{
    const result=await json(`https://api.github.com/repos/${config.repository}/readme?ref=main`,512*1024);
    if(result.encoding!=='base64'||typeof result.content!=='string'||result.size>maxBytes)throw Error('GitHub returned an invalid README.');
    const record={text:Buffer.from(result.content,'base64').toString('utf8'),sha:result.sha,fetchedAt:new Date().toISOString()};
    if(!valid(record)||!record.text.trim())throw Error('GitHub returned an empty or oversized README.');
    const temp=cache+'.tmp';await fs.writeFile(temp,JSON.stringify(record),{mode:0o600});await fs.rename(temp,cache);
    return {...record,kind:'github',source};
  }catch(e){return {...previous,source,warning:'Could not refresh the GitHub README. Showing the '+(previous.kind==='cached'?'last saved':'bundled')+' copy. '+e.message};}
}
module.exports={readReadme};
