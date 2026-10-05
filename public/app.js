const $ = s => document.querySelector(s);
const audio = $('#audio');
const play = $('#play');

async function getJSON(url){
  const r = await fetch(url,{cache:'no-store'});
  if(!r.ok) throw new Error('HTTP '+r.status);
  return r.json();
}

async function refreshStatus(){
  try{
    const s = await getJSON('/api/status');
    if(s?.current){
      const nome = s.current.nome || 'Web Rádio Vem Comigo Deus';
      let apresentador = '';
      if(s.voices && s.current.apresentador && s.voices[s.current.apresentador]){
        apresentador = s.voices[s.current.apresentador].nome || '';
      }
      $('#show').textContent = nome;
      $('#host').textContent = apresentador ? 'Com '+apresentador : 'Web Rádio Vem Comigo Deus';
      $('#nowTitle').textContent = apresentador ? `${nome} — ${apresentador}` : nome;
    } else {
      $('#show').textContent = 'Louvores que Edificam';
      $('#host').textContent = 'Web Rádio Vem Comigo Deus';
      $('#nowTitle').textContent = 'Louvores que Edificam';
    }
    if(s?.now?.full) $('#clock').textContent = s.now.full+' • Horário de Brasília';
  }catch{
    $('#clock').textContent = 'Web Rádio Vem Comigo Deus';
  }
}

play?.addEventListener('click', async ()=>{
  try{
    if(audio.paused){
      if(!audio.src) audio.src='/radio-stream';
      await audio.play();
      play.textContent='⏸';
      $('#statusText').textContent='AO VIVO';
    }else{
      audio.pause();
      play.textContent='▶';
      $('#statusText').textContent='PAUSADO';
    }
  }catch{
    $('#statusText').textContent='Sinal indisponível neste momento';
  }
});

audio?.addEventListener('playing',()=>{play.textContent='⏸';$('#statusText').textContent='AO VIVO'});
audio?.addEventListener('pause',()=>{if(!audio.ended)play.textContent='▶'});

async function tryTop5(){
  const endpoints=['/api/top5','/api/ranking','/api/stats/top5'];
  for(const url of endpoints){
    try{
      const data=await getJSON(url);
      const raw=data.items||data.top5||data.ranking||[];
      const onlyMusic=raw.filter(x=>{
        const t=String(x.type||x.tipo||'music').toLowerCase();
        return ['music','musica','música','louvor','song'].includes(t);
      }).slice(0,5);
      if(!onlyMusic.length) continue;
      const ol=$('#top5');
      ol.innerHTML='';
      onlyMusic.forEach((x,i)=>{
        const li=document.createElement('li');
        li.innerHTML=`<b>${i+1}</b><span>${x.title||x.nome||x.name||'Louvor'}</span>`;
        ol.appendChild(li);
      });
      return;
    }catch{}
  }
}

refreshStatus();
tryTop5();
setInterval(refreshStatus,15000);
setInterval(tryTop5,60000);
