// Prototype content. Replace these records with Keystatic collections when porting.
const thoughts = [
 {slug:'the-light-changed-first',title:'The light changed first',date:'2026-09-14',timestamp:'2026-09-14T22:39:00+08:00',form:'crumb',concepts:['attention','ordinary life'],body:['The room did not become quieter. The light changed first, and then I noticed how long I had been listening.'],sample:true},
 {slug:'a-list-is-a-small-promise',title:'A list is a small promise',date:'2026-09-12',timestamp:'2026-09-12T08:16:43+08:00',form:'crumb',concepts:['attention','self'],body:['A list is a small promise made by one version of me to another. By evening, both of us have changed.'],sample:true},
 {slug:'before-you-judge',title:'Before you judge',date:'2026-09-07',form:'essay',concepts:['standards','perception','judgment'],body:['There is a moment before judgment when a thing is allowed to be itself. It is usually a very short moment.','Then we reach for a comparison. What it should have been, what someone else would have done, what we would have done—under circumstances we have quietly improved for ourselves.','Standards are useful. They help us notice the difference between what is and what might be. But they can also become a way of not looking. Once something has been classified, we feel that we have understood it.'],heading:'The distance between seeing and knowing',more:['I wonder how much of what we call discernment is simply the speed with which we recognise something familiar. The category arrives before the encounter has finished.','Perhaps the question is not whether to judge, but whether we have stayed with a thing long enough to know what we are judging.','A little more attention will not make every judgment kinder. It might, however, make it more accurate.'],note:'A standard can clarify what we see. It can also decide, in advance, what we are able to notice.'},
 {slug:'still-doing-a-double-take',title:'Still doing a double take',date:'2026-09-03',form:'note',concepts:['seeing','photography','perception'],body:['The first look tells me what something is. The second look makes that answer less certain.','I keep thinking that photography begins there: not in noticing something beautiful, but in finding that an ordinary thing has not quite finished being ordinary.','Today it was the reflection of a window in another window. Nothing happened. I looked again.']},
 {slug:'force-updates',title:'Force updates',date:'2026-08-31',form:'crumb',concepts:['technology','self'],body:['My devices keep asking me to become a newer version of myself.','I would like to read the release notes first.']},
 {slug:'structural-compassion',title:'Structural compassion',date:'2026-08-24',form:'essay',concepts:['compassion','systems','Buddhism'],body:['It is easy to ask a person to be more patient. It is harder to ask what keeps making patience necessary.','A queue, a form, a rule: each contains an idea about the person who will encounter it. Whether they have time. Whether they understand the language. Whether they can afford to make a mistake.','Compassion is not only a quality of the person at the counter. It can be a quality of the counter, too.'],heading:'Where care is placed',more:['We tend to describe care as an exceptional act, something a good person does when a system fails. But perhaps care can be placed earlier, in the arrangement itself.','This does not remove the need for kindness. It gives kindness less repair work to do.'],note:'An afterthought, 02 September 2026: attention is not purely an individual responsibility.'},
 {slug:'the-productivity-of-hobbies',title:'The productivity of hobbies',date:'2026-08-08',form:'note',concepts:['work','attention'],body:['A hobby is something I do without needing to explain what it is for.','This seems to be the first thing I forget when I find one.','Soon there is a plan, a better tool, a way of measuring progress. I have made a small job out of the place I went to rest.']},
 {slug:'if-reality-were-good-enough',title:'If reality were good enough',date:'2026-07-29',form:'essay',concepts:['AI','seeing','technology'],body:['The image was convincing because it looked like what I expected to see. Reality is often less cooperative.','A real sky has an inconvenient wire running through it. A real conversation ends without finding its point. We learn to remove these things, then wonder why everything feels the same.','Perhaps the awkward details are not defects in the picture. Perhaps they are how the world lets us know it was there.']},
 {slug:'a-small-theory-of-enough',title:'A small theory of enough',date:'2025-12-18',form:'note',concepts:['attention','Buddhism'],body:['Enough is not a quantity I have been particularly good at recognising.','It tends to arrive quietly, some time before I stop.']},
 {slug:'what-a-map-leaves-out',title:'What a map leaves out',date:'2025-11-02',form:'essay',concepts:['design','systems'],body:['Every useful map leaves something out. This is not a failure of the map. It is how the map becomes useful.','The difficulty begins when we forget the omission was a choice.','I want to remember to ask, of any system that makes the world legible: legible to whom, and for what journey?']}
];
const main=document.querySelector('main');
const themeButton=document.querySelector('.theme-toggle');
const systemTheme=window.matchMedia('(prefers-color-scheme: dark)');
const updateThemeButton=()=>{
 if(!themeButton)return;
 const explicitTheme=document.documentElement.dataset.theme;
 const currentTheme=explicitTheme||(systemTheme.matches?'dark':'light');
 const nextTheme=currentTheme==='dark'?'light':'dark';
 const useSystem=Boolean(explicitTheme&&nextTheme===(systemTheme.matches?'dark':'light'));
 const label=useSystem?`Use system appearance (${nextTheme})`:`Switch to ${nextTheme} appearance`;
 themeButton.dataset.nextTheme=nextTheme;
 themeButton.setAttribute('aria-label',label);
 themeButton.title=label;
};
themeButton?.addEventListener('click',()=>{
 const explicitTheme=document.documentElement.dataset.theme;
 const currentTheme=explicitTheme||(systemTheme.matches?'dark':'light');
 const nextTheme=currentTheme==='dark'?'light':'dark';
 const systemValue=systemTheme.matches?'dark':'light';
 if(explicitTheme&&nextTheme===systemValue){
  delete document.documentElement.dataset.theme;
  try{localStorage.removeItem('journal-theme')}catch{}
 }else{
  document.documentElement.dataset.theme=nextTheme;
  try{localStorage.setItem('journal-theme',nextTheme)}catch{}
 }
 updateThemeButton();
});
systemTheme.addEventListener?.('change',updateThemeButton);
updateThemeButton();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formLabel=form=>form==='crumb'?'crumb':form;
const dateLabel=d=>d.replaceAll('-',' · ');
const indexDateLabel=d=>`${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(d.slice(5,7))-1]} ${d.slice(8,10)}`;
const articleDateLabel=d=>`${indexDateLabel(d)} ${d.slice(0,4)}`;
const longDateLabel=d=>`${['January','February','March','April','May','June','July','August','September','October','November','December'][Number(d.slice(5,7))-1]} ${Number(d.slice(8,10))}, ${d.slice(0,4)}`;
const monthLabel=d=>`${['January','February','March','April','May','June','July','August','September','October','November','December'][Number(d.slice(5,7))-1]} ${d.slice(0,4)}`;
const timeLabel=t=>t.slice(11,16);
const sortKey=t=>t.timestamp||`${t.date}T00:00:00+08:00`;
const conceptHref=(form,concept)=>`#/journal/${form}/${encodeURIComponent(concept)}`;
function recordFiling(t,form){
 return `<div class="record-filing"><span class="record-concepts">${t.concepts.map(c=>`<a href="${conceptHref(form,c)}">${esc(c)}</a>`).join('<i aria-hidden="true">·</i>')}</span></div>`;
}
function recordDateLink(t){
 return `<time datetime="${esc(t.date)}"><a class="record-date-link" href="#/thought/${encodeURIComponent(t.slug)}">${indexDateLabel(t.date)}</a><span class="record-date-arrow" aria-hidden="true">↗</span></time>`;
}
function expandedRecord(t,form){
 const body=t.form==='essay'?`<p>${esc(t.body[0])}</p>`:t.body.map(p=>`<p>${esc(p)}</p>`).join('');
 const filing=form==='all'?'':recordFiling(t,form);
 const readLink=form==='all'&&t.form==='essay'?`<a class="record-read" href="#/thought/${encodeURIComponent(t.slug)}" aria-label="Read ${esc(t.title)}"><span class="record-read-label">Read</span> <span class="record-read-arrow" aria-hidden="true">→</span></a>`:'';
 const preview=`<div class="record-preview${t.form==='poem'?' poem':''}">${body}</div>${readLink}`;
 const content=form==='all'&&t.form==='crumb'
  ? `${preview}${filing}`
  : form==='all'&&t.form==='note'
   ? `<h2><a href="#/thought/${encodeURIComponent(t.slug)}">${esc(t.title)}</a></h2>${preview}${filing}`
   : `<h2><a href="#/thought/${encodeURIComponent(t.slug)}">${esc(t.title)}</a></h2>${filing}${preview}`;
 return `<li class="record record-expanded record-${esc(t.form)}">${recordDateLink(t)}<article class="record-body">${content}</article><span class="record-form-cell">${esc(formLabel(t.form))}</span></li>`;
}
function compactRecord(t,form){return `<li class="record record-compact record-${esc(t.form)}">${recordDateLink(t)}<div class="record-body"><h2><a href="#/thought/${encodeURIComponent(t.slug)}">${esc(t.title)}</a></h2>${recordFiling(t,form)}</div></li>`}
function yearHeader(year,count){
 return `${year?`<h2 class="year-caption"><time datetime="${esc(year)}">${esc(year)}</time></h2>`:''}<span class="catalogue-status">${String(count).padStart(2,'0')} ${count===1?'record':'records'}</span>`;
}
function journalRecords(records,form){
 const yearCounts=records.reduce((counts,t)=>{const year=t.date.slice(0,4);counts[year]=(counts[year]||0)+1;return counts},{});
 return records.map((t,index)=>{
  const year=t.date.slice(0,4);
  const startsYear=index>0&&year!==records[index-1].date.slice(0,4);
  const divider=startsYear?`<li class="record-year">${yearHeader(year,yearCounts[year])}</li>`:'';
  return divider+(form==='all'?expandedRecord(t,form):compactRecord(t,form));
 }).join('');
}
const journalFormats=[['all','All'],['essay','Essays'],['note','Notes'],['crumb','Crumbs']];
function formatTabs(active,concept='',showCounts=true){
 return `<nav class="archive-tabs journal-tabs" aria-label="Entry formats">${journalFormats.map(([id,label])=>{
  const href=concept?conceptHref(id,concept):(id==='all'?'#/':`#/journal/${id}`);
  const count=showCounts?`<sup>${id==='all'?thoughts.length:thoughts.filter(t=>t.form===id).length}</sup>`:'';
  return `<a class="tab-${id}" href="${href}" ${id===active?'aria-current="page"':''}>${label}${count}</a>`;
 }).join('')}</nav>`;
}
function journal(filter='all',requestedConcept=''){
 const filters=journalFormats;
 const active=filters.some(([id])=>id===filter)?filter:'all';
 const allConcepts=new Set(thoughts.flatMap(t=>t.concepts));
 const concept=allConcepts.has(requestedConcept)?requestedConcept:'';
 const ordered=thoughts.filter(t=>(active==='all'||t.form===active)&&(!concept||t.concepts.includes(concept))).sort((a,b)=>sortKey(b).localeCompare(sortKey(a)));
 const updated=[...thoughts].sort((a,b)=>sortKey(b).localeCompare(sortKey(a)))[0]?.date||'';
 const clearHref=active==='all'?'#/':`#/journal/${active}`;
 const firstYear=ordered[0]?.date.slice(0,4);
 const summaryLabel=yearHeader(firstYear,ordered.filter(t=>t.date.slice(0,4)===firstYear).length);
 const filteredClass=active==='all'?'':' catalogue-filtered';
 main.innerHTML=`<div class="journal catalogue catalogue-${active}${filteredClass}">${formatTabs(active,concept)}${concept?`<div class="concept-filter"><span>${esc(concept)}</span><a href="${clearHref}">Clear ×</a></div>`:''}<section class="catalogue-sheet record-sheet"><div class="catalogue-summary">${summaryLabel}</div><ol class="records">${journalRecords(ordered,active)}</ol></section></div>`;
}
function article(slug){const t=thoughts.find(t=>t.slug===slug);if(!t){main.innerHTML='<div class="simple"><h1>Thought not found</h1><p><a href="#/">Return to entries</a></p></div>';return}document.title=`${t.title} — a home for thoughts`;const related=thoughts.filter(x=>x!==t&&x.concepts.some(c=>t.concepts.includes(c))).slice(0,3);if(!related.length)related.push(thoughts[0]);main.innerHTML=`<div class="article-view article-view-${esc(t.form)}">${formatTabs(t.form)}<article class="reading reading-${esc(t.form)} grid"><div class="article-content-sheet${t.note?' has-margin-note':''}"><header class="article-heading">${t.form==='crumb'?'':`<h1>${esc(t.title)}</h1>`}<div class="article-meta-line"><span class="article-datetime"><time datetime="${esc(t.timestamp||t.date)}">${articleDateLabel(t.date)}</time>${t.timestamp?`<span>${timeLabel(t.timestamp)}</span>`:''}</span><a class="article-form" href="#/journal/${encodeURIComponent(t.form)}">${esc(formLabel(t.form))}</a></div></header><div class="prose ${t.form==='poem'?'poem':''}">${t.body.map(p=>`<p>${esc(p)}</p>`).join('')}</div>${t.note?`<aside class="margin-note"><span>01 / In the margin</span>${esc(t.note)}</aside>`:''}${t.more?`<div class="prose"><h2>${esc(t.heading)}</h2>${t.more.map(p=>`<p>${esc(p)}</p>`).join('')}</div>`:''}<div class="article-tags" aria-label="Concepts"><span class="article-concepts">${t.concepts.map(c=>`<a class="article-concept" href="${conceptHref('all',c)}">${esc(c)}</a>`).join('')}</span></div></div><section class="related"><h2>Related thoughts</h2>${related.map(x=>`<a class="related-record related-${esc(x.form)}" href="#/thought/${encodeURIComponent(x.slug)}"><time datetime="${esc(x.date)}">${indexDateLabel(x.date)}</time><span>${esc(x.title)}</span><b>${esc(formLabel(x.form))}</b></a>`).join('')}</section></article></div>`}
function simple(){
 main.innerHTML=`<section class="support-page about-page"><header class="support-heading"><h1>A place to put things into words, and return to them later.</h1></header><div class="support-document"><div class="about-copy"><p>I write here about design, technology, Buddhism, attention, and the small details of ordinary life.</p><p>Sometimes an essay. Sometimes a few crumbs. The concepts beside each entry are ways of noticing connections; they will probably change as the collection grows.</p></div></div><section class="now-section" id="now" aria-labelledby="now-heading"><header class="now-heading"><h2 id="now-heading">Now</h2><p class="archive-line"><time datetime="2026-09-10">Sep 10 2026</time></p></header><dl class="status-log"><div><dt>Reading</dt><dd>Returning to the notes in the margins of books I thought I had finished.</dd></div><div><dt>Thinking</dt><dd>The difference between paying attention and trying to be attentive.</dd></div><div><dt>Working</dt><dd>A home for these thoughts. Finding a structure that leaves room for things to change.</dd></div><div><dt>Listening</dt><dd>The city with the window open.</dd></div></dl></section></section>`;
}
function render(){const [page='',raw='',conceptRaw='']=location.hash.slice(2).split('/');let value,concept;try{value=decodeURIComponent(raw);concept=decodeURIComponent(conceptRaw)}catch{value='';concept=''}document.title='a home for thoughts';document.querySelectorAll('[data-nav]').forEach(a=>{const section=['about','now'].includes(page)?'about':'journal';const active=a.dataset.nav===section;if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});if(page==='thought')article(value);else if(['about','now'].includes(page)){simple();if(page==='now')requestAnimationFrame(()=>document.querySelector('#now')?.scrollIntoView())}else if(page==='journal')journal(value,concept);else if(page==='archive')journal(value);else if(page==='form')journal(value);else journal()}
window.addEventListener('hashchange',()=>{if(location.hash==='#main'){main.focus({preventScroll:true});return}render();window.scrollTo(0,0);main.focus({preventScroll:true})});render();
