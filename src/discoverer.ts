import { IAnswer, IOffer } from './webrtc';
import { INode } from './node';

export interface IDiscoverer {
  discover(): Promise<INode>
  offer(offer: IOffer): Promise<IAnswer>;
}
