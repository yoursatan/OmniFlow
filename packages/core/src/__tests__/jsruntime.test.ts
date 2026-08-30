/* ==========================================================
 * jsruntime.test.ts — M2 QuickJSRuntime 单元测试（15+ 用例）
 * ========================================================== */

import { describe, it, expect, afterEach } from 'vitest';
import {
  createJsRuntime,
  QuickJSRuntime,
  evalHeader,
  evalExploreUrl,
  evalSearchUrl,
} from '../jsruntime/quickjs.js';
import realSources from './fixtures/real-sources.json';
import realRss from './fixtures/real-rss-sources.json';

describe('M2 QuickJSRuntime', () => {
  let rt: QuickJSRuntime;
  afterEach(() => {
    try {
      rt?.dispose();
    } catch {
      // ignore
    }
  });

  it('eval 1+2 = 3', async () => {
    rt = await createJsRuntime();
    expect(rt.evalSync('1+2')).toBe(3);
  });

  it('evalSync JSON roundtrip', async () => {
    rt = await createJsRuntime();
    expect(rt.evalSync('JSON.stringify({a:1,b:"x"})')).toBe(
      JSON.stringify({ a: 1, b: 'x' })
    );
  });

  it('timeout infinite loop', async () => {
    rt = await createJsRuntime();
    expect(() => rt.evalSync('while(true){}', { timeoutMs: 20 })).toThrow(
      /interrupt|timeout|time/i
    );
  });

  it('preloadLib + reuse', async () => {
    rt = await createJsRuntime();
    rt.preloadLib('function add(a,b){return a+b;}');
    expect(rt.evalSync('add(2,3)')).toBe(5);
    expect(rt.evalSync('add(10,20)')).toBe(30);
  });

  it('dispose then eval throws', async () => {
    rt = await createJsRuntime();
    rt.dispose();
    expect(() => rt.evalSync('1')).toThrow();
  });

  it('inject key/page variables override', async () => {
    rt = await createJsRuntime();
    const v = rt.evalSync('`key=${key},page=${page}`', {
      variables: { key: '斗破苍穹', page: 2 },
    });
    expect(v).toBe('key=斗破苍穹,page=2');
  });

  it('source get/set + java.get/put mirror', async () => {
    rt = await createJsRuntime();
    rt.evalSync('java.put("a","123");');
    expect(rt.evalSync('source.get("a")')).toBe('123');
    rt.evalSync('source.set("b","456");');
    expect(rt.evalSync('java.get("b")')).toBe('456');
  });

  it('Url() returns bookSourceUrl', async () => {
    rt = await createJsRuntime({
      sourceVariables: { bookSourceUrl: 'https://example.com' },
    });
    expect(rt.evalSync('Url()')).toBe('https://example.com');
  });

  it('java.androidId() is UUID', async () => {
    rt = await createJsRuntime();
    const id = rt.evalSync('java.androidId()') as string;
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('TYPE() returns 2', async () => {
    rt = await createJsRuntime();
    expect(rt.evalSync('TYPE()')).toBe(2);
  });

  it('crypto.md5 vector', async () => {
    rt = await createJsRuntime();
    expect(rt.evalSync('crypto.md5("abc")')).toBe(
      '900150983cd24fb0d6963f7d28e17f72'
    );
  });

  it('crypto.sha256 length 64', async () => {
    rt = await createJsRuntime();
    const s = rt.evalSync('crypto.sha256("abc")') as string;
    expect(s.length).toBe(64);
    expect(/^[0-9a-f]{64}$/.test(s)).toBe(true);
  });

  it('crypto.base64 roundtrip', async () => {
    rt = await createJsRuntime();
    const enc = rt.evalSync('crypto.base64Encode("你好 OmniFlow")') as string;
    const dec = rt.evalSync(`crypto.base64Decode(${JSON.stringify(enc)})`);
    expect(dec).toBe('你好 OmniFlow');
  });

  // —— 派生求值器 ——
  it('evalHeader classic JSON.stringify header', async () => {
    rt = await createJsRuntime({
      sourceVariables: { bookSourceUrl: 'https://example.com' },
    });
    const script =
      '@js:\nJSON.stringify({"User-Agent":"UA1","Referer":Url()});\n';
    const h = evalHeader(rt, script);
    expect(typeof h).toBe('object');
    expect(h?.['User-Agent']).toBe('UA1');
    expect((h as Record<string, string>)?.Referer).toBe('https://example.com');
  });

  it('evalExploreUrl returns {title,url}[]', async () => {
    rt = await createJsRuntime();
    const script = `@js:
var result = [];
function push(t, u) { result.push({title:t, url:u}); }
push('首页','/');
push('分类','/cat');
JSON.stringify(result);`;
    const arr = evalExploreUrl(rt, script) as Array<{ title: string; url: string }>;
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBe(2);
    expect(arr[0]?.title).toBe('首页');
  });

  it('evalSearchUrl url concat', async () => {
    rt = await createJsRuntime();
    const script = `@js:
'https://api.com/search?wd=' + encodeURIComponent(key) + '&pg=' + page;`;
    const url = evalSearchUrl(rt, script, {
      variables: { key: '诡秘之主', page: 3 },
    });
    expect(url).toContain('wd=' + encodeURIComponent('诡秘之主'));
    expect(url).toContain('pg=3');
  });

  // —— 真实 fixtures 最小集 ——
  it('real-source: 🥝猕猴桃漫画 header', async () => {
    const src = (realSources as Array<Record<string, unknown>>).find(
      s => String(s.bookSourceName ?? '').includes('猕猴桃漫画')
    );
    expect(src).toBeTruthy();
    rt = await createJsRuntime({
      sourceVariables: { bookSourceUrl: String(src?.bookSourceUrl ?? '') },
    });
    const header = evalHeader(rt, String(src?.header ?? ''));
    expect(header).toBeTypeOf('object');
    expect(header?.['User-Agent']).toMatch(/Android 9/);
  });

  it('real-source: 📖Lofter header has deviceid', async () => {
    const src = (realSources as Array<Record<string, unknown>>).find(
      s => String(s.bookSourceName ?? '').includes('Lofter')
    );
    expect(src).toBeTruthy();
    rt = await createJsRuntime({
      sourceVariables: { bookSourceUrl: String(src?.bookSourceUrl ?? '') },
    });
    const header = evalHeader(rt, String(src?.header ?? ''));
    expect(header).toBeTypeOf('object');
    expect((header as Record<string, string>)?.deviceid).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('real-source: 🍅番茄小说聚合API searchUrl', async () => {
    const src = (realSources as Array<Record<string, unknown>>).find(
      s => String(s.bookSourceName ?? '').includes('番茄小说聚合')
    );
    expect(src).toBeTruthy();
    rt = await createJsRuntime({
      sourceVariables: { bookSourceUrl: String(src?.bookSourceUrl ?? '') },
      sourceMap: { variable: '0,0,0,0' },
    });
    const url = evalSearchUrl(rt, String(src?.searchUrl ?? ''), {
      variables: { key: '凡人修仙传', page: 2 },
    });
    expect(typeof url).toBe('string');
    expect(url).toContain('api/search');
    expect(url).toContain(encodeURIComponent('凡人修仙传'));
    expect(url).toContain('offset=10');
  });

  it('real-rss import sanity', () => {
    // 确保 realRss 能导入且是数组
    expect(Array.isArray(realRss)).toBe(true);
    expect(realRss.length).toBeGreaterThan(0);
  });

  it('eval (async) resolves value', async () => {
    rt = await createJsRuntime();
    const v = await rt.eval('40+2');
    expect(v).toBe(42);
  });

  it('eval (async) rejects on error', async () => {
    rt = await createJsRuntime();
    await expect(rt.eval('throw new Error("boom")')).rejects.toThrow(/boom/);
  });

  it('crypto.hexDecodeToString sanity', async () => {
    rt = await createJsRuntime();
    const s = rt.evalSync('crypto.hexDecodeToString("e4bda0e5a5bd")'); // 你好
    expect(s).toBe('你好');
  });

  it('cookie get/set roundtrip', async () => {
    rt = await createJsRuntime();
    rt.evalSync(`cookie.setCookie("https://a.com", "x=1");`);
    expect(rt.evalSync(`cookie.getCookie("https://a.com")`)).toBe('x=1');
    expect(rt.evalSync(`cookie.getCookie("https://b.com")`)).toBe('');
  });

  it('cache get/set roundtrip', async () => {
    rt = await createJsRuntime();
    rt.evalSync(`cache.set("k1","v1");`);
    expect(rt.evalSync(`cache.get("k1")`)).toBe('v1');
    rt.evalSync(`cache.delete("k1");`);
    expect(rt.evalSync(`cache.get("k1")`)).toBe('');
  });

  it('source.put alias for source.set', async () => {
    rt = await createJsRuntime();
    rt.evalSync(`source.put("x", "hello");`);
    expect(rt.evalSync(`source.get("x")`)).toBe('hello');
  });

  it('source.getVariable reads sourceMap.variable', async () => {
    rt = await createJsRuntime({ sourceMap: { variable: 'foo-bar' } });
    expect(rt.evalSync(`source.getVariable()`)).toBe('foo-bar');
  });

  it('source.getLoginInfoMap returns object', async () => {
    rt = await createJsRuntime();
    const obj = rt.evalSync(`JSON.stringify(source.getLoginInfoMap())`);
    expect(typeof obj).toBe('string');
    expect(JSON.parse(obj as string)).toEqual({});
  });

  it('java.base64Encode / java.base64Decode sanity', async () => {
    rt = await createJsRuntime();
    const enc = rt.evalSync(`java.base64Encode("测试")`) as string;
    expect(typeof enc).toBe('string');
    expect(enc.length).toBeGreaterThan(0);
    const dec = rt.evalSync(`java.base64Decode(${JSON.stringify(enc)})`);
    expect(dec).toBe('测试');
  });

  it('sourceVariables bookSourceName/Type inject', async () => {
    rt = await createJsRuntime({
      sourceVariables: { bookSourceName: 'Test Source', bookSourceType: 1 },
    });
    expect(rt.evalSync(`source.bookSourceName`)).toBe('Test Source');
    expect(rt.evalSync(`source.bookSourceType`)).toBe(1);
  });
});
