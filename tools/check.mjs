import {readFileSync,statSync,existsSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
import {advanceSpring,clamp} from '../dist/room-walk.js';
const html=readFileSync('dist/index.html','utf8'),works=JSON.parse(readFileSync('dist/works.json','utf8')),tables=JSON.parse(readFileSync('dist/table-layout.json','utf8'));
assert.equal(works.length,12);assert.equal(tables.length,4);assert.equal((html.match(/class="table-page/g)||[]).length,4);assert.equal((html.match(/class="room-walk"/g)||[]).length,1);
for(const work of works){for(const path of [work.src,work.poster])assert.ok(statSync('dist/'+path).size>1000,path);if(work.kind==='video')assert.ok(statSync('dist/media/previews/'+work.id+'.mp4').size>1000);}
const effects=readFileSync('dist/object-life.js','utf8');for(const work of works)assert.ok(effects.includes(`wrap('${work.id}'`),'Missing object effect: '+work.id);
for(const file of ['assets/textures/rough-paper.png','assets/textures/soft-paper.png','assets/key-cursor.svg'])assert.ok(statSync('dist/'+file).size>1000);
for(const file of readdirSync('dist').filter(f=>/\.(css|html|js)$/.test(f))){const text=readFileSync('dist/'+file,'utf8');const refs=[...text.matchAll(/(?:href|src)="([^"#]+)"|url\(['"]?([^)'"\s]+)|(?:from |import )['"](\.[^'"]+)['"]/g)];for(const match of refs){const path=(match[1]||match[2]||match[3]).split(/[?#]/)[0];if(!path||/^(?:https?:|mailto:|data:)/.test(path))continue;assert.ok(existsSync(resolve('dist',path)),`${file}: missing ${path}`);}}
for(const target of [0,1,1.5,3]){let position=target===0?3:0,velocity=0;for(let n=0;n<300;n++)({position,velocity}=advanceSpring(position,velocity,target,1/60));assert.ok(Math.abs(position-target)<.00001);assert.ok(Math.abs(velocity)<.00001);}
assert.equal(clamp(-1,0,3),0);assert.equal(clamp(4,0,3),3);
console.log('Verified four horizontal rooms, twelve animated entries, complete media/assets, and spring convergence.');
