import {mkdir,copyFile,readdir} from 'node:fs/promises';
await mkdir('public',{recursive:true});await copyFile('index.html','public/index.html');
// Publish only the playable page and intentionally supplied media, never source or credentials.
await mkdir('public/media',{recursive:true});
for(const file of await readdir('media').catch(()=>[]))if(/^[\w.-]+\.(mp4|webm|m4v)$/i.test(file))await copyFile('media/'+file,'public/media/'+file);
console.log('Prepared lightweight Vercel page; rooms run in /api/rooms.');
