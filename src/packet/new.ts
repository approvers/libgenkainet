import { IPacket, IPacketHandler } from '.';
import { Node } from '../node';
import { IConnection } from '../connection';
import { RoutePacket } from './route';

const type = 'new';

export interface INewPacket extends IPacket {
  type: typeof type;
  connection: IConnection;
}

export class NewPacketHandler implements IPacketHandler<INewPacket> {
  constructor(
    private readonly _node: Node,
  ) {
  }

  handle(packet: INewPacket): void {
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
