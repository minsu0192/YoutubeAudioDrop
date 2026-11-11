const {app,BrowserWindow,dialog}=require('electron');
const fs=require('node:fs/promises');
const {execFileSync}=require('node:child_process');
const path=require('node:path');
const portable=process.env.AUDIODROP_TEST_APP;
if(portable){
 Object.defineProperty(app,'isPackaged',{value:true});
 Object.defineProperty(process,'resourcesPath',{value:path.join(portable,'Contents','Resources')});
 Object.defineProperty(process,'execPath',{value:path.join(portable,'Contents','MacOS','AudioDrop')});
}
require(portable?path.join(portable,'Contents','Resources','app.asar','main.js'):'../main');
const timer=setTimeout(()=>{console.error('TEST TIMEOUT');app.exit(1);},120000);
app.whenReady().then(()=>{
 const window=BrowserWindow.getAllWindows()[0];
 window.webContents.once('did-finish-load',async()=>{
  try{
   const directory=await fs.mkdtemp('/private/tmp/audiodrop-e2e-');
   dialog.showOpenDialog=async()=>({canceled:false,filePaths:[directory]});
   const result=await window.webContents.executeJavaScript(`(async()=>{await window.audio.folder();const results=[];let resolve;window.audio.onStatus(s=>{if(s.state!=='working'&&resolve)resolve(s);});for(const format of ['mp3','wav']){const finished=new Promise(r=>resolve=r);await window.audio.convert({url:'https://www.youtube.com/watch?v=jNQXAC9IVRw',format});const result=await finished;if(result.state!=='done')throw Error(result.message);results.push(result);}return results;})()`);
   const probe=portable?path.join(process.resourcesPath,'runtime','ffprobe'):path.join(__dirname,'..','runtime','ffprobe');
   for(const file of await fs.readdir(directory)){const codec=execFileSync(probe,['-v','error','-show_entries','stream=codec_name','-of','csv=p=0',directory+'/'+file],{encoding:'utf8'}).trim();console.log(file,codec);if(!['mp3','pcm_s16le'].includes(codec))throw Error('Unexpected codec');}
   console.log('CONVERSION PASS',JSON.stringify(result));clearTimeout(timer);app.quit();
  }catch(e){console.error(e);app.exit(1);}
 });
});
