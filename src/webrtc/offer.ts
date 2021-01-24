import { INode } from '../node';

export interface IOffer {
  from: INode,
  to: INode,
  sdp: string;
}

export class Offer implements IOffer {
  constructor(
    public readonly from: INode,
    public readonly to: INode,
    public readonly sdp: string,
  ) {
  }

  static fromDescription(from: INode, to: INode, description: RTCSessionDescription): Offer {
    return new Offer(
      from,
      to,
      description.sdp,
    );
  }
}
