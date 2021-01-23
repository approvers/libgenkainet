import { INode } from '../node';

export interface IAnswer {
  from: INode,
  to: INode,
  sdp: string;
}

export class Answer implements IAnswer {
  constructor(
    public readonly from: INode,
    public readonly to: INode,
    public readonly sdp: string,
  ) {
  }

  static fromDescription(from: INode, to: INode, description: RTCSessionDescription): Answer {
    return new Answer(
      from,
      to,
      description.sdp,
    );
  }
}
