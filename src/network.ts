import { IConnection } from './connection';

export interface INetwork {
  readonly connections: IConnection[];
}

export class Network implements INetwork {
  private _connections: IConnection[] = [];

  public get connections(): IConnection[] {
    return [...this._connections];
  }

  add(...connections: IConnection[]): void {
    this._connections.push(...connections);
  }
}
