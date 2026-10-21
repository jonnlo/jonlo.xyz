import { parse as parseYaml } from 'yaml';

export function formatLastEdited(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

// Stamp only entry frontmatter sent through the local editor's save endpoint.
// The existing entry date, body, other collections, and deletions are preserved.
export function stampEntryUpdates(payload, instant = new Date().toISOString()) {
  if (!payload || !Array.isArray(payload.additions)) return payload;
  return {
    ...payload,
    additions: payload.additions.map(addition => {
      if (!addition || typeof addition.path !== 'string' || !/^src\/content\/entries\/[^/]+\.mdoc$/.test(addition.path) || typeof addition.contents !== 'string') return addition;
      const source = Buffer.from(addition.contents, 'base64url').toString('utf8');
      const match = source.match(/^(---\r?\n)([\s\S]*?)(\r?\n---(?:\r?\n|$))/);
      if (!match) return addition;
      const newline = match[1].includes('\r') ? '\r\n' : '\n';
      const metadata = match[2].split(/\r?\n/).filter(line => !/^lastEdited\s*:/.test(line));
      const data = parseYaml(match[2]);
      if (data.timestamp) {
        const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);
        const time = String(data.timestamp).replace(/^\d{4}-\d{2}-\d{2}T/, '');
        const combined = `${date}T${time}`;
        for (let i = 0; i < metadata.length; i++) {
          if (/^timestamp\s*:/.test(metadata[i])) metadata[i] = `timestamp: ${JSON.stringify(combined)}`;
        }
      }
      metadata.push(`lastEdited: ${JSON.stringify(instant)}`);
      const stamped = match[1] + metadata.join(newline) + match[3] + source.slice(match[0].length);
      return { ...addition, contents: Buffer.from(stamped).toString('base64url') };
    }),
  };
}
