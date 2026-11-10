import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import canonical from '../lib/typert.remote-client.js';

const require = createRequire(import.meta.url);
async function loadClient(language = 'en', embedded = false, dark = false, hostScheme = '', bodyDark = dark) {
  let client, contribution;
  const registrations = [], calls = [];
  runInNewContext(readFileSync(new URL('../dist/client.js', import.meta.url), 'utf8'), {
    URLSearchParams,
    navigator: { language },
    document: { documentElement: { style: { colorScheme: hostScheme } }, body: { hasAttribute: () => bodyDark } },
    matchMedia: () => ({ matches: dark }),
    window: {
      location: { hash: embedded ? '#kaitu-page=kaitu-auday&kaitu-embed=1' : '#kaitu-page=kaitu-auday' },
      __ModuleLoader__: { load({ id, factory }) {
        assert.equal(id, 'kaitu-auday');
        client = factory(name => {
          assert.ok(['react', 'react/jsx-runtime'].includes(name), `Unexpected host module: ${name}`);
          return require(name);
        });
      } },
    },
  });
  const ctx = {
    effect() {},
    get() { return undefined; },
    inject() { return { dispose() {} }; },
    remote: {
      async $mount(info) { contribution = info; return () => {}; },
      kaituAuday: { async request(...args) { calls.push(args); return { ok: true, value: '{"cached":true}' }; } },
    },
    plugin(plugin) { plugin.apply(ctx); },
    slots: { inject(_, callback) { callback(); }, register(meta, component) { registrations.push({ meta, component }); } },
  };
  await client.apply(ctx);
  return { contribution, registrations, calls };
}

test('bundled client resolves with only host React and preserves Typert input/result codecs', async () => {
  const { contribution, registrations, calls } = await loadClient();
  const actual = contribution.descriptors[0], expected = canonical.descriptors[0];
  assert.equal(actual.id, expected.id);
  for (const strict of [false, true]) {
    const a = actual.input({ strict }), e = expected.input({ strict });
    assert.equal(JSON.stringify(a.jsonSchema), JSON.stringify(e.jsonSchema));
    for (const value of [{ operation: 'search', input: '{}' }, {}, { operation: 7, input: '{}' },
      { operation: 'search', input: null }, { operation: 'search', input: '{}', extra: true }]) {
      const actual = a.create().safeParse(value), expected = e.create().safeParse(value);
      assert.equal(actual.success, expected.success);
      assert.equal(JSON.stringify(actual.success ? actual.data : actual.error.issues),
        JSON.stringify(expected.success ? expected.data : expected.error.issues));
    }
  }
  for (const value of ['{}', 7, null, {}])
    assert.equal(actual.result.create().safeParse(value).success, expected.result.create().safeParse(value).success);
  assert.deepEqual(actual.invoke({ kaituAuday: { request(...args) { return args; } } },
    { operation: 'search', input: '{}' }), ['search', '{}']);
  const main = registrations.find(({ meta }) => meta.name === 'main');
  assert.equal(JSON.stringify(await main.meta.inject().request('search', { offset: 20 })), '{"cached":true}');
  assert.deepEqual(calls, [['search', '{"offset":20}']]);
});

test('standalone and embedded pages render in both languages and themes without a data request', async () => {
  for (const language of ['en', 'zh']) for (const embedded of [false, true]) for (const dark of [false, true]) {
    const { registrations, calls } = await loadClient(language, embedded, dark);
    const main = registrations.find(({ meta }) => meta.name === 'main');
    assert.equal(main.meta.key, 'kaitu-auday');
    assert.equal(registrations.find(({ meta }) => meta.name === 'sidebar.panellist').meta.id, 'kaitu-auday');
    const html = renderToStaticMarkup(React.createElement(main.component, main.meta.inject()));
    assert.equal(html.includes('<h1>Auday</h1>'), !embedded);
    assert.ok(html.includes(language === 'zh' || embedded ? '检查依赖' : 'Check prerequisites'));
    assert.ok(html.includes(`data-theme="${dark ? 'dark' : 'light'}"`));
    assert.equal(calls.length, 0);
  }
});

test('explicit host theme overrides the system and legacy body theme', async () => {
  for (const hostScheme of ['light', 'dark']) for (const dark of [false, true]) {
    const { registrations } = await loadClient('en', false, dark, hostScheme);
    const main = registrations.find(({ meta }) => meta.name === 'main');
    const html = renderToStaticMarkup(React.createElement(main.component, main.meta.inject()));
    assert.ok(html.includes(`data-theme="${hostScheme}"`));
  }
});

test('combined host schemes use the resolved body theme', async () => {
  for (const hostScheme of ['light dark', 'dark light']) for (const dark of [false, true]) for (const bodyDark of [false, true]) {
    const { registrations } = await loadClient('en', false, dark, hostScheme, bodyDark);
    const main = registrations.find(({ meta }) => meta.name === 'main');
    const html = renderToStaticMarkup(React.createElement(main.component, main.meta.inject()));
    assert.ok(html.includes(`data-theme="${bodyDark ? 'dark' : 'light'}"`));
  }
});
