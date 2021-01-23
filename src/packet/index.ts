import { INode } from '../node';

export interface IPacket {
  readonly type: string;
  readonly from: INode;
  readonly to?: INode;
  ttl: number;
}

export interface IPacketHandler<T extends IPacket> {
  handle(packet: T): void | Promise<void>;
  supports(packet: IPacket): boolean;
}
