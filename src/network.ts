import { Connection } from './connection';

export interface INetwork {
  readonly connections: Connection[];
}

export class Network implements INetwork {
  private _connections: Connection[] = [];

  public get connections(): Connection[] {
    return this._connections;
  }
}
