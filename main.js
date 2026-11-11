const {app,BrowserWindow,ipcMain,dialog,shell} = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const {validate,args,spawn} = require('./core');
const bin = path.join(app.isPackaged ? process.resourcesPath : __dirname,'runtime');
const downloader = path.join(bin,'yt-dlp');
const runtime = {bin, node:process.execPath};
let win, active, lastFile, output;
function send(data) { if (win && !win.isDestroyed()) win.webContents.send('status',data); }
function createWindow() {
  win = new BrowserWindow({width:780,height:720,minWidth:620,minHeight:650,backgroundColor:'#10151c',title:'AudioDrop',webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',e=>e.preventDefault());
  win.loadFile(path.join(__dirname,'index.html'));
}
app.whenReady().then(()=>{output=path.join(app.getPath('downloads'),'AudioDrop');createWindow();});
app.on('window-all-closed',()=>app.quit());
app.on('before-quit',()=>{if(active) {try {process.kill(-active.pid,'SIGKILL');} catch {}}});
ipcMain.handle('folder',async()=>{if(active)return output; const r=await dialog.showOpenDialog(win,{properties:['openDirectory','createDirectory']});if(!r.canceled)output=r.filePaths[0];return output;});
ipcMain.handle('info',()=>({output}));
ipcMain.handle('reveal',async()=>{if(lastFile)shell.showItemInFolder(lastFile);else {await fs.mkdir(output,{recursive:true});await shell.openPath(output);}});
ipcMain.handle('cancel',()=>{if(active){active.cancelled=true;try{process.kill(-active.pid,'SIGKILL');}catch{}}});
ipcMain.handle('convert',async(_e,input)=>{
  if(active)throw new Error('현재 변환이 끝난 후 다시 시도하세요.');
  const url=validate(input.url,input.format);
  for(const tool of ['yt-dlp','ffmpeg','ffprobe'])await fs.access(path.join(bin,tool));
  await fs.mkdir(output,{recursive:true});
  const temp=await fs.mkdtemp(path.join(output,'.audiodrop-'));
  let child;
  try {child=spawn(downloader,args(url,input.format,temp,runtime),{detached:true,env:{...process.env,PATH:`${bin}:/usr/bin:/bin`,ELECTRON_RUN_AS_NODE:'1',PYTHONUNBUFFERED:'1'}});}catch(e){await fs.rm(temp,{recursive:true,force:true});throw e;}
  active=child;lastFile=null;let pending='',errorText='',produced;
  const timeout=setTimeout(()=>{child.timedOut=true;try{process.kill(-child.pid,'SIGKILL');}catch{}},30*60*1000);
  function line(s){if(s.startsWith('FILE:'))produced=s.slice(5).trim();else send({state:'working',message:s});}
  child.stdout.on('data',b=>{pending+=b.toString();const lines=pending.split(/\r?\n/);pending=lines.pop();lines.forEach(line);});
  child.stderr.on('data',b=>{errorText=(errorText+b.toString()).slice(-6000);});
  child.on('error',e=>{errorText=e.message;});
  child.on('close',async code=>{
    clearTimeout(timeout);if(pending)line(pending);
    let result;
    try {
      if(child.cancelled)result={state:'cancelled',message:'변환을 취소했습니다.'};
      else if(code!==0 || !produced)throw new Error(child.timedOut?'30분 제한을 초과했습니다.':errorText || '변환 결과를 찾을 수 없습니다.');
      else {
        if(path.dirname(path.resolve(produced))!==path.resolve(temp))throw new Error('잘못된 출력 경로입니다.');
        const base=path.basename(produced,path.extname(produced)),ext=path.extname(produced);
        let destination;
        for(let n=0;;n++){destination=path.join(output,`${base}${n?` (${n})`:''}${ext}`);try{await fs.copyFile(produced,destination,require('node:fs').constants.COPYFILE_EXCL);break;}catch(e){if(e.code!=='EEXIST')throw e;}}
        lastFile=destination;result={state:'done',message:path.basename(destination)};
      }
    }catch(e){result={state:'error',message:e.message};}
    finally{await fs.rm(temp,{recursive:true,force:true}).catch(()=>{});active=null;send(result);}
  });
  return true;
});
