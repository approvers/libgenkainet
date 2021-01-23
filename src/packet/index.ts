export interface IPacket {
  type: string;
  ttl: number;
}

export interface IPacketHandler<T extends IPacket> {
  handle(packet: T): void | Promise<void>;
  supports(packet: IPacket): boolean;
}
