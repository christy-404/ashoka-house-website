(function(){
  const DATA_URL = './data/gallery.json';
  const HIGHLIGHT_INTERVAL = 5000;

  let state = {
    albums: [],
    featured: [],
    currentHighlightIndex: 0,
    viewer: { open: false, album: null, index: 0 }
  };

  function qs(sel, root=document) { return root.querySelector(sel); }
  function qsa(sel, root=document) { return Array.from(root.querySelectorAll(sel)); }

  function fetchData(){
    return fetch(DATA_URL).then(r=>r.json());
  }

  function formatDate(iso){
    if(!iso) return '';
    try{ const d=new Date(iso); return d.toLocaleDateString(undefined,{day:'2-digit',month:'long',year:'numeric'}); }catch(e){return iso}
  }

  /* Highlights */
  function buildHighlights(){
    const root = qs('[data-highlights-viewport]');
    const meta = qs('[data-highlights-meta]');
    if(!root) return;
    root.innerHTML = '';

    state.featured = state.albums.flatMap(album=>
      (album.photos||[]).map(p=>Object.assign({albumTitle: album.title, albumId: album.id, albumDate: album.date}, p))
    ).filter(p=>p.featured);

    if(state.featured.length===0){
      // fallback: use first photo of each album
      state.featured = state.albums.map(album=>{
        const p = (album.photos||[])[0] || { src: '', caption: album.title };
        return Object.assign({albumTitle: album.title, albumId: album.id, albumDate: album.date}, p);
      }).filter(Boolean);
    }

    // randomize order to mix history
    state.featured = shuffleArray(state.featured);

    state.featured.forEach((item, i)=>{
      const img = document.createElement('img');
      img.dataset.index = i;
      img.src = item.src;
      img.alt = item.caption || item.albumTitle || '';
      img.className = 'highlights__slide';
      img.style.display = i===0 ? 'block' : 'none';
      img.addEventListener('click', ()=>openViewerForFeatured(i));
      root.appendChild(img);
    });

    updateHighlightMeta();
    if(state.featured.length>1){
      setInterval(advanceHighlight, HIGHLIGHT_INTERVAL);
    }
  }

  function updateHighlightMeta(){
    const meta = qs('[data-highlights-meta]');
    const item = state.featured[state.currentHighlightIndex];
    if(!meta || !item) return;
    meta.textContent = `${item.albumTitle} — ${formatDate(item.albumDate)}`;
  }

  function advanceHighlight(){
    const root = qs('[data-highlights-viewport]');
    if(!root) return;
    const slides = qsa('img', root);
    slides[state.currentHighlightIndex].style.display = 'none';
    state.currentHighlightIndex = (state.currentHighlightIndex + 1) % slides.length;
    slides[state.currentHighlightIndex].style.display = 'block';
    updateHighlightMeta();
  }

  function openViewerForFeatured(index){
    const item = state.featured[index];
    if(!item) return;
    // find album and index within album
    const album = state.albums.find(a=>a.id===item.albumId) || null;
    let idx = 0;
    if(album){ idx = (album.photos||[]).findIndex(p=>p.src===item.src); }
    openViewer(album, idx>=0?idx:0);
  }

  /* Albums grid */
  function buildAlbumGrid(){
    const grid = qs('[data-gallery-root]');
    if(!grid) return;
    grid.innerHTML = '';

    state.albums.forEach(album=>{
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'album-card';
      a.dataset.albumId = album.id;

      const coverImg = document.createElement('img');
      coverImg.className = 'album-card__cover';
      coverImg.src = (album.cover && album.cover.src) || (album.photos && album.photos[0] && album.photos[0].src) || '';
      coverImg.alt = album.title || '';

      const meta = document.createElement('div');
      meta.className = 'album-card__meta';

      const title = document.createElement('div');
      title.className = 'album-card__title';
      title.textContent = album.title || 'Untitled Album';

      const details = document.createElement('div');
      details.className = 'album-card__details';
      const count = (album.photos||[]).length;
      details.textContent = `${count} Photo${count!==1?'s':''} • ${formatDate(album.date)}`;

      meta.appendChild(title);
      meta.appendChild(details);

      a.appendChild(coverImg);
      a.appendChild(meta);

      a.addEventListener('click', (ev)=>{
        ev.preventDefault();
        openViewer(album, 0);
      });

      grid.appendChild(a);
    });
  }

  /* Viewer */
  function openViewer(album, index){
    const viewer = document.getElementById('image-viewer');
    if(!viewer) return;
    viewer.setAttribute('aria-hidden','false');
    const imgEl = qs('[data-viewer-img]');
    const captionEl = qs('[data-viewer-caption]');

    state.viewer.open = true;
    state.viewer.album = album;
    state.viewer.index = index || 0;

    renderViewer();
  }

  function closeViewer(){
    const viewer = document.getElementById('image-viewer');
    if(!viewer) return;
    viewer.setAttribute('aria-hidden','true');
    state.viewer.open = false;
  }

  function renderViewer(){
    const album = state.viewer.album;
    const idx = state.viewer.index || 0;
    const imgEl = qs('[data-viewer-img]');
    const captionEl = qs('[data-viewer-caption]');
    if(!imgEl) return;
    if(!album || !album.photos || album.photos.length===0){
      imgEl.src = '';
      captionEl.textContent = '';
      return;
    }
    const photo = album.photos[idx];
    imgEl.src = photo.src;
    imgEl.alt = photo.caption || album.title || '';
    captionEl.textContent = photo.caption || `${album.title} • ${formatDate(album.date)}`;
  }

  function viewerPrev(){
    if(!state.viewer.album) return;
    state.viewer.index = (state.viewer.index - 1 + state.viewer.album.photos.length) % state.viewer.album.photos.length;
    renderViewer();
  }
  function viewerNext(){
    if(!state.viewer.album) return;
    state.viewer.index = (state.viewer.index + 1) % state.viewer.album.photos.length;
    renderViewer();
  }

  function attachViewerListeners(){
    const viewer = document.getElementById('image-viewer');
    if(!viewer) return;
    qs('[data-viewer-close]').addEventListener('click', closeViewer);
    qs('[data-viewer-backdrop]')?.addEventListener('click', closeViewer);
    qs('[data-viewer-prev]').addEventListener('click', viewerPrev);
    qs('[data-viewer-next]').addEventListener('click', viewerNext);

    // keyboard
    document.addEventListener('keydown', (ev)=>{
      if(!state.viewer.open) return;
      if(ev.key === 'Escape') closeViewer();
      if(ev.key === 'ArrowLeft') viewerPrev();
      if(ev.key === 'ArrowRight') viewerNext();
    });
  }

  /* Utilities */
  function shuffleArray(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  /* Initialization */
  function init(){
    fetchData().then(data=>{
      // support both legacy and new shape
      state.albums = data.albums || data.items || [];
      // normalize album ids
      state.albums = state.albums.map((a,idx)=>Object.assign({id: a.id || idx+1}, a));
      buildHighlights();
      buildAlbumGrid();
      attachViewerListeners();
    }).catch(err=>{
      console.error('Gallery data load failed', err);
    });
  }

  // small DOM fix: ensure backdrop selector exists
  // create missing backdrop selector binding
  document.addEventListener('DOMContentLoaded', ()=>{
    // ensure we have a backdrop data attribute element referenced by data-viewer-backdrop
    if(!qs('[data-viewer-backdrop]')){
      const viewer = document.getElementById('image-viewer');
      if(viewer){
        const bd = viewer.querySelector('.image-viewer__backdrop');
        if(bd) bd.dataset.viewerBackdrop = '';
      }
    }
    init();
  });

})();
