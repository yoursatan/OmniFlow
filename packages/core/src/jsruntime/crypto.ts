/* ==========================================================
 * crypto.ts — 加密工具函数
 * Node 环境优先使用 Node crypto，浏览器场景 fallback。
 *
 * 说明：使用静态 import 加载 node:crypto。
 * - Node 20+：直接可用（tsconfig 含 "types": ["node"]）。
 * - 构建产物：tsup/node20 能正确识别 node: 前缀。
 * - 浏览器：需要 bundler 提供 crypto-browserify polyfill 或标记 external。
 *   由于 QuickJSRuntime 仅在 Node/WASM 环境下使用，本文件不会在纯浏览器主进程中加载。
 * ========================================================== */

import * as _crypto from 'node:crypto'

type NodeCryptoLike = {
  createHash?: (algo: string) => {
    update: (s: string, enc?: string) => any
    digest: (enc: string) => string
  }
}

const _nodeCrypto: NodeCryptoLike | null =
  typeof _crypto === 'object' && _crypto !== null && typeof (_crypto as NodeCryptoLike).createHash === 'function'
    ? (_crypto as NodeCryptoLike)
    : null

/** MD5 哈希，返回 32 位小写 hex */
export function md5(s: string): string {
  if (_nodeCrypto?.createHash) {
    return _nodeCrypto.createHash('md5').update(s, 'utf8').digest('hex')
  }
  throw new Error('md5 unavailable (no node crypto)')
}

/** SHA1 哈希，返回 40 位小写 hex */
export function sha1(s: string): string {
  if (_nodeCrypto?.createHash) {
    return _nodeCrypto.createHash('sha1').update(s, 'utf8').digest('hex')
  }
  throw new Error('sha1 unavailable (no node crypto)')
}

/** SHA256 哈希，返回 64 位小写 hex */
export function sha256(s: string): string {
  if (_nodeCrypto?.createHash) {
    return _nodeCrypto.createHash('sha256').update(s, 'utf8').digest('hex')
  }
  throw new Error('sha256 unavailable (no node crypto)')
}

/** Base64 编码（UTF-8 输入） */
export function base64Encode(s: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(s, 'utf8').toString('base64')
  }
  if (typeof btoa !== 'undefined') {
    return btoa(unescape(encodeURIComponent(s)))
  }
  throw new Error('base64Encode unavailable')
}

/** Base64 解码 → UTF-8 字符串 */
export function base64Decode(s: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(s, 'base64').toString('utf8')
  }
  if (typeof atob !== 'undefined') {
    return decodeURIComponent(escape(atob(s)))
  }
  throw new Error('base64Decode unavailable')
}

/** hex 字符串解码为 UTF-8 字符串 */
export function hexDecodeToString(hex: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(hex, 'hex').toString('utf8')
  }
  const clean = hex.replace(/^0x/i, '').replace(/\s/g, '')
  let out = ''
  for (let i = 0; i < clean.length; i += 2) {
    out += String.fromCharCode(parseInt(clean.substring(i, i + 2), 16))
  }
  return decodeURIComponent(escape(out))
}

/** URL encode（同 encodeURIComponent） */
export function urlEncode(s: string): string {
  return encodeURIComponent(s)
}
