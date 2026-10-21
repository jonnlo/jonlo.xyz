import { defineMiddleware } from 'astro:middleware';
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import config from '../../keystatic.config';
import { stampEntryUpdates } from './last-edited.mjs';
import { validateTagUpdate } from './tag-registry.server.mjs';

const localHandler = makeGenericAPIRouteHandler({ config });

export const onRequest = defineMiddleware(async ({ request, url }, next) => {
  if (request.method !== 'POST' || url.pathname.replace(/\/$/, '') !== '/api/keystatic/update'
      || request.headers.get('no-cors') !== '1' || request.headers.get('content-type') !== 'application/json') {
    return next();
  }
  let payload;
  try {
    payload = await request.clone().json();
  } catch {
    return next();
  }
  try {
    await validateTagUpdate(payload);
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Invalid tag references.', { status: 400 });
  }
  const editedRequest = new Request(request, { body: JSON.stringify(stampEntryUpdates(payload)) });
  const result = await localHandler(editedRequest);
  const body = result.body instanceof Uint8Array ? new Uint8Array(result.body) : result.body;
  return new Response(body, { status: result.status, headers: result.headers });
});
