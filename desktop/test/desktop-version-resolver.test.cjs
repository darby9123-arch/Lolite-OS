const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseVersion}=require('../../.github/scripts/select-desktop-version.cjs');
const ref='refs/heads/main',sha='a'.repeat(40),requested='3.15.4';
const published=[
 {tag_name:'desktop-v3.15.159',target_commitish:'b'.repeat(40),draft:false},
 {tag_name:'desktop-v3.15.158',target_commitish:'c'.repeat(40),draft:false}
];
test('Each Windows workflow run selects a unique patch tag, even with stale release listings',()=>{
 const one=chooseVersion(requested,published,{ref,sha,event:'push',runNumber:584});
 const two=chooseVersion(requested,published,{ref,sha,event:'push',runNumber:585});
 assert.deepEqual(one,{version:'3.15.584',publish:true});
 assert.deepEqual(two,{version:'3.15.585',publish:true});
});
test('A higher requested version is respected without downgrading or resetting patch',()=>{
 const next=chooseVersion('4.0.0',published,{ref,sha,event:'push',runNumber:586});
 assert.deepEqual(next,{version:'4.0.586',publish:true});
});
test('Existing source tag can be identified without a new release',()=>{
 const found=chooseVersion(requested,[{tag_name:'desktop-v3.15.584',target_commitish:sha,draft:false}],{ref,sha,event:'push',runNumber:584});
 assert.deepEqual(found,{version:'3.15.584',publish:false});
});
test('Pull requests and manually selected release tags do not allocate new tags',()=>{
 assert.deepEqual(chooseVersion(requested,published,{ref,sha,event:'pull_request',runNumber:585}),{version:requested,publish:false});
 const tag=chooseVersion('3.15.159',published,{ref:'refs/tags/desktop-v3.15.159',sha,event:'push',runNumber:585});
 assert.equal(tag.publish,false);
});
