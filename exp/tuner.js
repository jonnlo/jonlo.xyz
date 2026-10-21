'use strict';
const frame = document.querySelector('iframe');
const controls = document.querySelector('#controls');
const status = document.querySelector('#status');
const storageKey = 'jons-log-oklch-v1';
const definitions = [
  ['canvas', 'Gray background / canvas'],
  ['paper-all', 'All / paper'], ['paper-essay', 'Essays / paper'],
  ['paper-note', 'Notes / paper'], ['paper-fragment', 'Fragments / paper'],
  ['hover-essay', 'Essay / darker type label'], ['hover-note', 'Note / darker type label'],
  ['hover-fragment', 'Line / darker type label'], ['paper-document', 'Article + About / paper']
];
let defaults, values;
const format = v => `oklch(${v[0]}% ${v[1]} ${v[2]})`;
// Convert the existing hexadecimal label colors to OKLCH, retaining their actual appearance.
function hexToOklch(hex) {
  const rgb = hex.match(/\w\w/g).map(x => parseInt(x,16)/255).map(x => x <= .04045 ? x/12.92 : ((x+.055)/1.055)**2.4);
  const [r,g,b] = rgb;
  const l = Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b);
  const m = Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b);
  const s = Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  const L = .2104542553*l+.793617785*m-.0040720468*s;
  const a = 1.9779984951*l-2.428592205*m+.4505937099*s;
  const bb = .0259040371*l+.7827717662*m-.808675766*s;
  return [+(L*100).toFixed(4), +Math.hypot(a,bb).toFixed(6), +((Math.atan2(bb,a)*180/Math.PI+360)%360).toFixed(4)];
}
function valid(v) {return Array.isArray(v) && v.length===3 && v.every(Number.isFinite) && v[0]>=0 && v[0]<=100 && v[1]>=0 && v[1]<=.4 && v[2]>=0 && v[2]<=360;}
function update() {
  for (const [key] of definitions) {
    frame.contentDocument.documentElement.style.setProperty(`--${key}`, format(values[key]));
    const field = document.getElementById(key);
    field.querySelector('.swatch-current').style.background = format(values[key]);
    field.querySelector('output').textContent = format(values[key]);
  }
  document.querySelector('#css').value = `/* Selected in /exp — paper and type-label tokens */\n:root {\n${definitions.map(([k])=>`  --${k}: ${format(values[k])};`).join('\n')}\n}\n`;
  try {localStorage.setItem(storageKey, JSON.stringify(values));} catch {status.textContent='Browser storage unavailable; copy or download values to keep them.';}
}
function syncInputs(){for(const [key] of definitions) document.getElementById(key).querySelectorAll('input').forEach(input=>{input.value=values[key][+input.dataset.channel];});}
async function init(){
  try {
    const response = await fetch('../prototype/styles.css');
    if(!response.ok) throw new Error('Styles unavailable');
    const css = await response.text();
    defaults = Object.fromEntries(definitions.map(([key])=>{
      const raw = css.match(new RegExp(`--${key}:\\s*([^;]+);`))?.[1];
      if(!raw) throw new Error(`Missing token --${key}`);
      const v = raw.startsWith('oklch(') ? raw.match(/[\d.]+/g).map(Number) : hexToOklch(raw.slice(1));
      if(!valid(v)) throw new Error(`Unsupported token --${key}`);
      return [key,v];
    }));
    values=structuredClone(defaults);
    try {const saved=JSON.parse(localStorage.getItem(storageKey));for(const [k] of definitions) if(valid(saved?.[k])) values[k]=saved[k];} catch {}
    for(const [key,label] of definitions){
      const field=document.createElement('fieldset');field.id=key;
      field.innerHTML=`<legend>${label}</legend><div class="swatch-pair"><div><span>Original</span><div class="swatch swatch-original"></div><code class="original-value"></code></div><div><span>Current</span><div class="swatch swatch-current"></div></div></div><code>--${key}</code>`;
      field.querySelector('.swatch-original').style.background=format(defaults[key]);
      field.querySelector('.swatch-original').title=format(defaults[key]);
      field.querySelector('.original-value').textContent=format(defaults[key]);
      [['L',100,.01],['C',.4,.0001],['H',360,.1]].forEach(([name,max,step],i)=>{
        const row=document.createElement('label');row.className='channel';
        row.innerHTML=`<span>${name}</span><input aria-label="${label} ${name} slider" type="range" min="0" max="${max}" step="${step}" data-channel="${i}"><input aria-label="${label} ${name} value" type="number" min="0" max="${max}" step="${step}" data-channel="${i}">`;
        row.querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>{
          if(input.value==='' || !Number.isFinite(input.valueAsNumber)) return;
          values[key][i]=Math.min(max,Math.max(0,input.valueAsNumber));
          row.querySelectorAll('input').forEach(other=>{if(other!==input)other.value=values[key][i];});update();
        }));field.append(row);
      });
      field.append(document.createElement('output'));
      const reset=document.createElement('button');
      reset.type='button';reset.className='token-reset';reset.textContent='Reset token';
      reset.setAttribute('aria-label',`Reset ${label}`);
      reset.addEventListener('click',()=>{
        values[key]=[...defaults[key]];
        field.querySelectorAll('input').forEach(input=>{input.value=values[key][+input.dataset.channel];});
        update();status.textContent=`Restored --${key} to its site value.`;
      });
      field.append(reset);controls.append(field);
    }
    syncInputs(); update();
  } catch(error){status.textContent=`Could not load site tokens: ${error.message}. Serve the Blog repository root over HTTP (see README).`;}
}
frame.addEventListener('load',()=>{if(values)update();});
document.querySelectorAll('[data-route]').forEach(button=>button.addEventListener('click',()=>{frame.contentWindow.location.hash='#'+button.dataset.route;}));
document.querySelector('#width').addEventListener('click',event=>{const narrow=frame.classList.toggle('narrow');event.target.textContent=narrow?'Wide preview':'Narrow preview';event.target.setAttribute('aria-pressed',String(narrow));});
document.querySelector('#reset').addEventListener('click',()=>{if(!defaults)return;values=structuredClone(defaults);syncInputs();update();status.textContent='Restored current site colors.';});
document.querySelector('#copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(document.querySelector('#css').value);status.textContent='CSS copied.';}catch{document.querySelector('#css').select();status.textContent='Select and copy the CSS below.';}});
document.querySelector('#download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([document.querySelector('#css').value],{type:'text/css'}));const a=document.createElement('a');a.href=url;a.download='color-tokens.css';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
init();
