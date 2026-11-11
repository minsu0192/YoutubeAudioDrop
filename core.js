const {spawn} = require('node:child_process');
function validate(raw, format) {
  if (!['mp3', 'wav'].includes(format)) throw new Error('MP3 또는 WAV를 선택하세요.');
  let u;
  try { u = new URL(raw); } catch { throw new Error('올바른 HTTPS 유튜브 링크를 입력하세요.'); }
  if (u.protocol !== 'https:' || u.username || u.password || u.port || !['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be'].includes(u.hostname)) throw new Error('올바른 HTTPS 유튜브 링크를 입력하세요.');
  const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : u.pathname === '/watch' ? u.searchParams.get('v') : /^\/(shorts|live)\//.test(u.pathname) ? u.pathname.split('/')[2] : '';
  if (!/^[\w-]{11}$/.test(id || '')) throw new Error('영상 한 개의 링크를 입력하세요.');
  return `https://www.youtube.com/watch?v=${id}`;
}
function args(url, format, dir, runtime) {
  return ['--ignore-config','--no-playlist','--no-overwrites','--newline','--progress','--js-runtimes',`node:${runtime.node}`,'--ffmpeg-location',runtime.bin,'--socket-timeout','30','--retries','2','-f','bestaudio/best','-x','--audio-format',format,'--audio-quality','0','--print','after_move:FILE:%(filepath)s','-o',`${dir}/%(title).160B [%(id)s].%(ext)s`,'--',url];
}
module.exports = {validate,args,spawn};
