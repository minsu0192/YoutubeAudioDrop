import {mkdir,writeFile,chmod,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../runtime/',import.meta.url));
await mkdir(root,{recursive:true});
const files=[
 ['yt-dlp','https://github.com/yt-dlp/yt-dlp/releases/download/2026.10.26/yt-dlp_macos','0f922c15ccc0b83eefa1c8bc9104e434318c4bf16e408e1ee93b7745a6efe0aa',true],
 ['yt-dlp-LICENSE.txt','https://raw.githubusercontent.com/yt-dlp/yt-dlp/2026.10.26/LICENSE'],
 ['yt-dlp-THIRD-PARTY.txt','https://raw.githubusercontent.com/yt-dlp/yt-dlp/2026.10.26/THIRD_PARTY_LICENSES.txt']
];
await Promise.all(files.map(async([name,url,hash,executable])=>{
 const target=root+name;
 let data=await readFile(target).catch(()=>null);
 if(!data || !hash || createHash('sha256').update(data).digest('hex')!==hash){
  const res=await fetch(url);if(!res.ok)throw Error(`${url}: ${res.status}`);
  data=Buffer.from(await res.arrayBuffer());
  if(hash && createHash('sha256').update(data).digest('hex')!==hash)throw Error(`Checksum mismatch: ${name}`);
  await writeFile(target,data);
 }
 if(executable)await chmod(target,0o755);
 console.log(`Ready: ${name} (${data.length} bytes)`);
}));
