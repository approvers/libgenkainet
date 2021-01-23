import { IPacket, IPacketHandler } from './packet';
import { Node } from './node';

export interface IHandler {
  handle(packet: IPacket): Promise<void>;
}

export class Handler {
  constructor(
    private readonly _packetHandlers: IPacketHandler<IPacket>[] = [],
  ) {
  }

  async handle(packet: IPacket): Promise<void> {
    if (--packet.ttl <= 0) {
      return;
    }

    await this._packetHandlers
      .find(handler => handler.supports(packet))
      ?.handle(packet)
    ;
  }

  static default(node: Node): Handler {
    return new Handler([
    ]);
  }
}
