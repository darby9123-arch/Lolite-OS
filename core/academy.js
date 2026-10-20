/* Lolite Academy: interactive guides, quizzes and persistent progress. */
(()=>{
 'use strict';
 const courses=window.LoliteAcademyCourses||[];
 const KEY='loliteAcademyProgressV1';
 const lessonIds=new Set(courses.flatMap(c=>c.lessons.map(l=>c.id+':'+l.id)));
 const read=()=>{try{
   const data=JSON.parse(localStorage.getItem(KEY)||'{}');
   return new Set(Array.isArray(data.completed)?data.completed.filter(id=>lessonIds.has(id)):[]);
 }catch{return new Set()}};
 const completed=read();
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({completed:[...completed]}))}catch{}};
 const state={view:'home',course:'',lesson:'',answer:null,checked:false,filter:'All',search:''};
 const total=lessonIds.size;
 const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const courseBy=id=>courses.find(c=>c.id===id);
 const lessonBy=(c,id)=>c?.lessons.find(l=>l.id===id);
 const count=c=>c.lessons.filter(l=>completed.has(c.id+':'+l.id)).length;
 const pct=c=>Math.round(100*count(c)/c.lessons.length);
 const icon=id=>window.LoliteIcons?.tile(id)||'';
 const names={home:'Home',games:'Game Store','cloud-gaming':'Cloud Gaming',files:'Files',settings:'Settings',notes:'Quick Notes',paint:'Lolite Paint',browser:'Ultraviolet Browser',chatroom:'Lolite Chat'};
 const nextLesson=c=>c.lessons.find(l=>!completed.has(c.id+':'+l.id))||c.lessons[0];
 const progress=n=>'<div class="la-track" role="progressbar" aria-label="Progress" aria-valuenow="'+n+'" aria-valuemin="0" aria-valuemax="100"><span style="width:'+n+'%"></span></div>';
 function side(){
   const active=state.view==='course'||state.view==='lesson'?'catalogue':state.view;
   const nav=(key,text)=>'<button type="button" data-la-action="'+key+'" aria-current="'+(active===key?'page':'false')+'">'+text+'</button>';
   const percent=total?Math.round(completed.size*100/total):0;
   return '<aside class="la-side"><div class="la-brand"><div class="la-logo">L</div><div><strong>Lolite Academy</strong><small>LEARN · PRACTISE · MASTER</small></div></div>'+
     '<nav class="la-nav" aria-label="Academy navigation">'+nav('home','⌂ &nbsp; Dashboard')+nav('catalogue','▦ &nbsp; All courses')+nav('achievements','★ &nbsp; Achievements')+'</nav>'+
     '<div class="la-side-label">Your progress</div><div class="la-side-progress"><div class="la-small">Overall completion</div><strong>'+percent+'%</strong>'+progress(percent)+'<div class="la-small">'+completed.size+' of '+total+' lessons</div></div></aside>';
 }
 function top(title,subtitle){
   return '<header class="la-top"><div><div class="la-kicker">LOLite · YOUR LEARNING SPACE</div><h1>'+esc(title)+'</h1><p>'+esc(subtitle)+'</p></div><div class="la-xp">'+completed.size*20+' XP ★</div></header>';
 }
 function card(c){
   const amount=count(c),percent=pct(c);
   return '<article class="la-course" style="--la-accent:'+esc(c.accent)+'"><div class="la-cover"><div class="la-course-icon">'+icon(c.icon)+'</div><span class="la-pill">'+esc(c.level)+'</span></div>'+
      '<div class="la-cardbody"><div class="la-small">'+esc(c.topic)+'</div><h3>'+esc(c.title)+'</h3><p>'+esc(c.description)+'</p>'+
      '<div class="la-card-meta"><span>'+amount+' / '+c.lessons.length+' lessons</span><span>'+percent+'%</span></div>'+progress(percent)+
      '<button type="button" class="la-secondary" data-la-action="course" data-id="'+c.id+'">'+(percent===100?'Review course':amount?'Continue course':'Start course')+' →</button></div></article>';
 }
 function home(){
   const nextCourse=courses.find(c=>count(c)>0&&count(c)<c.lessons.length)||courses.find(c=>count(c)<c.lessons.length)||courses[0];
   if(!nextCourse)return top('Academy','Courses are not available.');
   const next=nextLesson(nextCourse);
   return top('Welcome to Academy','Learn Lolite OS with clear tutorials, practical tasks and quick questions.')+
    '<section class="la-hero"><div><div class="la-kicker">YOUR NEXT STEP</div><h2>'+(completed.size?'Keep building your skills.':'Make yourself at home in Lolite.')+'</h2>'+
    '<p>Take a course, practise inside real Lolite apps, and build your own learning streak. Your completed lessons are saved on this browser.</p>'+
    '<button class="la-primary" type="button" data-la-action="lesson" data-id="'+nextCourse.id+':'+next.id+'">'+(completed.size?'Continue learning':'Start your first lesson')+' →</button></div>'+
    '<div class="la-hero-stat">'+Math.round(completed.size/total*100)+'%</div></section>'+
    '<div class="la-heading"><div><h2>Popular courses</h2><small>Start anywhere. Learn at your own pace.</small></div><button class="la-textbtn" type="button" data-la-action="catalogue">View all →</button></div>'+
    '<div class="la-course-grid">'+courses.slice(0,4).map(card).join('')+'</div>'+
    '<div class="la-heading" style="margin-top:25px"><div><h2>How learning works</h2><small>Short lessons. Practical tips. Questions that help everything stick.</small></div></div>'+
    '<div class="la-badge-list"><div class="la-badge-item"><span class="la-symbol">①</span><b>Read</b><small>Follow simple step-by-step guides</small></div>'+
    '<div class="la-badge-item"><span class="la-symbol">②</span><b>Try</b><small>Launch the real app and practise</small></div>'+
    '<div class="la-badge-item"><span class="la-symbol">③</span><b>Check</b><small>Answer questions and earn 20 XP</small></div></div>';
 }
 function catalogue(){
   const q=state.search.trim().toLowerCase();
   const matches=courses.filter(c=>(state.filter==='All'||c.level===state.filter)&&
      (!q||[c.title,c.topic,c.description,...c.lessons.map(l=>l.title)].join(' ').toLowerCase().includes(q)));
   return top('All courses','Browse guides that cover the apps and features you actually use.')+
     '<div class="la-searchrow"><input class="la-search" type="search" value="'+esc(state.search)+'" data-la-search placeholder="Search courses and lessons" aria-label="Search courses">'+
     ['All','Beginner','Intermediate'].map(f=>'<button type="button" class="la-filter" data-la-action="filter" data-id="'+f+'" aria-pressed="'+(f===state.filter)+'">'+f+'</button>').join('')+'</div>'+
     (matches.length?'<div class="la-course-grid">'+matches.map(card).join('')+'</div>':'<div class="la-empty">No courses match that search.</div>');
 }
 function courseView(){
   const c=courseBy(state.course);if(!c)return home();
   return '<button type="button" class="la-back" data-la-action="catalogue">← All courses</button>'+
     top(c.title,c.description)+
     '<section class="la-hero"><div><div class="la-kicker">'+esc(c.topic)+' · '+esc(c.level)+'</div><h2>'+c.lessons.length+' lessons, one step at a time.</h2>'+
     '<p>Each lesson has clear instructions and a quick quiz. Pick up where you left off or review a lesson whenever you need.</p>'+
     '<button type="button" class="la-primary" data-la-action="lesson" data-id="'+c.id+':'+nextLesson(c).id+'">'+(pct(c)===100?'Review lessons':'Continue course')+' →</button></div>'+
     '<div class="la-hero-stat">'+pct(c)+'%</div></section>'+
     '<div class="la-heading"><div><h2>Course lessons</h2><small>'+count(c)+' of '+c.lessons.length+' completed</small></div></div>'+
     progress(pct(c))+'<div class="la-lesson-list">'+c.lessons.map((l,i)=>{
       const done=completed.has(c.id+':'+l.id);
       return '<button class="la-lesson-entry" type="button" data-la-action="lesson" data-id="'+c.id+':'+l.id+'">'+
       '<span class="la-number'+(done?' is-done':'')+'">'+(done?'✓':i+1)+'</span>'+
       '<span class="la-entry-text"><span class="la-entry-title">'+esc(l.title)+'</span><small>'+l.minutes+' min · '+(done?'Completed':'Lesson '+(i+1))+'</small></span><span aria-hidden="true">→</span></button>';
     }).join('')+'</div>';
 }
 function lessonView(){
   const c=courseBy(state.course),l=lessonBy(c,state.lesson);if(!c||!l)return home();
   const idx=c.lessons.indexOf(l),done=completed.has(c.id+':'+l.id),correct=state.answer===l.answer;
   const feedback=state.checked?'<div class="la-feedback'+(correct?'':' is-wrong')+'" role="status"><b>'+(correct?'Correct! Nicely done.':'Not quite — give it another try.')+'</b><div>'+esc(l.why)+'</div></div>':'';
   return '<button class="la-back" type="button" data-la-action="course" data-id="'+c.id+'">← '+esc(c.title)+'</button>'+
    top(l.title,'Lesson '+(idx+1)+' of '+c.lessons.length+' · '+l.minutes+' minute read')+
    '<section class="la-panel"><div class="la-kicker">LESSON GOAL</div><h2>'+esc(l.lead)+'</h2><p>Follow these steps, then test yourself with one quick question.</p>'+
    '<ol class="la-steps">'+l.steps.map(s=>'<li><span>'+esc(s)+'</span></li>').join('')+'</ol>'+
    '<div class="la-tip"><b>Quick tip</b><div>'+esc(l.tip)+'</div></div>'+
    '<div class="la-actions"><button type="button" class="la-secondary" data-la-action="openapp" data-id="'+esc(l.app)+'">Try it in '+esc(names[l.app]||'Lolite')+' ↗</button></div></section>'+
    '<section class="la-quiz"><div class="la-kicker">KNOWLEDGE CHECK · '+(done?'COMPLETED':'20 XP')+'</div><h3>'+esc(l.q)+'</h3>'+
    '<div class="la-answers" role="group" aria-label="Quiz answer options">'+l.options.map((a,i)=>
      '<button type="button" class="la-answer" data-la-action="answer" data-id="'+i+'" aria-pressed="'+(state.answer===i)+'">'+String.fromCharCode(65+i)+'. '+esc(a)+'</button>').join('')+'</div>'+feedback+
    (done?'<div class="la-feedback" role="status">✓ Lesson complete. Review it any time.</div>':
      '<button type="button" class="la-primary" data-la-action="check" '+(state.answer===null?'disabled':'')+'>Check answer</button>')+
    '</section><div class="la-actions"><button type="button" class="la-secondary" data-la-action="course" data-id="'+c.id+'">← Course overview</button>'+
    (idx<c.lessons.length-1?'<button type="button" class="la-primary" data-la-action="lesson" data-id="'+c.id+':'+c.lessons[idx+1].id+'">Next lesson →</button>':
       '<button type="button" class="la-primary" data-la-action="catalogue">Explore more courses →</button>')+'</div>';
 }
 function achievements(){
   const finished=courses.filter(c=>pct(c)===100).length;
   const badges=[
     ['First Steps','Complete your first lesson',completed.size>=1],
     ['Getting the Hang of It','Finish five lessons',completed.size>=5],
     ['Power User','Finish ten lessons',completed.size>=10],
     ['Course Graduate','Finish a full course',finished>=1],
     ['Lolite Explorer','Complete all Academy lessons',completed.size===total]
   ];
   return top('Your achievements','Celebrate the skills you have learned.')+
     '<section class="la-hero"><div><div class="la-kicker">PROGRESS REPORT</div><h2>'+completed.size+' of '+total+' lessons finished</h2><p>Your learning progress is saved on this device. Complete more lessons to unlock milestones.</p>'+
     '<button type="button" class="la-primary" data-la-action="catalogue">Keep learning →</button></div><div class="la-hero-stat">'+(completed.size*20)+' XP</div></section>'+
     '<div class="la-badge-list">'+badges.map(b=>'<article class="la-badge-item" style="opacity:'+(b[2]?'1':'.62')+'"><div class="la-symbol">'+(b[2]?'★':'◇')+'</div><b>'+esc(b[0])+'</b><small>'+esc(b[1])+' · '+(b[2]?'Unlocked':'Locked')+'</small></article>').join('')+'</div>'+
     '<p class="la-muted" style="margin-top:19px">Progress is stored in your browser. Different devices do not automatically share your progress.</p>';
 }
 function root(){return document.querySelector('.window[data-window-id="academy"] #lolite-academy')}
 function render(){
   const r=root();if(!r)return;
   const page=state.view==='catalogue'?catalogue():state.view==='course'?courseView():state.view==='lesson'?lessonView():state.view==='achievements'?achievements():home();
   r.innerHTML=side()+'<main class="la-main">'+page+'</main>';
 }
 function navigate(page,cid='',lid=''){
   state.view=page;state.course=cid;state.lesson=lid;state.checked=false;state.answer=null;
   render();root()?.querySelector('.la-main')?.scrollTo(0,0);
 }
 function click(event){
   const btn=event.target.closest('[data-la-action]');if(!btn)return;
   const action=btn.dataset.laAction,id=btn.dataset.id||'';
   if(['home','catalogue','achievements'].includes(action)){navigate(action);return}
   if(action==='course'){if(courseBy(id))navigate('course',id);return}
   if(action==='lesson'){
     const pair=id.split(':');if(lessonBy(courseBy(pair[0]),pair[1]))navigate('lesson',pair[0],pair[1]);return;
   }
   if(action==='filter'){state.filter=id;render();return}
   if(action==='answer'){state.answer=Number(id);state.checked=false;render();return}
   if(action==='check'){
     const c=courseBy(state.course),l=lessonBy(c,state.lesson);
     if(!l||state.answer===null)return;
     state.checked=true;
     if(state.answer===l.answer){const key=c.id+':'+l.id;const first=!completed.has(key);completed.add(key);save();if(first)window.LoliteQuests?.academyCompleted?.(c.id,l.id)}
     render();return;
   }
   if(action==='openapp'&&Object.prototype.hasOwnProperty.call(names,id)){
     window.openApp?.(id,names[id],id==='settings'?760:940,630);
   }
 }
 function input(event){
   if(!event.target.matches('[data-la-search]'))return;
   state.search=event.target.value;
   const cursor=event.target.selectionStart;
   render();
   const field=root()?.querySelector('[data-la-search]');
   if(field){field.focus();try{field.setSelectionRange(cursor,cursor)}catch{}}
 }
 const originalPage=window.page;
 window.page=function(id){return id==='academy'?'<section id="lolite-academy" class="la-app" aria-label="Lolite Academy"></section>':originalPage(id)};
 const originalOpen=window.openApp;
 window.openApp=function(id,title,w,h){
   originalOpen(id,title||(id==='academy'?'Lolite Academy':title),w||(id==='academy'?1050:undefined),h||(id==='academy'?710:undefined));
   if(id==='academy')setTimeout(activate,0);
 };
 function activate(){
   const r=root();if(!r)return;
   if(r.dataset.academyReady==='1'){render();return}
   r.dataset.academyReady='1';r.addEventListener('click',click);r.addEventListener('input',input);
   render();
 }
 window.LoliteAcademy=Object.freeze({
   open:()=>window.openApp('academy','Lolite Academy',1050,710),
   getProgress:()=>({completed:completed.size,total,points:completed.size*20}),
   getCourses:()=>courses.map(c=>({id:c.id,title:c.title,lessons:c.lessons.length,completed:count(c)}))
 });
})();