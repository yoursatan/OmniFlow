declare module 'xpath' {
  export interface XPathResult {
    iterateNext(): Node | null
    numberValue: number
    stringValue: string
    booleanValue: boolean
    singleNodeValue: Node | null
    snapshotLength: number
    snapshotItem(index: number): Node | null
  }

  export function select(expression: string, contextNode: Node): Node[]
  export function selectWithResolver(
    expression: string,
    contextNode: Node,
    resolver: unknown
  ): XPathResult
  export function evaluate(
    expression: string,
    contextNode: Node,
    resolver: unknown,
    type: number
  ): XPathResult
}
