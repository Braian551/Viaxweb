import assert from 'node:assert/strict';
import { test } from 'node:test';
import { requestJson } from '../src/config/httpClient.js';

test('an HTML error page is never surfaced as an error message', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => new Response('<html>debug</html>', {
        status: 404, headers: { 'content-type': 'text/html' },
    }));
    const result = await requestJson('/api/unavailable.php');
    assert.equal(result.status, 404);
    assert.doesNotMatch(result.message, /html|debug/);
});

test('authenticated JSON endpoints report access denial', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => new Response('{"error":"debug"}', {
        status: 403, headers: { 'content-type': 'application/json' },
    }));
    const result = await requestJson('/api/admin/dashboard_stats.php', { sessionRequired: true });
    assert.equal(result.status, 403);
    assert.match(result.message, /permiso/);
});
