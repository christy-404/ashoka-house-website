(function(){
  const DATA_URL = './data/photos.json';
  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from((root||document).querySelectorAll(sel)); }

  function fetchData(){ return fetch(DATA_URL).then(r=>r.json()); }

  function buildGrid(photos){
    const grid = qs('[data-photos-root]');
    const empty = qs('[data-photos-empty]');
    if(!grid) return;
    grid.innerHTML = '';
    
    if(photos.length === 0){
      if(empty) empty.hidden = false;
      return;
    }
    
    if(empty) empty.hidden = true;
    
    photos.forEach((p,i)=>{
      const item = document.createElement('div');
      item.className = 'photo-item';
      item.dataset.index = i;

      const img = document.createElement('img');
      img.src = p.src;
      img.alt = p.caption || `Photo ${i+1}`;
      img.className = 'photo-item__img';
      img.loading = 'lazy';

      item.appendChild(img);
      grid.appendChild(item);
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    fetchData().then(data=>{
      buildGrid(data.photos || []);
    }).catch(err=>console.error(err));
  });
})();