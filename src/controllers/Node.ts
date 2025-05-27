import type { NodeParams } from '../types/node'
import { NodeType } from '../types/node'

export class Node<Data> {
  name: string
  store?: Data
  endpoint: boolean
  type: NodeType
  paramName: string

  private staticChildren: Map<string, Node<Data>> | null = null
  private dynamicChild: Node<Data> | null = null
  private catchAllChild: Node<Data> | null = null
  private optionalCatchAllChild: Node<Data> | null = null
  private wildcardChild: Node<Data> | null = null
  
  public childCount = 0
  public nonStaticChildCount = 0

  constructor(params: NodeParams<Data, string, Node<Data>[], boolean>) {
    this.name = params.name
    this.endpoint = params.endpoint
    this.store = params.store
    
    const name = this.name
    if (name.startsWith(':')) {
      this.type = NodeType.Dynamic
      this.paramName = name.substring(1)
    } else if (name.startsWith('[[...') && name.endsWith(']]')) {
      this.type = NodeType.OptionalCatchAll
      this.paramName = name.substring(5, name.length - 2)
    } else if (name.startsWith('[...') && name.endsWith(']')) {
      this.type = NodeType.CatchAll
      this.paramName = name.substring(4, name.length - 1)
    } else if (name.startsWith('[') && name.endsWith(']')) {
      this.type = NodeType.Dynamic
      this.paramName = name.substring(1, name.length - 1)
    } else if (name === '*') {
      this.type = NodeType.Wildcard
      this.paramName = '*'
    } else {
      this.type = NodeType.Static
      this.paramName = ''
    }
  }

  addChild(node: Node<Data>): void {
    this.childCount++

    if (node.type !== NodeType.Static) this.nonStaticChildCount++
    switch (node.type) {
    case NodeType.Static:
      if (!this.staticChildren) this.staticChildren = new Map()
      this.staticChildren.set(node.name, node)
      break
    case NodeType.Dynamic:
      this.dynamicChild = node
      break
    case NodeType.CatchAll:
      this.catchAllChild = node
      break
    case NodeType.OptionalCatchAll:
      this.optionalCatchAllChild = node
      break
    case NodeType.Wildcard:
      this.wildcardChild = node
      break
    }
  }

  removeChild(node: Node<Data>): void {
    this.childCount--
    if (node.type !== NodeType.Static) this.nonStaticChildCount--
    switch (node.type) {
    case NodeType.Static:
      this.staticChildren?.delete(node.name)
      break
    case NodeType.Dynamic:
      this.dynamicChild = null
      break
    case NodeType.CatchAll:
      this.catchAllChild = null
      break
    case NodeType.OptionalCatchAll:
      this.optionalCatchAllChild = null
      break
    case NodeType.Wildcard:
      this.wildcardChild = null
      break
    }
  }

  findStaticChild(name: string) {
    return this.staticChildren?.get(name)
  }

  findDynamicChild() {
    return this.dynamicChild
  }
  
  findCatchAllChild() {
    return this.catchAllChild
  }

  findOptionalCatchAllChild() {
    return this.optionalCatchAllChild
  }

  findWildcardChild() {
    return this.wildcardChild
  }
}