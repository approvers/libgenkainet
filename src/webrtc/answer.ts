import { INode } from '../node';

export interface IAnswer {
  from: INode,
  sdp: string;
}

export class Answer implements IAnswer {
  constructor(
    public readonly from: INode,
    public readonly sdp: string,
  ) {
  }

  static fromDescription(from: INode, description: RTCSessionDescription): Answer {
    return new Answer(
      from,
      description.sdp,
    );
  }
}
