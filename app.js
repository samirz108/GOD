
const qs = (s, el=document)=>el.querySelector(s);
const qsa = (s, el=document)=>Array.from(el.querySelectorAll(s));
const $views = qsa('[data-view]');
const $leftNav = qsa('.side-nav a');
const $bottomNav = qsa('.bottombar a');
const stateKey = 'instalite-state-v1';
const themeKey = 'instalite-theme-v1';

function uid(){ return Math.random().toString(36).slice(2,9) }
function timeAgo(ts){
  const diff = Math.floor((Date.now()-ts)/1000);
  if (diff<60) return `${diff}s`;
  const m=Math.floor(diff/60); if (m<60) return `${m}m`;
  const h=Math.floor(m/60); if(h<24)return`${h}h`;
  const d=Math.floor(h/24); return `${d}d`;
}
function placeholderImage(text='Photo'){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#111827'/><stop offset='100%' stop-color='#374151'/>
    </linearGradient></defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='64' fill='white' opacity='0.9'>${text}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
function avatar(text='U'){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#ec4899'/><stop offset='100%' stop-color='#8b5cf6'/>
    </linearGradient></defs>
    <rect width='100%' height='100%' rx='64' ry='64' fill='url(#g)'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='64' fill='white'>${text[0]||'U'}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const seed = {
  me: { id:'me', name:'Samir', avatar:'images/userpfp.webp' },
  users: [
    { id:'u1', name:'Abhi', avatar: 'images/aviqatar.jpg' },
    { id:'u2', name:'Anish', avatar: 'images/anish.jpg' },
    { id:'u3', name:'Nibesh', avatar: 'images/nibesh.jpg' },
    { id:'u4', name:'Proski', avatar: 'images/proski.jpeg'},
     {id:'u5', name:'Karan', avatar: 'images/doremon.jpeg' },
     {id:'u6', name:'Sujan', avatar: avatar('S') },
     {id:'u7', name:'Nirajan', avatar: avatar('S') },
     {id:'u8', name:'Jonish', avatar: avatar('S') },
    
     
  ],
  stories: [
    { id: 'me', user:'me', src:'images/baudeshwor.jpg' },
    { id:uid(), user:'u1', src:'images/avistry.jpg' },
     { id:uid(), user:'u3', src:'images/nibeshstry.jpg' },
     { id:uid(), user:'u2', src:'images/cat.jpg' },
     { id:uid(), user:'u4', src:'images/nature.jpg' }
  ],
  posts: [
    { id: uid(), user:'u1', type:'image', src: 'images/qatar.jpg', caption:'QATAR🌆', ts: Date.now()-1000*60*10, likes:10, liked:false },
    { id: uid(), user:'u2', type:'image', src: 'images/cafe.jpg', caption:'Enjoy time', ts: Date.now()-1000*60*50, likes:20, liked:false },
    { id: uid(), user:'u3', type:'image', src: 'images/nibeshpost.jpg', caption:'Kritipur', ts: Date.now()-1000*60*60*8, likes:32, liked:false },
  ],
  chats: [
    { id:'c1', with:'u2', messages:[
      { id:uid(), from:'u6', text:'Project k garne', ts: Date.now()-1000*60*50 },
      { id:uid(), from:'me', text:'khai', ts: Date.now()-1000*60*48 },
    ]},
    { id:'c2', with:'u3', messages:[
      { id:uid(), from:'u3', text:'whats up', ts: Date.now()-1000*60*120 },
    ]},
  ]
};

let state = loadState();
function loadState(){
  try{
    const raw = localStorage.getItem(stateKey);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return JSON.parse(JSON.stringify(seed));
}
function saveState(){
  localStorage.setItem(stateKey, JSON.stringify(state));
}

function setTheme(mode){
  const root = document.documentElement;
  if(mode==='dark'){ root.classList.add('dark'); }
  else{ root.classList.remove('dark'); mode='light'; }
  localStorage.setItem(themeKey, mode);
}
(function initTheme(){
  setTheme(localStorage.getItem(themeKey)||'light');
})();
  function showView(name){
  $views.forEach(v => v.hidden = v.id !== `view-${name}`);
  $leftNav.forEach(a => a.classList.toggle('active', a.dataset.nav===name));
  $bottomNav.forEach(a => a.classList.toggle('active', a.dataset.nav===name));
  if(name==='reels') setupReelsObserver();
}
$leftNav.forEach(a => a.addEventListener('click', e=>{ e.preventDefault(); showView(a.dataset.nav) }));
$bottomNav.forEach(a => a.addEventListener('click', e=>{ e.preventDefault(); showView(a.dataset.nav) }));
qs('.logo').addEventListener('click', e=>{ e.preventDefault(); showView('feed') });
qs('#btnMessages').addEventListener('click', ()=>showView('messages'));
qs('#btnCamera').addEventListener('click', ()=>showView('camera'));
qs('#btnTheme').addEventListener('click', ()=>{
  const current = localStorage.getItem(themeKey)||'light';
  setTheme(current==='light'?'dark':'light');
});

const searchInput = qs('#globalSearch');
const searchDropdown = qs('#searchDropdown');
searchInput.addEventListener('input', onSearch);
searchInput.addEventListener('focus', ()=>searchDropdown.classList.remove('hidden'));
document.addEventListener('click', (e)=>{
  if(!qs('.search-wrap').contains(e.target)) searchDropdown.classList.add('hidden');
});
function onSearch(){
  const q = searchInput.value.toLowerCase().trim();
  const rows = [];
  if(!q){ searchDropdown.innerHTML=''; return; }

  state.users.concat([state.me]).forEach(u=>{
    if(u.name.toLowerCase().includes(q)){
      rows.push(rowUser(u));
    }
  });
 
  state.posts.forEach(p=>{
    if((p.caption||'').toLowerCase().includes(q)){
      rows.push(`<div class="row" data-goto="post" data-id="${p.id}">
        <img src="${userById(p.user).avatar}" class="avatar sm" alt="" />
        <div><div><b>${userById(p.user).name}</b> • <span class="muted">${timeAgo(p.ts)}</span></div>
        <div class="muted">${escapeHTML(p.caption).slice(0,60)}</div></div>
      </div>`);
    }
  });
  searchDropdown.innerHTML = rows.join('') || `<div class="row muted">No results</div>`;
  qsa('.dropdown .row', searchDropdown).forEach(r=>{
    r.addEventListener('click', ()=>{
      const goto = r.dataset.goto;
      if(goto==='user'){
        showProfile(r.dataset.id);
      }else if(goto==='post'){
        showView('feed');
     
        const el = qs(`[data-post="${r.dataset.id}"]`);
        if(el){ el.scrollIntoView({behavior:'smooth', block:'center'}) }
      }
      searchDropdown.classList.add('hidden');
    });
  });
}
function rowUser(u){
  return `<div class="row" data-goto="user" data-id="${u.id}">
    <img src="${u.avatar}" class="avatar sm" alt="${u.name}" />
    <div><div><b>${u.name}</b></div><div class="muted">Profile</div></div>
  </div>`;
}


const storiesBar = qs('#storiesBar');
function renderStories(){
  const list = (state.stories && state.stories.length? state.stories : state.users.map(u=>({id:uid(), user:u.id, src: userById(u.id).avatar})));
  storiesBar.innerHTML = list.map(s => {
    const u = userById(s.user);
    return `<div class="story-item" data-story="${s.id}" title="${u.name}">
      <div class="ring"><div class="inner"><img src="${u.avatar}" alt="${u.name}" /></div></div>
      <div class="name">${u.name}</div>
    </div>`;
  }).join('');
  qsa('.story-item', storiesBar).forEach(el=>{
    el.addEventListener('click', ()=>openStory(el.dataset.story));
  });
}

const overlay = qs('#storyViewer');
qs('#closeStory').addEventListener('click', ()=>overlay.classList.add('hidden'));
let storyTimer=null, storyProgress=0;
let currentStoryIndex = 0;
let storyList = [];

function openStory(id) {
  storyList = (state.stories && state.stories.length
    ? state.stories
    : state.users.map(u => ({ id: uid(), user: u.id, src: userById(u.id).avatar }))
  );
  currentStoryIndex = storyList.findIndex(s => s.id === id);
  if (currentStoryIndex === -1) currentStoryIndex = 0;
  showStoryAt(currentStoryIndex);
}

function showStoryAt(idx) {
  const s = storyList[idx];
  const u = userById(s.user);
  qs('#storyMedia').src = s.src || u.avatar;
  qs('#storyUserAvatar').src = u.avatar;
  qs('#storyUserName').textContent = u.name;
  storyProgress = 0;
  qs('#storyProgress').style.width = '0%';
  overlay.classList.remove('hidden');
  if (storyTimer) clearInterval(storyTimer);
  storyTimer = setInterval(() => {
    storyProgress += 2;
    qs('#storyProgress').style.width = storyProgress + '%';
    if (storyProgress >= 100) {
      clearInterval(storyTimer);
      nextStory();
    }
  }, 100);
}

function nextStory() {
  if (currentStoryIndex < storyList.length - 1) {
    currentStoryIndex++;
    showStoryAt(currentStoryIndex);
  } else {
    overlay.classList.add('hidden');
  }
}
function prevStory() {
  if (currentStoryIndex > 0) {
    currentStoryIndex--;
    showStoryAt(currentStoryIndex);
  }
}

qs('#nextStory').addEventListener('click', nextStory);
qs('#prevStory').addEventListener('click', prevStory);

const feed = qs('#feed');
function userById(id){ if(id==='me') return state.me; return state.users.find(u=>u.id===id)||state.me }
function renderFeed(){
  feed.innerHTML = state.posts
    .sort((a,b)=>b.ts-a.ts)
    .map(p => {
      const u = userById(p.user);
      const media = p.type==='video'
        ? `<video src="${p.src}" controls playsinline></video>`
        : `<img src="${p.src}" alt="${escapeHTML(p.caption||'Post')}" />`;
      return `<article class="post" data-post="${p.id}">
        <div class="head">
          <div style="display:flex; align-items:center; gap:8px">
            <img src="${u.avatar}" class="avatar" alt="${u.name}" />
            <div><div><b>${u.name}</b></div><div class="muted">${timeAgo(p.ts)}</div></div>
          </div>
          <button class="icon" data-save="${p.id}" title="Save">🔖</button>
        </div>
        <div class="media">${media}</div>
        <div class="actions">
          <button class="icon" data-like="${p.id}" aria-pressed="${p.liked}">${p.liked?'❤️':'🤍'}</button>
          <button class="icon" data-comment="${p.id}">💬</button>
          <div class="spacer"></div>
          <span class="muted">${p.likes} likes</span>
        </div>
        <div class="caption"><b>${u.name}</b> ${linkify(escapeHTML(p.caption||''))}</div>
      </article>`;
    })
    .join('');

  qsa('[data-like]').forEach(btn=>btn.addEventListener('click', ()=>{
    const id = btn.dataset.like;
    const p = state.posts.find(x=>x.id===id);
    p.liked = !p.liked;
    p.likes += p.liked?1:-1;
    saveState(); renderFeed();
  }));
}
renderStories();
renderFeed();

const fileInput = qs('#fileInput');
const captionInput = qs('#captionInput');
const postButton = qs('#postButton');
qs('#meAvatar').src = state.me.avatar;
postButton.addEventListener('click', async ()=>{
  const file = fileInput.files[0];
  const caption = captionInput.value.trim();
  if(!file){ alert('Select an image or video to post.'); return; }
  const src = await readFileAsDataURL(file);
  const type = file.type.startsWith('video')?'video':'image';
  state.posts.push({ id: uid(), user:'me', type, src, caption, ts: Date.now(), likes:0, liked:false });
  captionInput.value=''; fileInput.value='';
  saveState(); renderFeed(); renderExplore();
});

function readFileAsDataURL(file){
  return new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); });
}

const reelsList = qs('#reelsList');
let reelsObserver = null;
function renderReels(){
  const items = state.posts.filter(p=>p.type==='video');
  if(items.length===0){
    reelsList.innerHTML = `<div class="reel"><img src="${placeholderImage('Add a Reel (upload video)')}" alt="Reel placeholder"/></div>`;
    return;
  }
  reelsList.innerHTML = items
    .sort((a,b)=>b.ts-a.ts)
    .map(p=>`<div class="reel">
      <video src="${p.src}" playsinline muted loop></video>
      <div class="overlay-ui">
        <button>❤️ ${p.likes}</button>
        <button>💬</button>
      </div>
    </div>`).join('');
}
function setupReelsObserver(){
  if(reelsObserver) return;
  reelsObserver = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      const vid = qs('video', e.target);
      if(!vid) return;
      if(e.isIntersecting){ vid.play().catch(()=>{}); }
      else { vid.pause(); }
    });
  }, { threshold: 0.8 });
  qsa('.reel', reelsList).forEach(r=>reelsObserver.observe(r));
}

const threadList = qs('#threadList');
const chatHeader = qs('#chatHeader');
const chatBody = qs('#chatBody');
const chatText = qs('#chatText');
const chatSend = qs('#chatSend');
let activeChatId = null;

function renderThreads(){
  threadList.innerHTML = state.chats.map(c=>{
    const u = userById(c.with);
    const last = c.messages[c.messages.length-1];
    return `<div class="thread ${c.id===activeChatId?'active':''}" data-id="${c.id}">
      <img class="avatar" src="${u.avatar}" alt="${u.name}"/>
      <div style="flex:1">
        <div><b>${u.name}</b></div>
        <div class="muted">${(last? last.text : 'New chat')}</div>
      </div>
      <div class="muted">${last? timeAgo(last.ts): ''}</div>
    </div>`;
  }).join('');
  qsa('.thread', threadList).forEach(t=>t.addEventListener('click', ()=>openThread(t.dataset.id)));
}
function openThread(id){
  activeChatId = id;
  const chat = state.chats.find(c=>c.id===id);
  const u = userById(chat.with);
  chatHeader.textContent = u.name;
  chatBody.innerHTML = chat.messages.map(m=>`<div class="msg ${m.from==='me'?'me':'them'}">${escapeHTML(m.text)}</div>`).join('');
  renderThreads(); 
  chatBody.scrollTop = chatBody.scrollHeight;
}
chatSend.addEventListener('click', sendMsg);
chatText.addEventListener('keydown', (e)=>{ if(e.key==='Enter') sendMsg() });
function sendMsg(){
  const txt = chatText.value.trim();
  if(!txt || !activeChatId) return;
  const chat = state.chats.find(c=>c.id===activeChatId);
  chat.messages.push({ id:uid(), from:'me', text:txt, ts:Date.now() });
  chatText.value='';
  saveState();
  openThread(activeChatId);
}
renderThreads();

const exploreGrid = qs('#exploreGrid');
function renderExplore(){
  const list = state.posts.slice().sort((a,b)=>b.ts-a.ts);
  exploreGrid.innerHTML = list.map(p=>`<div class="tile" data-id="${p.id}">
    ${p.type==='video' ? `<video src="${p.src}"></video><div class="type">🎞️</div>` : `<img src="${p.src}" alt=""/>`}
  </div>`).join('');
}
renderExplore();

const profileAvatar = qs('#profileAvatar');
const profileName = qs('#profileName');
const profileStats = qs('#profileStats');
const profileGrid = qs('#profileGrid');
function showProfile(userId='me'){
  const u = userById(userId);
  profileAvatar.src = u.avatar;
  profileName.textContent = u.name;
  const posts = state.posts.filter(p=>p.user===userId);
  profileStats.textContent = `${posts.length} posts • ${Math.floor(50+Math.random()*500)} followers • ${Math.floor(20+Math.random()*200)} following`;
  profileGrid.innerHTML = posts.map(p=>`<div class="tile">${p.type==='video'? `<video src="${p.src}"></video>`:`<img src="${p.src}" alt=""/>`}</div>`).join('');
  showView('profile');
}
qsa('.tab').forEach(btn=>btn.addEventListener('click', ()=>{
  qsa('.tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
}));

const suggestionsList = qs('#suggestionsList');
function renderSuggestions(){
  suggestionsList.innerHTML = state.users.map(u=>`<div class="row">
    <div class="left">
      <img src="${u.avatar}" class="avatar" alt="${u.name}"/>
      <div>
        <div><b>${u.name}</b></div>
        <div class="muted">Suggested for you</div>
      </div>
    </div>
    <button class="btn">Follow</button>
  </div>`).join('');
}
renderSuggestions();

const camVideo = qs('#cameraVideo');
const camCanvas = qs('#cameraCanvas');
const camStart = qs('#cameraStart');
const camStop = qs('#cameraStop');
const camSnap = qs('#cameraSnap');
const camUpload = qs('#cameraUpload');
let camStream = null;

camStart.addEventListener('click', async ()=>{
  try{
    camStream = await navigator.mediaDevices.getUserMedia({ video:true, audio:false });
    camVideo.srcObject = camStream;
  }catch(err){
    alert('Camera not available. Use the Upload Photo button.');
  }
});
camStop.addEventListener('click', ()=>{
  if(camStream){ camStream.getTracks().forEach(t=>t.stop()); camStream=null; camVideo.srcObject=null; }
});
camSnap.addEventListener('click', ()=>{
  if(!camVideo.videoWidth){ alert('Start the camera first.'); return; }
  camCanvas.width = camVideo.videoWidth;
  camCanvas.height = camVideo.videoHeight;
  const ctx = camCanvas.getContext('2d');
  ctx.drawImage(camVideo, 0,0);
  const dataURL = camCanvas.toDataURL('image/png');
  state.posts.push({ id:uid(), user:'me', type:'image', src:dataURL, caption:'📸 From camera', ts:Date.now(), likes:0, liked:false });
  saveState(); renderFeed(); renderExplore();
  showView('feed');
});
camUpload.addEventListener('change', async ()=>{
  const file = camUpload.files[0];
  if(!file) return;
  const src = await readFileAsDataURL(file);
  state.posts.push({ id:uid(), user:'me', type:'image', src, caption:'📸 Uploaded', ts:Date.now(), likes:0, liked:false });
  saveState(); renderFeed(); renderExplore();
  showView('feed');
});

function escapeHTML(s){ return s.replace(/[&<>'"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c])) }
function linkify(text){
  return text.replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

function init(){
  qs('#meAvatar').src = state.me.avatar;
  if(state.chats[0]) openThread(state.chats[0].id);
  renderReels();
}
init();

const oldSave = saveState;
saveState = function(){
  localStorage.setItem(stateKey, JSON.stringify(state));
  renderReels();
};
