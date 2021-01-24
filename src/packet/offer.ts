import { DEFAULT_TTL, IPacket, IPacketHandler } from '.';
import { INode, Node } from '../node';
import { IOffer } from '../webrtc';
import { AnswerPacket } from './answer';

const type = 'offer';

export interface IOfferPacket extends IPacket {
  readonly type: typeof type;
  readonly offer: IOffer;
}

export class OfferPacket implements IOfferPacket {
  public readonly type = type;
  public ttl: number = DEFAULT_TTL;

  constructor(
    public readonly offer: IOffer,
    public readonly from: INode,
    public readonly to?: INode,
  ) {
    this.offer = { from: { id: this.offer.from.id }, to: { id: this.offer.to.id }, sdp: this.offer.sdp };
    this.from = { id: this.from.id };

    if (this.to !== undefined) {
      this.to = { id: this.to.id };
    }
  }
}

export class OfferPacketHandler implements IPacketHandler<IOfferPacket> {
  constructor(
    private readonly _node: Node,
  ) {
  }

  async handle(packet: IOfferPacket): Promise<void> {
    if (packet.to === undefined || packet.to.id === this._node.id) {
      return this._node.send(
        new AnswerPacket(
          (await this._node.accept(packet.offer))[1],
          packet.to as INode,
          packet.from,
        ),
      );
    }

    this._node.send(packet);
  }

  supports(packet: IPacket): boolean {
    return packet.type === type;
  }
}
