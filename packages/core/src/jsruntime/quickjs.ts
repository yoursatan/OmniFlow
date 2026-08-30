/* ==========================================================
 * QuickJSRuntime — M2 JS 沙箱实现（quickjs-emscripten WASM）
 * Legado 兼容层注入：source / java / cookie / cache / crypto / 全局函数
 * ========================================================== */

import { getQuickJS } from 'quickjs-emscripten';
import type { QuickJSHandle, QuickJSContext, QuickJSRuntime as QJSRuntime, QuickJSWASMModule } from 'quickjs-emscripten';
import type { JSRuntime, EvalOptions, JSRuntimeAPI } from './index.js';

import { md5, sha1, sha256, base64Encode, base64Decode, hexDecodeToString, urlEncode } from './crypto.js';

export interface CreateJSRuntimeOptions {
  api?: Partial<JSRuntimeAPI>;
  sourceVariables?: { bookSourceUrl?: string; bookSourceName?: string; bookSourceType?: number };
  sourceMap?: Record<string, unknown>;
}

/**
 * 全局缓存 getQuickJS() Promise，避免重复加载 WASM 模块
 */
let _quickJsPromise: Promise<QuickJSWASMModule> | null = null;

function _getQ(): Promise<QuickJSWASMModule> {
  if (!_quickJsPromise) {
    _quickJsPromise = getQuickJS();
  }
  return _quickJsPromise;
}

/** Legado 风格固定 mock UUID（每次沙箱创建一致） */
const MOCK_ANDROID_ID = '12345678-1234-5678-1234-567812345678';

/** Legado 风格 UA（java.getWebViewUA 用） */
const LEGADO_UA = 'Legado/3.23.072619 (Linux; Android 11)';

export class QuickJSRuntime implements JSRuntime {
  private _rt: QJSRuntime;
  private _ctx: QuickJSContext;
  private _q: QuickJSWASMModule;
  private _disposed = false;
  private _preloaded: string[] = [];
  private _deadline = 0;

  /** source 内部持久化映射（共享给 java.get/put / source.get/set） */
  private _sourceMap: Map<string, unknown> = new Map();
  /** source.getVariable() 读取的 variable 字符串 */
  private _sourceVariable: string = '';
  /** source.getLoginInfoMap() 读取的登录信息映射 */
  private _loginInfoMap: Record<string, unknown> = {};
  /** cache 内部存储（简单 Map） */
  private _cacheMap: Map<string, string> = new Map();
  /** cookie 存储 { url -> cookie string } */
  private _cookieMap: Map<string, string> = new Map();

  /** sourceVariables 传入的书源元信息 */
  private _bookSourceUrl: string;
  private _bookSourceName: string;
  private _bookSourceType: number;

  /** 用户注入的 JSRuntimeAPI（可选） */
  private _userApi?: Partial<JSRuntimeAPI>;

  constructor(
    q: QuickJSWASMModule,
    rt: QJSRuntime,
    ctx: QuickJSContext,
    opts: CreateJSRuntimeOptions = {}
  ) {
    this._q = q;
    this._rt = rt;
    this._ctx = ctx;
    this._userApi = opts.api;
    this._bookSourceUrl = opts.sourceVariables?.bookSourceUrl ?? '';
    this._bookSourceName = opts.sourceVariables?.bookSourceName ?? '';
    this._bookSourceType = opts.sourceVariables?.bookSourceType ?? 0;

    // sourceMap 初始化：variable 字段 → _sourceVariable，其余 → _sourceMap
    if (opts.sourceMap) {
      for (const [k, v] of Object.entries(opts.sourceMap)) {
        if (k === 'variable') {
          this._sourceVariable = String(v ?? '');
        } else {
          this._sourceMap.set(k, v);
        }
      }
    }

    // 安装超时中断处理器
    this._rt.setInterruptHandler(() => {
      return Date.now() > this._deadline;
    });

    // 构造时做一次全局注入
    this._injectGlobals();
  }

  /* ---------- 公共 API ---------- */

  preloadLib(code: string): void {
    this._checkDisposed();
    this._preloaded.push(code);
  }

  evalSync(code: string, options: EvalOptions = {}): unknown {
    this._checkDisposed();

    const timeoutMs = options.timeoutMs ?? 5000;
    const memoryLimitMB = options.memoryLimitMB ?? 64;
    this._rt.setMemoryLimit(memoryLimitMB * 1024 * 1024);

    // 更新中断 deadline
    this._deadline = Date.now() + timeoutMs;

    const ctx = this._ctx;
    const parts: string[] = [];

    // 1. 预加载代码
    if (this._preloaded.length > 0) {
      parts.push(this._preloaded.join('\n'));
    }

    // 2. 注入变量（key/page 及 EvalOptions.variables）
    const vars: Record<string, unknown> = {
      key: '',
      page: 1,
      ...options.variables,
    };
    // 如果用户传入 variables，覆盖 key/page
    if (options.variables && 'key' in options.variables) vars.key = options.variables.key;
    if (options.variables && 'page' in options.variables) vars.page = options.variables.page;

    // 注入变量为全局属性（setProp 方式）
    const g = ctx.global;
    for (const [k, v] of Object.entries(vars)) {
      const h = this._toHandle(v);
      ctx.setProp(g, k, h);
      h.dispose();
    }

    // 3. 注入 input 作为 result
    if (options.input !== undefined) {
      const inputH = this._toHandle(options.input);
      ctx.setProp(g, 'result', inputH);
      inputH.dispose();
    } else {
      // 默认 result = ''
      const emptyH = ctx.newString('');
      ctx.setProp(g, 'result', emptyH);
      emptyH.dispose();
    }

    // 4. 拼接最终代码
    parts.push(code);
    const fullCode = parts.join('\n;\n');

    // 5. 求值
    const evalResult = ctx.evalCode(fullCode);
    let valueHandle: QuickJSHandle | null = null;
    let errorHandle: QuickJSHandle | null = null;

    try {
      if ('error' in evalResult && evalResult.error !== undefined) {
        errorHandle = evalResult.error;
        const errDump = ctx.dump(errorHandle);
        const errMsg = typeof errDump === 'object' && errDump !== null && 'message' in (errDump as object)
          ? String((errDump as { message: unknown }).message)
          : String(errDump);
        throw new Error(errMsg);
      } else if ('value' in evalResult) {
        valueHandle = evalResult.value;
        const dumped = ctx.dump(valueHandle);
        return dumped;
      }
      return undefined;
    } finally {
      valueHandle?.dispose();
      errorHandle?.dispose();
      // 清理 pending jobs
      try { this._rt.executePendingJobs(); } catch { /* ignore */ }
    }
  }

  eval(code: string, options?: EvalOptions): Promise<unknown> {
    this._checkDisposed();
    try {
      return Promise.resolve(this.evalSync(code, options));
    } catch (e) {
      return Promise.reject(e);
    }
  }

  dispose(): void {
    if (this._disposed) return;
    this._disposed = true;
    try { this._ctx.dispose(); } catch { /* ignore */ }
    try { this._rt.dispose(); } catch { /* ignore */ }
  }

  /* ---------- 内部辅助 ---------- */

  private _checkDisposed(): void {
    if (this._disposed) {
      throw new Error('QuickJSRuntime has been disposed');
    }
  }

  /** 宿主 JS 值 → QuickJS Handle（简单类型支持） */
  private _toHandle(v: unknown): QuickJSHandle {
    const ctx = this._ctx;
    if (v === null || v === undefined) return ctx.undefined;
    if (v === true) return ctx.true;
    if (v === false) return ctx.false;
    switch (typeof v) {
      case 'string': return ctx.newString(v);
      case 'number': return ctx.newNumber(v);
      case 'bigint': return ctx.newNumber(Number(v));
      case 'symbol': return ctx.newString(String(v));
      case 'object': {
        if (Array.isArray(v)) {
          const arr = ctx.newArray();
          for (let i = 0; i < v.length; i++) {
            const eh = this._toHandle(v[i]);
            ctx.setProp(arr, i, eh);
            eh.dispose();
          }
          return arr;
        } else {
          const obj = ctx.newObject();
          for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
            const vh = this._toHandle(val);
            ctx.setProp(obj, k, vh);
            vh.dispose();
          }
          return obj;
        }
      }
      default:
        return ctx.undefined;
    }
  }

  /** 构造时全局注入：source / java / cookie / cache / crypto / 全局函数 */
  private _injectGlobals(): void {
    const ctx = this._ctx;
    const g = ctx.global;

    /* ---------- source 对象 ---------- */
    const sourceObj = ctx.newObject();

    // source.get(k: string): string
    const sourceGetFn = ctx.newFunction('get', (...args: QuickJSHandle[]) => {
      const key = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      const v = this._sourceMap.get(key);
      return ctx.newString(v === undefined ? '' : String(v));
    });
    ctx.setProp(sourceObj, 'get', sourceGetFn);
    sourceGetFn.dispose();

    // source.set(k: string, v: unknown): void
    const sourceSetFn = ctx.newFunction('set', (...args: QuickJSHandle[]) => {
      const key = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      const val = args[1] !== undefined ? ctx.dump(args[1]) : undefined;
      this._sourceMap.set(key, val);
      return ctx.undefined;
    });
    ctx.setProp(sourceObj, 'set', sourceSetFn);
    sourceSetFn.dispose();

    // source.put 同 set（Legado alias）
    const sourcePutFn = ctx.newFunction('put', (...args: QuickJSHandle[]) => {
      const key = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      const val = args[1] !== undefined ? ctx.dump(args[1]) : undefined;
      this._sourceMap.set(key, val);
      return ctx.undefined;
    });
    ctx.setProp(sourceObj, 'put', sourcePutFn);
    sourcePutFn.dispose();

    // source.getVariable(): string
    const sourceGetVarFn = ctx.newFunction('getVariable', () => {
      return ctx.newString(this._sourceVariable ?? '');
    });
    ctx.setProp(sourceObj, 'getVariable', sourceGetVarFn);
    sourceGetVarFn.dispose();

    // source.setVariable(v: string): void
    const sourceSetVarFn = ctx.newFunction('setVariable', (...args: QuickJSHandle[]) => {
      this._sourceVariable = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      return ctx.undefined;
    });
    ctx.setProp(sourceObj, 'setVariable', sourceSetVarFn);
    sourceSetVarFn.dispose();

    // source.getLoginInfoMap(): object
    const sourceGetLoginFn = ctx.newFunction('getLoginInfoMap', () => {
      const h = this._toHandle(this._loginInfoMap);
      // 我们需要返回这个 handle，但 newFunction 返回值会自动被 context 接管
      // 这里直接返回 h 即可，caller 不需要 dispose 返回值
      return h;
    });
    ctx.setProp(sourceObj, 'getLoginInfoMap', sourceGetLoginFn);
    sourceGetLoginFn.dispose();

    // source.setLoginInfoMap(obj: object): void
    const sourceSetLoginFn = ctx.newFunction('setLoginInfoMap', (...args: QuickJSHandle[]) => {
      const obj = args[0] !== undefined ? ctx.dump(args[0]) : undefined;
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        this._loginInfoMap = obj as Record<string, unknown>;
      } else {
        this._loginInfoMap = {};
      }
      return ctx.undefined;
    });
    ctx.setProp(sourceObj, 'setLoginInfoMap', sourceSetLoginFn);
    sourceSetLoginFn.dispose();

    // source.bookSourceUrl / bookSourceName / bookSourceType
    const bsuH = ctx.newString(this._bookSourceUrl ?? '');
    ctx.setProp(sourceObj, 'bookSourceUrl', bsuH);
    bsuH.dispose();
    const bsnH = ctx.newString(this._bookSourceName ?? '');
    ctx.setProp(sourceObj, 'bookSourceName', bsnH);
    bsnH.dispose();
    const bstH = ctx.newNumber(this._bookSourceType ?? 0);
    ctx.setProp(sourceObj, 'bookSourceType', bstH);
    bstH.dispose();

    // source.log 兼容（存在 fixture 里用 source.log）
    const sourceLogFn = ctx.newFunction('log', (...args: QuickJSHandle[]) => {
      const parts = args.map(a => String(ctx.dump(a)));
      // no-op by default，未来可接 log API
      if (this._userApi?.log?.info) {
        this._userApi.log.info(parts.join(' '));
      }
      return ctx.undefined;
    });
    ctx.setProp(sourceObj, 'log', sourceLogFn);
    sourceLogFn.dispose();

    ctx.setProp(g, 'source', sourceObj);
    sourceObj.dispose();

    /* ---------- java 对象 ---------- */
    const javaObj = ctx.newObject();

    const javaGetFn = ctx.newFunction('get', (...args: QuickJSHandle[]) => {
      const key = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      const v = this._sourceMap.get(key);
      return ctx.newString(v === undefined ? '' : String(v));
    });
    ctx.setProp(javaObj, 'get', javaGetFn);
    javaGetFn.dispose();

    const javaPutFn = ctx.newFunction('put', (...args: QuickJSHandle[]) => {
      const key = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      const val = args[1] !== undefined ? ctx.dump(args[1]) : undefined;
      this._sourceMap.set(key, val);
      return ctx.undefined;
    });
    ctx.setProp(javaObj, 'put', javaPutFn);
    javaPutFn.dispose();

    const javaAjaxFn = ctx.newFunction('ajax', () => {
      // M2 阶段 stub
      if (this._userApi?.http?.ajax) {
        const r = this._userApi.http.ajax('');
        return ctx.newString(typeof r === 'string' ? r : '');
      }
      return ctx.newString('');
    });
    ctx.setProp(javaObj, 'ajax', javaAjaxFn);
    javaAjaxFn.dispose();

    const javaAndroidIdFn = ctx.newFunction('androidId', () => {
      return ctx.newString(MOCK_ANDROID_ID);
    });
    ctx.setProp(javaObj, 'androidId', javaAndroidIdFn);
    javaAndroidIdFn.dispose();

    const javaGetWebViewUAFn = ctx.newFunction('getWebViewUA', () => {
      return ctx.newString(LEGADO_UA);
    });
    ctx.setProp(javaObj, 'getWebViewUA', javaGetWebViewUAFn);
    javaGetWebViewUAFn.dispose();

    const javaToastFn = ctx.newFunction('toast', () => ctx.undefined);
    ctx.setProp(javaObj, 'toast', javaToastFn);
    javaToastFn.dispose();

    const javaLongToastFn = ctx.newFunction('longToast', () => ctx.undefined);
    ctx.setProp(javaObj, 'longToast', javaLongToastFn);
    javaLongToastFn.dispose();

    const javaUrlEncodeFn = ctx.newFunction('urlEncode', (...args: QuickJSHandle[]) => {
      const s = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      return ctx.newString(encodeURIComponent(s));
    });
    ctx.setProp(javaObj, 'urlEncode', javaUrlEncodeFn);
    javaUrlEncodeFn.dispose();

    const javaHexDecodeFn = ctx.newFunction('hexDecodeToString', (...args: QuickJSHandle[]) => {
      const s = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      try {
        return ctx.newString(hexDecodeToString(s));
      } catch {
        return ctx.newString('');
      }
    });
    ctx.setProp(javaObj, 'hexDecodeToString', javaHexDecodeFn);
    javaHexDecodeFn.dispose();

    const javaGetStringFn = ctx.newFunction('getString', () => ctx.newString(''));
    ctx.setProp(javaObj, 'getString', javaGetStringFn);
    javaGetStringFn.dispose();

    // java.base64Encode / base64Decode（fixtures 中使用，如 XH发布页 source.jsLib）
    const javaB64EncFn = ctx.newFunction('base64Encode', (...args: QuickJSHandle[]) => {
      const s = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      return ctx.newString(base64Encode(s));
    });
    ctx.setProp(javaObj, 'base64Encode', javaB64EncFn);
    javaB64EncFn.dispose();

    const javaB64DecFn = ctx.newFunction('base64Decode', (...args: QuickJSHandle[]) => {
      const s = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      try {
        return ctx.newString(base64Decode(s));
      } catch {
        return ctx.newString('');
      }
    });
    ctx.setProp(javaObj, 'base64Decode', javaB64DecFn);
    javaB64DecFn.dispose();

    // java.log 兼容
    const javaLogFn = ctx.newFunction('log', (...args: QuickJSHandle[]) => {
      const parts = args.map(a => String(ctx.dump(a)));
      if (this._userApi?.log?.info) {
        this._userApi.log.info(parts.join(' '));
      }
      return ctx.undefined;
    });
    ctx.setProp(javaObj, 'log', javaLogFn);
    javaLogFn.dispose();

    ctx.setProp(g, 'java', javaObj);
    javaObj.dispose();

    /* ---------- cookie 对象 ---------- */
    const cookieObj = ctx.newObject();

    const cookieGetFn = ctx.newFunction('getCookie', (...args: QuickJSHandle[]) => {
      const url = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      if (this._userApi?.cookieJar?.get) {
        return ctx.newString(this._userApi.cookieJar.get(url) ?? '');
      }
      return ctx.newString(this._cookieMap.get(url) ?? '');
    });
    ctx.setProp(cookieObj, 'getCookie', cookieGetFn);
    cookieGetFn.dispose();

    const cookieSetFn = ctx.newFunction('setCookie', (...args: QuickJSHandle[]) => {
      const url = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      const cookie = args[1] !== undefined ? String(ctx.dump(args[1])) : '';
      if (this._userApi?.cookieJar?.set) {
        this._userApi.cookieJar.set(url, cookie);
      } else {
        this._cookieMap.set(url, cookie);
      }
      return ctx.undefined;
    });
    ctx.setProp(cookieObj, 'setCookie', cookieSetFn);
    cookieSetFn.dispose();

    ctx.setProp(g, 'cookie', cookieObj);
    cookieObj.dispose();

    /* ---------- cache 对象 ---------- */
    const cacheObj = ctx.newObject();

    const cacheGetFn = ctx.newFunction('get', (...args: QuickJSHandle[]) => {
      const key = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      if (this._userApi?.localStorage?.get) {
        const v = this._userApi.localStorage.get(key);
        return ctx.newString(v ?? '');
      }
      return ctx.newString(this._cacheMap.get(key) ?? '');
    });
    ctx.setProp(cacheObj, 'get', cacheGetFn);
    cacheGetFn.dispose();

    const cacheSetFn = ctx.newFunction('set', (...args: QuickJSHandle[]) => {
      const key = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      const val = args[1] !== undefined ? String(ctx.dump(args[1])) : '';
      if (this._userApi?.localStorage?.set) {
        this._userApi.localStorage.set(key, val);
      } else {
        this._cacheMap.set(key, val);
      }
      return ctx.undefined;
    });
    ctx.setProp(cacheObj, 'set', cacheSetFn);
    cacheSetFn.dispose();

    const cacheDelFn = ctx.newFunction('delete', (...args: QuickJSHandle[]) => {
      const key = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      this._cacheMap.delete(key);
      return ctx.undefined;
    });
    ctx.setProp(cacheObj, 'delete', cacheDelFn);
    cacheDelFn.dispose();

    ctx.setProp(g, 'cache', cacheObj);
    cacheObj.dispose();

    /* ---------- crypto 对象（Legado 平铺属性）---------- */
    const cryptoObj = ctx.newObject();

    const crMd5 = ctx.newFunction('md5', (...args: QuickJSHandle[]) => {
      const s = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      return ctx.newString(md5(s));
    });
    ctx.setProp(cryptoObj, 'md5', crMd5); crMd5.dispose();

    const crSha1 = ctx.newFunction('sha1', (...args: QuickJSHandle[]) => {
      const s = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      return ctx.newString(sha1(s));
    });
    ctx.setProp(cryptoObj, 'sha1', crSha1); crSha1.dispose();

    const crSha256 = ctx.newFunction('sha256', (...args: QuickJSHandle[]) => {
      const s = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      return ctx.newString(sha256(s));
    });
    ctx.setProp(cryptoObj, 'sha256', crSha256); crSha256.dispose();

    const crB64Enc = ctx.newFunction('base64Encode', (...args: QuickJSHandle[]) => {
      const s = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      return ctx.newString(base64Encode(s));
    });
    ctx.setProp(cryptoObj, 'base64Encode', crB64Enc); crB64Enc.dispose();

    const crB64Dec = ctx.newFunction('base64Decode', (...args: QuickJSHandle[]) => {
      const s = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      try { return ctx.newString(base64Decode(s)); } catch { return ctx.newString(''); }
    });
    ctx.setProp(cryptoObj, 'base64Decode', crB64Dec); crB64Dec.dispose();

    const crUrlEnc = ctx.newFunction('urlEncode', (...args: QuickJSHandle[]) => {
      const s = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      return ctx.newString(urlEncode(s));
    });
    ctx.setProp(cryptoObj, 'urlEncode', crUrlEnc); crUrlEnc.dispose();

    const crHexDec = ctx.newFunction('hexDecodeToString', (...args: QuickJSHandle[]) => {
      const s = args[0] !== undefined ? String(ctx.dump(args[0])) : '';
      try { return ctx.newString(hexDecodeToString(s)); } catch { return ctx.newString(''); }
    });
    ctx.setProp(cryptoObj, 'hexDecodeToString', crHexDec); crHexDec.dispose();

    ctx.setProp(g, 'crypto', cryptoObj);
    cryptoObj.dispose();

    /* ---------- 全局变量：key/page/result 默认值 ---------- */
    const defaultKey = ctx.newString('');
    ctx.setProp(g, 'key', defaultKey); defaultKey.dispose();
    const defaultPage = ctx.newNumber(1);
    ctx.setProp(g, 'page', defaultPage); defaultPage.dispose();
    const defaultResult = ctx.newString('');
    ctx.setProp(g, 'result', defaultResult); defaultResult.dispose();

    /* ---------- 全局函数：Url() / TYPE() / getSecretKey() / S() ---------- */
    const urlFn = ctx.newFunction('Url', () => ctx.newString(this._bookSourceUrl ?? ''));
    ctx.setProp(g, 'Url', urlFn); urlFn.dispose();

    const typeFn = ctx.newFunction('TYPE', () => ctx.newNumber(2));
    ctx.setProp(g, 'TYPE', typeFn); typeFn.dispose();

    const secretFn = ctx.newFunction('getSecretKey', () => ctx.newString(''));
    ctx.setProp(g, 'getSecretKey', secretFn); secretFn.dispose();

    const sFn = ctx.newFunction('S', () => ctx.newString(''));
    ctx.setProp(g, 'S', sFn); sFn.dispose();

    /* ---------- pdfa / pdfh / pdfs ---------- */
    const pdfaFn = ctx.newFunction('pdfa', () => ctx.newArray());
    ctx.setProp(g, 'pdfa', pdfaFn); pdfaFn.dispose();

    const pdfhFn = ctx.newFunction('pdfh', () => ctx.newString(''));
    ctx.setProp(g, 'pdfh', pdfhFn); pdfhFn.dispose();

    const pdfsFn = ctx.newFunction('pdfs', () => ctx.newString(''));
    ctx.setProp(g, 'pdfs', pdfsFn); pdfsFn.dispose();
  }
}

/* ---------- 派生求值器：针对 @js: 卡点（M2 专用增强版）---------- */

/**
 * 求值 @js: header → 返回 header 对象
 * 同 index.ts：形如 `@js: JSON.stringify({...})` 的脚本，求值后 JSON.parse
 */
export function evalHeader(
  jsRuntime: JSRuntime,
  headerScript: string,
  options?: EvalOptions
): Record<string, string> | undefined {
  const code = headerScript.replace(/^@js:/, '').trim()
  const result = jsRuntime.evalSync(code, options)
  if (typeof result !== 'string') return undefined
  try {
    const parsed = JSON.parse(result)
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, string>)
      : undefined
  } catch {
    return undefined
  }
}

/**
 * 求值动态 exploreUrl → 返回发现条目数组
 * M2 增强：如果 evalSync 返回字符串，尝试 JSON.parse 解析为数组
 *           （兼容大量 Legado 规则用 JSON.stringify 结束脚本的写法）
 */
export function evalExploreUrl(
  jsRuntime: JSRuntime,
  exploreScript: string,
  options?: EvalOptions
): Array<{ title: string; url: string }> {
  const code = exploreScript
    .replace(/^@js:/, '')
    .replace(/^<js>/, '')
    .replace(/<\/js>$/, '')
    .trim()
  if (!code) return []
  const result = jsRuntime.evalSync(code, options)

  let arr: unknown
  if (Array.isArray(result)) {
    arr = result
  } else if (typeof result === 'string') {
    try {
      const parsed = JSON.parse(result)
      arr = Array.isArray(parsed) ? parsed : undefined
    } catch {
      arr = undefined
    }
  } else {
    return []
  }

  if (!Array.isArray(arr)) return []
  return arr
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null && 'url' in item && 'title' in item
    )
    .map(item => ({ title: String(item.title), url: String(item.url) }))
}

/**
 * 求值 searchUrl 的 @js: 后缀 → 返回最终 URL
 * 同 index.ts：字符串结果原样返回
 */
export function evalSearchUrl(
  jsRuntime: JSRuntime,
  searchScript: string,
  options?: EvalOptions
): string | undefined {
  const code = searchScript
    .replace(/^@js:/, '')
    .replace(/^<js>/, '')
    .replace(/<\/js>$/, '')
    .trim()
  if (!code) return undefined
  const result = jsRuntime.evalSync(code, options)
  return typeof result === 'string' ? result : undefined
}

export async function createJsRuntime(opts?: CreateJSRuntimeOptions): Promise<QuickJSRuntime> {
  const Q = await _getQ();
  const rt = Q.newRuntime();
  rt.setMemoryLimit(64 * 1024 * 1024);
  const ctx = rt.newContext();
  return new QuickJSRuntime(Q, rt, ctx, opts ?? {});
}
