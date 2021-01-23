import { IAnswer, IOffer } from './webrtc';

export interface IDiscoverer {
  discover(offer: IOffer): Promise<IAnswer>;
}
