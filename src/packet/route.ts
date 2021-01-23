import { DEFAULT_TTL, IPacket, IPacketHandler } from '.';
import { INode, Node } from '../node';
import { IConnection } from '../connection';

const type = 'route';

export interface IRoutePacket extends IPacket {
  readonly type: typeof type;
  readonly connections: IConnection[];
}

export class RoutePacket implements IRoutePacket {
  public readonly type = type;
  public ttl: number = DEFAULT_TTL;

  constructor(
    public readonly from: INode,
    public readonly to: INode,
    public readonly connections: IConnection[],
  ) {
    this.from = { id: this.from.id };

    if (this.to !== undefined) {
      this.to = { id: this.to.id };
    }

    this.connections = this.connections.map(connection => ({
      from: { id: connection.from.id },
      to: { id: connection.to.id },
      state: connection.state,
      establishedAt: connection.establishedAt,
    }))
  }
}

export class RoutePacketHandler implements IPacketHandler<IRoutePacket> {
  constructor(
    private readonly _node: Node,
  ) {
  }

  handle(packet: IRoutePacket): void {
    this._node.network.add(...packet.connections);
  }

  supports(packet: IPacket): boolean {
    return packet.type === type;
  }
}
