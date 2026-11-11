const {app,BrowserWindow}=require('electron');
const fs=require('node:fs/promises');
require('../main');
app.whenReady().then(()=>{
 const window=BrowserWindow.getAllWindows()[0];
 window.webContents.once('did-finish-load',async()=>{
  try {
   const result=await window.webContents.executeJavaScript(`(async()=>{const info=await window.audio.info();if(!info.output)throw Error('Missing output folder');document.getElementById('url').value='https://evil.example/watch?v=BaW_jenozKc';document.getElementById('form').requestSubmit();await new Promise(r=>setTimeout(r,300));if(document.getElementById('convert').disabled)throw Error('Form stuck');if(!document.getElementById('message').textContent.includes('HTTPS'))throw Error('Validation missing');document.getElementById('url').value='';document.getElementById('badge').textContent='준비됨';document.getElementById('message').textContent='링크를 넣고 저장 형식을 선택하세요.';return {title:document.title,output:info.output};})()`);
   await fs.writeFile('/private/tmp/audiodrop-preview.png',(await window.webContents.capturePage()).toPNG());
   console.log('SMOKE PASS',JSON.stringify(result));app.quit();
  }catch(e){console.error(e);app.exit(1);}
 });
});
