const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const assetsPhotos = path.join(root, 'assets', 'photos');
const assetsVideos = path.join(root, 'assets', 'videos');
const outDir = path.join(root, 'data');

function titleize(slug){
  return slug.replace(/[-_]+/g,' ').replace(/\b\w/g, c=>c.toUpperCase());
}

function gatherAlbums(){
  if(!fs.existsSync(assetsPhotos)) return [];
  const folders = fs.readdirSync(assetsPhotos, { withFileTypes: true }).filter(d=>d.isDirectory()).map(d=>d.name);
  const albums = folders.map((folderName, idx)=>{
    const folderPath = path.join(assetsPhotos, folderName);
    const files = fs.readdirSync(folderPath).filter(f=>/\.(jpe?g|png|webp|gif|avif)$/i.test(f));
    const photos = files.map((f,i)=>({
      src: `./assets/photos/${folderName}/${encodeURIComponent(f)}`,
      caption: '',
      featured: /featured/i.test(f)
    }));
    // allow optional album.json
    let meta = {};
    const metaPath = path.join(folderPath, 'album.json');
    if(fs.existsSync(metaPath)){
      try{ meta = JSON.parse(fs.readFileSync(metaPath,'utf8')) }catch(e){}
    }
    const stats = files.length ? fs.statSync(path.join(folderPath, files[0])) : fs.statSync(folderPath);
    const date = meta.date || stats.mtime.toISOString().slice(0,10);
    return {
      id: folderName,
      title: meta.title || titleize(folderName),
      date,
      cover: meta.cover ? { src: `./assets/photos/${folderName}/${meta.cover}` } : (photos[0] ? { src: photos[0].src } : null),
      photos
    };
  });
  return albums;
}

function gatherVideos(){
  if(!fs.existsSync(assetsVideos)) return [];
  const files = fs.readdirSync(assetsVideos).filter(f=>/\.(mp4|webm|ogg)$/i.test(f));
  // optional metadata file videos.json inside assets/videos to provide titles/durations/thumbnails
  const metaPath = path.join(assetsVideos, 'videos.json');
  let meta = {};
  if(fs.existsSync(metaPath)){
    try{ meta = JSON.parse(fs.readFileSync(metaPath,'utf8')) }catch(e){}
  }
  const videos = files.map(f=>{
    const key = f;
    const m = meta[key] || {};
    return {
      src: `./assets/videos/${encodeURIComponent(f)}`,
      thumbnail: m.thumbnail ? `./assets/videos/${m.thumbnail}` : null,
      title: m.title || titleize(path.parse(f).name),
      duration: m.duration || null
    };
  });
  return videos;
}

function writeOut(obj, filename){
  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, filename), JSON.stringify(obj, null, 2), 'utf8');
}

function main(){
  const albums = gatherAlbums();
  writeOut({ albums }, 'gallery.json');
  const videos = gatherVideos();
  writeOut({ videos }, 'videos.json');
  console.log('Generated data/gallery.json and data/videos.json');
}

main();
