import type { APIRoute } from 'astro';
import { readTags, createSharedTag } from './tag-registry.server.mjs';

// Registered only in local development. Registry records are independent from
// entry names, so changing a tag label keeps all existing assignments intact.
export const prerender = false;
export const GET: APIRoute = async () => {
  return Response.json((await readTags()).sort((a, b) => a.name.localeCompare(b.name)), {
    headers: { 'Cache-Control': 'no-store' },
  });
};

export const POST: APIRoute = async ({ request, url }) => {
  if (request.headers.get('no-cors') !== '1' || request.headers.get('content-type') !== 'application/json'
      || (request.headers.has('origin') && request.headers.get('origin') !== url.origin)) {
    return new Response('Invalid local editor request', { status: 403 });
  }
  try {
    const body = await request.json();
    return Response.json(await createSharedTag(body.name), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unable to create tag.' }, { status: 400 });
  }
};
