'use strict';
const frame = document.querySelector('iframe');
const controls = document.querySelector('#controls');
const status = document.querySelector('#status');
const storageKey = 'jons-log-oklch-v4';
const definitions = [
  ['canvas', 'Page background / canvas'], ['sheet', 'Default archive paper / sheet'],
  ['paper-all', 'All / paper'], ['paper-document', 'Article + About / paper'],
  ['paper-essay', 'Essays / paper'], ['paper-note', 'Notes / paper'],
  ['paper-crumb', 'Crumbs / paper'], ['paper-poem', 'Poem / paper'],
  ['ink', 'Primary text / ink'], ['muted', 'Secondary text / muted'],
  ['rule', 'Borders and dividers / rule'], ['accent', 'Link and focus accent'],
  ['hover-essay', 'Essay label + hover'], ['hover-note', 'Note label + hover'],
  ['hover-crumb', 'Crumb label + hover'], ['hover-poem', 'Poem hover'],
  ['selection-bg', 'Text selection background'], ['selection-ink', 'Text selection color']
];
let defaults, values, activeMode = 'dark', previewMode = 'tuned';
const format = v => `oklch(${v[0]}% ${v[1]} ${v[2]})`;

function hexToOklch(hex) {
  const rgb = hex.match(/[\da-f]{2}/gi).map(x => parseInt(x, 16) / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
  const [r, g, b] = rgb;
  const l = Math.cbrt(.4122214708*r + .5363325363*g + .0514459929*b);
  const m = Math.cbrt(.2119034982*r + .6806995451*g + .1073969566*b);
  const s = Math.cbrt(.0883024619*r + .2817188376*g + .6299787005*b);
  const L = .2104542553*l + .793617785*m - .0040720468*s;
  const a = 1.9779984951*l - 2.428592205*m + .4505937099*s;
  const bb = .0259040371*l + .7827717662*m - .808675766*s;
  return [+(L*100).toFixed(4), +Math.hypot(a, bb).toFixed(6), +((Math.atan2(bb, a)*180/Math.PI + 360)%360).toFixed(4)];
}

function parseColor(raw) {
  raw = raw.trim();
  if (raw.startsWith('oklch(')) return raw.match(/[\d.]+/g).map(Number);
  if (raw.startsWith('#')) return hexToOklch(raw.slice(1));
  throw new Error(`Unsupported color ${raw}`);
}

function splitLightDark(raw) {
  if (!raw.startsWith('light-dark(')) return [raw, raw];
  const body = raw.slice('light-dark('.length, -1);
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '(') depth++;
    else if (body[i] === ')') depth--;
    else if (body[i] === ',' && depth === 0) return [body.slice(0, i).trim(), body.slice(i + 1).trim()];
  }
  throw new Error(`Invalid light-dark token ${raw}`);
}

function valid(v) {
  return Array.isArray(v) && v.length === 3 && v.every(Number.isFinite) && v[0] >= 0 && v[0] <= 100 && v[1] >= 0 && v[1] <= .4 && v[2] >= 0 && v[2] <= 360;
}

function update() {
  const root = frame.contentDocument?.documentElement;
  if (!root) return;
  root.dataset.theme = activeMode;
  root.querySelector('.theme-toggle')?.setAttribute('hidden', '');
  for (const [key] of definitions) {
    const liveValue = previewMode === 'original' ? defaults[activeMode][key] : values[activeMode][key];
    root.style.setProperty(`--${key}`, format(liveValue));
    const field = document.getElementById(`${activeMode}-${key}`);
    field.querySelector('.swatch-current').style.background = format(values[activeMode][key]);
    field.querySelector('output').textContent = format(values[activeMode][key]);
  }
  const tokenLines = definitions.map(([key]) => `  --${key}: ${format(values[activeMode][key])};`).join('\n');
  const mediaScheme = activeMode === 'dark' ? 'dark' : 'light';
  document.querySelector('#css').value = `/* Selected in /exp — ${activeMode} theme tokens */\n:root[data-theme="${activeMode}"] {\n${tokenLines}\n}\n\n@media (prefers-color-scheme: ${mediaScheme}) {\n  :root:not([data-theme]) {\n${tokenLines}\n  }\n}\n`;
  try { localStorage.setItem(storageKey, JSON.stringify(values)); }
  catch { status.textContent = 'Browser storage unavailable; copy or download values to keep them.'; }
}

function syncInputs() {
  for (const [key] of definitions) {
    const field = document.getElementById(`${activeMode}-${key}`);
    if (!field) continue;
    field.querySelectorAll('input').forEach(input => { input.value = values[activeMode][key][+input.dataset.channel]; });
  }
}

function renderControls() {
  controls.replaceChildren();
  for (const [key, label] of definitions) {
    const field = document.createElement('fieldset');
    field.id = `${activeMode}-${key}`;
    field.innerHTML = `<legend>${label}</legend><div class="swatch-pair"><div><span>Source</span><div class="swatch swatch-original"></div><code class="original-value"></code></div><div><span>Current</span><div class="swatch swatch-current"></div></div></div><code>--${key}</code>`;
    field.querySelector('.swatch-original').style.background = format(defaults[activeMode][key]);
    field.querySelector('.swatch-original').title = format(defaults[activeMode][key]);
    field.querySelector('.original-value').textContent = format(defaults[activeMode][key]);
    [['L', 100, .01], ['C', .4, .0001], ['H', 360, .1]].forEach(([name, max, step], channel) => {
      const row = document.createElement('label');
      row.className = 'channel';
      row.innerHTML = `<span>${name}</span><input aria-label="${label} ${name} slider" type="range" min="0" max="${max}" step="${step}" data-channel="${channel}"><input aria-label="${label} ${name} value" type="number" min="0" max="${max}" step="${step}" data-channel="${channel}">`;
      row.querySelectorAll('input').forEach(input => input.addEventListener('input', () => {
        if (input.value === '' || !Number.isFinite(input.valueAsNumber)) return;
        values[activeMode][key][channel] = Math.min(max, Math.max(0, input.valueAsNumber));
        row.querySelectorAll('input').forEach(other => { if (other !== input) other.value = values[activeMode][key][channel]; });
        update();
      }));
      field.append(row);
    });
    field.append(document.createElement('output'));
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'token-reset';
    reset.textContent = 'Reset token';
    reset.setAttribute('aria-label', `Reset ${label}`);
    reset.addEventListener('click', () => {
      values[activeMode][key] = [...defaults[activeMode][key]];
      field.querySelectorAll('input').forEach(input => { input.value = values[activeMode][key][+input.dataset.channel]; });
      update();
      status.textContent = `Restored ${activeMode} --${key} to its source value.`;
    });
    field.append(reset);
    controls.append(field);
  }
  syncInputs();
}

async function init() {
  try {
    const response = await fetch('../prototype/styles.css');
    if (!response.ok) throw new Error('Styles unavailable');
    const css = await response.text();
    defaults = Object.fromEntries(['light', 'dark'].map(mode => [mode, Object.fromEntries(definitions.map(([key]) => {
      const raw = css.match(new RegExp(`--${key}:\\s*([^;]+);`))?.[1];
      if (!raw) throw new Error(`Missing token --${key}`);
      const pair = splitLightDark(raw);
      const value = parseColor(pair[mode === 'dark' ? 1 : 0]);
      if (!valid(value)) throw new Error(`Unsupported token --${key}`);
      return [key, value];
    }))]));
    values = structuredClone(defaults);
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      for (const mode of ['light', 'dark']) for (const [key] of definitions) if (valid(saved?.[mode]?.[key])) values[mode][key] = saved[mode][key];
    } catch {}
    renderControls();
    update();
  } catch (error) {
    status.textContent = `Could not load site tokens: ${error.message}. Serve the Blog repository root over HTTP (see README).`;
  }
}

frame.addEventListener('load', () => { if (values) update(); });
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  activeMode = button.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  renderControls();
  if (frame.contentDocument?.readyState === 'complete') update();
  status.textContent = `Editing and previewing ${activeMode} theme tokens.`;
}));
document.querySelector('#toggle-controls').addEventListener('click', event => {
  const focused = document.body.classList.toggle('preview-only');
  event.currentTarget.setAttribute('aria-pressed', String(focused));
  event.currentTarget.textContent = focused ? 'Show controls' : 'Focus preview';
});
document.querySelectorAll('[data-preview-mode]').forEach(button => button.addEventListener('click', () => {
  previewMode = button.dataset.previewMode;
  document.querySelectorAll('[data-preview-mode]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  if (frame.contentDocument?.readyState === 'complete') update();
  status.textContent = `${previewMode === 'original' ? 'Original' : 'Tuned'} colors shown in the live preview; ${activeMode} tokens remain selected for editing.`;
}));
document.querySelectorAll('[data-route]').forEach(button => button.addEventListener('click', () => { frame.contentWindow.location.hash = `#${button.dataset.route}`; }));
document.querySelector('#width').addEventListener('click', event => {
  const narrow = frame.classList.toggle('narrow');
  event.target.textContent = narrow ? 'Wide preview' : 'Narrow preview';
  event.target.setAttribute('aria-pressed', String(narrow));
});
document.querySelector('#reset').addEventListener('click', () => {
  if (!defaults) return;
  values = structuredClone(defaults);
  renderControls();
  update();
  status.textContent = 'Restored both palettes to their source colors.';
});
document.querySelector('#copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(document.querySelector('#css').value); status.textContent = 'CSS copied.'; }
  catch { document.querySelector('#css').select(); status.textContent = 'Select and copy the CSS below.'; }
});
document.querySelector('#download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([document.querySelector('#css').value], {type: 'text/css'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${activeMode}-color-tokens.css`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
init();
