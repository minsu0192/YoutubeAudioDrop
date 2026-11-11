const $=id=>document.getElementById(id);
function busy(value){$('convert').disabled=value;$('folder').disabled=value;$('url').disabled=value;document.querySelectorAll('[name=format]').forEach(e=>e.disabled=value);$('cancel').hidden=!value;$('progress').hidden=!value;}
window.audio.info().then(x=>$('path').textContent=x.output);
$('folder').onclick=async()=>{$('path').textContent=await window.audio.folder();};
$('reveal').onclick=()=>window.audio.reveal();
$('cancel').onclick=()=>window.audio.cancel();
$('form').onsubmit=async e=>{e.preventDefault();busy(true);$('badge').textContent='추출 중';$('message').textContent='영상 정보를 확인하고 있습니다…';try{await window.audio.convert({url:$('url').value.trim(),format:document.querySelector('[name=format]:checked').value});}catch(err){busy(false);$('badge').textContent='확인 필요';$('message').textContent=err.message;}};
window.audio.onStatus(data=>{if(data.state!=='working')busy(false);$('badge').textContent=({working:'다운로드 / 변환 중',done:'저장 완료',error:'변환 실패',cancelled:'취소됨'})[data.state];$('message').textContent=data.message;});
