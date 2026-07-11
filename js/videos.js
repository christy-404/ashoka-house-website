(function(){
  const DATA_URL = './data/videos.json';
  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from((root||document).querySelectorAll(sel)); }

  function fetchData(){ return fetch(DATA_URL).then(r=>r.json()); }

  function buildGrid(videos){
    const grid = qs('[data-videos-root]');
    if(!grid) return;
    grid.innerHTML = '';
    videos.forEach((v,i)=>{
      const card = document.createElement('a');
      card.href = '#';
      card.className = 'album-card';
      card.dataset.index = i;

      const thumb = document.createElement('div');
      thumb.className = 'album-card__thumb';
      if(v.thumbnail){
        const img = document.createElement('img'); img.src = v.thumbnail; img.alt = v.title; img.className='album-card__cover'; thumb.appendChild(img);
      } else {
        thumb.textContent = 'Video';
      }

      const meta = document.createElement('div'); meta.className='album-card__meta';
      const title = document.createElement('div'); title.className='album-card__title'; title.textContent = v.title;
      const details = document.createElement('div'); details.className='album-card__details'; details.textContent = v.duration ? v.duration : '';
      meta.appendChild(title); meta.appendChild(details);

      card.appendChild(thumb); card.appendChild(meta);

      card.addEventListener('click',(ev)=>{ ev.preventDefault(); openViewer(v); });

      grid.appendChild(card);
    });
  }

  function openViewer(video){
    const viewer = document.getElementById('video-viewer');
    if(!viewer) return;
    viewer.setAttribute('aria-hidden','false');
    const videoEl = qs('[data-video-player]');
    videoEl.src = video.src;
    qs('[data-video-title]').textContent = video.title || '';
  }
  function closeViewer(){ const v=document.getElementById('video-viewer'); if(!v) return; v.setAttribute('aria-hidden','true'); qs('[data-video-player]').src = ''; }

  document.addEventListener('DOMContentLoaded', ()=>{
    fetchData().then(data=>{
      buildGrid(data.videos || []);
    }).catch(err=>console.error(err));

    qs('[data-video-close]')?.addEventListener('click', closeViewer);
    qs('[data-video-backdrop]')?.addEventListener('click', closeViewer);
  });
})();
