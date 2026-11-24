import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,extname,relative} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import assert from 'node:assert/strict';

const base=resolve('dist/toyfight');
async function walk(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(resolve(dir,e.name)):resolve(dir,e.name)))).flat();}
const files=await walk(base),scripts=files.filter(p=>['.js','.mjs'].includes(extname(p))),pages=files.filter(p=>extname(p)==='.html');
const run=promisify(execFile);let next=0;
await Promise.all(Array.from({length:8},async()=>{while(next<scripts.length){const p=scripts[next++];await run(process.execPath,['--check',p]);}}));
for(const p of scripts.filter(p=>extname(p)==='.mjs')){
  for(const [,ref] of (await readFile(p,'utf8')).matchAll(/(?:\bfrom\s*|\bimport\s*\()\s*['"](\.[^'"]+)/g)){
    assert.ok((await stat(resolve(p,'..',ref.split('?')[0]))).isFile(),`Missing module import: ${relative(base,p)}: ${ref}`);
  }
}
for(const p of pages){
  const source=await readFile(p,'utf8');
  for(const [,raw] of source.matchAll(/(?:src|href)=["'](\/[^"'#]*)/g)){
    if(raw.startsWith('//'))continue;
    assert.ok(raw.startsWith('/toyfight/'),`${relative(base,p)} leaves its namespace: ${raw}`);
    const file=resolve('dist',decodeURIComponent(raw.split('?')[0].replace(/&amp;/g,'&')).slice(1));
    let info=await stat(file);if(info.isDirectory())info=await stat(resolve(file,'index.html'));
    assert.ok(info.isFile(),raw);
  }
}
const home=await readFile(resolve(base,'index.html'),'utf8'),config=JSON.parse(await readFile(resolve(base,'portfolio/content.json'),'utf8'));
assert.equal((home.match(/class="work-section"/g)||[]).length,11);
assert.equal((home.match(/class="work-panel"/g)||[]).length,11);
assert.ok(home.includes('/toyfight/portfolio/main.mjs'));
assert.ok((await readFile(resolve(base,'portfolio/page-wipe.js'),'utf8')).includes("url.pathname='/toyfight'+url.pathname"));
const map=await readFile(resolve(base,'replica/video-map.js'),'utf8');
assert.ok(!map.includes('https://'),'Reference videos must remain on the same origin');
assert.equal((map.match(/\/toyfight\/assets\/video\//g)||[]).length,93);
assert.equal(pages.length,61);
console.log(`Verified ${pages.length} relocated pages, ${scripts.length} scripts, 11 personal videos and 93 same-origin reference videos.`);
