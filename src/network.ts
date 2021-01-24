import { Connection, IConnection } from './connection';
import { INode } from './node';

export interface INetwork {
  readonly connections: IConnection[];
}

export class Network implements INetwork {
  public onUpdated?: () => void;
  private _connections: IConnection[] = [];

  public get connections(): IConnection[] {
    return [...this._connections];
  }

  add(...connections: IConnection[]): void {
    this._connections.push(...connections);
    this.onUpdated?.call(this);
  }

  remove(connection: IConnection): void {
    this._connections = this._connections.filter(conn => conn.from.id !== connection.from.id || conn.to.id !== connection.to.id);
    this.onUpdated?.call(this);
  }

  route(to: INode, excepts: INode[] = []): Connection | undefined {
    const connections = this._connections
      .filter(conn => !excepts.some(e => e.id === conn.from.id || e.id === conn.to.id))
      .filter(conn => conn.from.id === to.id || conn.to.id === to.id)
    ;

    if (connections.length <= 0) {
      return undefined;
    }

    const direct = connections.find((conn): conn is Connection => conn instanceof Connection);

    if (direct !== undefined) {
      return direct;
    }

    const connection = connections[0];

    return this.route(
      connection.from.id === to.id ? connection.to : connection.from,
      [...excepts],
    );
  }

  direct(): Connection[] {
    return this._connections.filter((conn): conn is Connection => conn instanceof Connection);
  }

  isDirect(to: INode): boolean {
    return this._connections.some(conn => conn instanceof Connection && (conn.from.id === to.id || conn.to.id === to.id));
  }

  isKnown(connection: IConnection) {
    return this._connections.some(conn => !(conn instanceof Connection) && conn.from.id === connection.from.id && conn.to.id === connection.to.id);
  }
}
