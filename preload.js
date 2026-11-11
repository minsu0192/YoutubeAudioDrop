const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('audio',{info:()=>ipcRenderer.invoke('info'),folder:()=>ipcRenderer.invoke('folder'),convert:data=>ipcRenderer.invoke('convert',data),cancel:()=>ipcRenderer.invoke('cancel'),reveal:()=>ipcRenderer.invoke('reveal'),onStatus:fn=>ipcRenderer.on('status',(_e,data)=>fn(data))});
