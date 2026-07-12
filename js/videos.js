(function(){
  const DATA_URL = './data/videos.json';
  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from((root||document).querySelectorAll(sel)); }

  function fetchData(){ return fetch(DATA_URL).then(r=>r.json()); }

  function buildGrid(videos){
    const grid = qs('[data-videos-root]');
    const empty = qs('[data-videos-empty]');
    if(!grid) return;
    grid.innerHTML = '';
    
    if(videos.length === 0){
      if(empty) empty.hidden = false;
      return;
    }
    
    if(empty) empty.hidden = true;
    
    videos.forEach((v,i)=>{
      const item = document.createElement('div');
      item.className = 'video-item';
      item.dataset.index = i;

      const video = document.createElement('video');
      video.src = v.src;
      video.controls = true;
      video.preload = 'metadata';
      video.className = 'video-item__video';
      video.style.background = '#000';
      video.style.width = '100%';
      video.style.aspectRatio = '16/9';

      const meta = document.createElement('div');
      meta.className = 'video-item__meta';
      
      const title = document.createElement('div');
      title.className = 'video-item__title';
      title.textContent = v.title || `Video ${i+1}`;
      
      const duration = document.createElement('div');
      duration.className = 'video-item__duration';
      duration.textContent = v.duration || '';
      
      meta.appendChild(title);
      meta.appendChild(duration);

      item.appendChild(video);
      item.appendChild(meta);
      grid.appendChild(item);
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    fetchData().then(data=>{
      buildGrid(data.videos || []);
    }).catch(err=>console.error(err));
  });
})();