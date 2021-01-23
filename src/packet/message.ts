import { DEFAULT_TTL, IPacket, IPacketHandler } from '.';
import { INode, Node } from '../node';

const type = 'message';

export interface IMessagePacket extends IPacket {
  readonly type: typeof type;
  readonly message: string;
}

export class MessagePacket implements IMessagePacket {
  public readonly type = type;
  public ttl: number = DEFAULT_TTL;

  constructor(
    public readonly from: INode,
    public readonly to: INode,
    public readonly message: string,
  ) {
  }
}

export interface IMessageHandler {
  handle(message: string): void;
}

export class MessagePacketHandler implements IPacketHandler<IMessagePacket> {
  constructor(
    private readonly _node: Node,
    private readonly _handler: IMessageHandler,
  ) {
  }

  handle(packet: IMessagePacket): void {
    if (packet.to === undefined || packet.to.id === this._node.id) {
      return this._handler.handle(packet.message);
    }

    this._node.send(packet);
  }

  supports(packet: IPacket): boolean {
    return packet.type === type;
  }
}
