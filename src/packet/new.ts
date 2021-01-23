import { DEFAULT_TTL, IPacket, IPacketHandler } from '.';
import { INode, Node } from '../node';
import { IConnection } from '../connection';
import { RoutePacket } from './route';

const type = 'new';

export interface INewPacket extends IPacket {
  type: typeof type;
  connection: IConnection;
}

export class NewPacket implements INewPacket {
  public readonly type = type;
  public ttl: number = DEFAULT_TTL;

  constructor(
    public readonly connection: IConnection,
    public readonly from: INode,
    public readonly to?: INode,
  ) {
    this.connection = {
      from: { id: this.connection.from.id },
      to: { id: this.connection.to.id },
      state: this.connection.state,
      establishedAt: this.connection.establishedAt,
    };

    this.from = { id: this.from.id };

    if (this.to !== undefined) {
      this.to = { id: this.to.id };
    }
  }
}

export class NewPacketHandler implements IPacketHandler<INewPacket> {
  constructor(
    private readonly _node: Node,
  ) {
  }

  handle(packet: INewPacket): void {
    if (this._node.network.isKnown(packet.connection)) {
      return;
    }

    this._node.network.add(packet.connection);
    this._node.send(packet);

    if (this._node.network.isDirect(packet.from)) {
      this._node.send(
        new RoutePacket(
          this._node,
          packet.from,
          this._node.network.connections,
        ),
      );
    }
  }

  supports(packet: IPacket): boolean {
    return packet.type === type;
  }
}
