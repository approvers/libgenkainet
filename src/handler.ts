import { Node } from './node';
import {
  IMessageHandler,
  IPacket,
  IPacketHandler,
  MessagePacketHandler,
  NewPacketHandler,
  RoutePacketHandler,
} from './packet';

export interface IHandler {
  handle(packet: IPacket): Promise<void>;
}

export class Handler implements IHandler {
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
}

export interface IHandlerFactory {
  create(node: Node): IHandler
}

export class DefaultHandlerFactory implements IHandlerFactory {
  constructor(
    private readonly _messageHandler: IMessageHandler,
  ) {
  }

  create(node: Node): IHandler {
    return new Handler([
      new NewPacketHandler(node),
      new RoutePacketHandler(node),
      new MessagePacketHandler(node, this._messageHandler),
    ]);
  }
}
