import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveR2ImageUrl } from '../src/utils/resolveR2ImageUrl.js';

test('unwraps a legacy logo already wrapped by the API', () => {
    const key = 'empresas/logos/logo_12ab.png';
    const stored = `backend/r2_proxy.php?key=${encodeURIComponent(key)}`;
    const wrapped = `/api/r2_proxy.php?key=${encodeURIComponent(stored)}`;
    const expected = `/api/r2_proxy.php?key=${encodeURIComponent(key)}`;
    assert.equal(resolveR2ImageUrl(stored, '/api'), expected);
    assert.equal(resolveR2ImageUrl(wrapped, '/api'), expected);
    assert.equal(resolveR2ImageUrl(expected, '/api'), expected);
});
test('preserves a valid external image and does not request an incomplete proxy', () => {
    assert.equal(resolveR2ImageUrl('https://images.example/avatar.png', '/api'), 'https://images.example/avatar.png');
    assert.equal(resolveR2ImageUrl('backend/r2_proxy.php', '/api'), '');
});

test('uses the bundled VIAX logo for plain and legacy fallback references', () => {
    assert.equal(resolveR2ImageUrl('logo.png', '/api'), '/logo.png');
    assert.equal(resolveR2ImageUrl('/logo.png', '/api'), '/logo.png');
    assert.equal(resolveR2ImageUrl('/api/r2_proxy.php?key=logo.png', '/api'), '/logo.png');
    assert.equal(resolveR2ImageUrl('empresas/logo.png', '/api'), '/api/r2_proxy.php?key=empresas%2Flogo.png');
});
