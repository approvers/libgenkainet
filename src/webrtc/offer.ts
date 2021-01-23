import { INode } from '../node';

export interface IOffer {
  from: INode,
  sdp: string;
}

export class Offer implements IOffer {
  constructor(
    public readonly from: INode,
    public readonly sdp: string,
  ) {
  }

  static fromDescription(from: INode, description: RTCSessionDescription): Offer {
    return new Offer(
      from,
      description.sdp,
    );
  }
}
