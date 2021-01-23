import { IPacket } from '../packet';

export interface IHandler {
  handle(packet: IPacket): void | Promise<void>;
}
