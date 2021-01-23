import { INode } from '../node';

export * from './message';
export * from './new';
export * from './route';

export const DEFAULT_TTL = 50;

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
