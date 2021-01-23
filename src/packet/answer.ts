import { DEFAULT_TTL, IPacket, IPacketHandler } from '.';
import { INode, Node } from '../node';
import { IAnswer } from '../webrtc';

const type = 'answer';

export interface IAnswerPacket extends IPacket {
  readonly type: typeof type;
  readonly answer: IAnswer;
}

export class AnswerPacket implements IAnswerPacket {
  public readonly type = type;
  public ttl: number = DEFAULT_TTL;

  constructor(
    public readonly answer: IAnswer,
    public readonly from: INode,
    public readonly to?: INode,
  ) {
    this.answer = { from: { id: this.answer.from.id }, sdp: this.answer.sdp };
    this.from = { id: this.from.id };

    if (this.to !== undefined) {
      this.to = { id: this.to.id };
    }
  }
}

export interface IAnswerHandler {
  handle(answer: IAnswer): void;
}

export class AnswerPacketHandler implements IPacketHandler<IAnswerPacket> {
  constructor(
    private readonly _node: Node,
    private readonly _handler: IAnswerHandler,
  ) {
  }

  handle(packet: IAnswerPacket): void {
    if (packet.to === undefined || packet.to.id === this._node.id) {
      return this._handler.handle(packet.answer);
    }

    this._node.send(packet);
  }

  supports(packet: IPacket): boolean {
    return packet.type === type;
  }
}
