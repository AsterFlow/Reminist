import { NullProtoObj } from '../utils/nullPrototype'
import type { NodeParams } from '../types/node'
import { NodeType } from '../types/node'

export class Node<
  Data,
  Path extends string,
  Endpoint extends boolean,
> {
  name: string
  store: Endpoint extends true ? Data : unknown
  endpoint: Endpoint
  type: NodeType
  paramName: string

  public static: NullProtoObj<Node<Data, any, any>> = new NullProtoObj()
  public dynamic: Node<Data, any, any> | null = null
  public catchAll: Node<Data, any, any> | null = null
  public optionalCatchAll: Node<Data, any, any> | null = null
  public wildcard: Node<Data, any, any> | null = null
  
  public childCount = 0
  public nonStaticChildCount = 0

  constructor(params: NodeParams<Data, Endpoint, Path>) {
    this.name = params.name
    this.endpoint = params.endpoint as Endpoint
    this.store = (params as { store: Data }).store
    
    const name = this.name
    if (name.startsWith(':')) {
      this.type = NodeType.Dynamic
      this.paramName = name.substring(1)
    } else if (name.startsWith('[[...')) {
      this.type = NodeType.OptionalCatchAll
      this.paramName = name.substring(5, name.length - 2)
    } else if (name.startsWith('[...')) {
      this.type = NodeType.CatchAll
      this.paramName = name.substring(4, name.length - 1)
    } else if (name.startsWith('[')) {
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

  addChild(node: Node<Data, string, boolean>): void {
    this.childCount++

    if (node.type !== NodeType.Static) this.nonStaticChildCount++
    switch (node.type) {
    case NodeType.Static:
      if (!this.static) this.static = new NullProtoObj()
      this.static![node.name] = node
      break
    case NodeType.Dynamic:
      this.dynamic = node
      break
    case NodeType.CatchAll:
      this.catchAll = node
      break
    case NodeType.OptionalCatchAll:
      this.optionalCatchAll = node
      break
    case NodeType.Wildcard:
      this.wildcard = node
      break
    }
  }

  removeChild(node: Node<Data, any, any>): void {
    this.childCount--
    if (node.type !== NodeType.Static) this.nonStaticChildCount--
    switch (node.type) {
    case NodeType.Static:
      if (this.static) delete this.static[node.name]
      break
    case NodeType.Dynamic:
      this.dynamic = null
      break
    case NodeType.CatchAll:
      this.catchAll = null
      break
    case NodeType.OptionalCatchAll:
      this.optionalCatchAll = null
      break
    case NodeType.Wildcard:
      this.wildcard = null
      break
    }
  }
}