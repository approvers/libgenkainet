import { Connection, IConnection } from './connection';
import { INode } from './node';

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

  route(to: INode, excepts: INode[] = []): Connection | undefined {
    const connection = this._connections
      .filter(conn => !excepts.some(e => e.id === conn.from.id || e.id === conn.to.id))
      .find(conn => conn.from.id === to.id || conn.to.id === to.id)
    ;

    if (connection === undefined) {
      return undefined;
    }

    if (connection instanceof Connection) {
      return connection;
    }

    return this.route(
      connection.from.id === to.id ? connection.from : connection.to,
      [...excepts, connection.from.id === to.id ? connection.to : connection.from],
    );
  }

  direct(): Connection[] {
    return this._connections.filter((conn): conn is Connection => conn instanceof Connection);
  }

  isDirect(to: INode): boolean {
    return this._connections.some(conn => conn instanceof Connection && (conn.from.id === to.id || conn.to.id === to.id));
  }
}
