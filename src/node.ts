import { Connection } from './connection';
import { IDiscoverer } from './discoverer';
import { IHandler } from './handler';
import { Network } from './network';

export interface INode {
  readonly id: string;
}

export class Node implements INode {
  public readonly network: Network;

  constructor(
    public readonly id: string,
    private readonly _discoverer: IDiscoverer,
    private readonly _handler: IHandler,
  ) {
    this.network = new Network();
  }

  async connect(to: INode, stunServers: string[]): Promise<Connection> {
    const connection = new Connection(
      this,
      to,
      this._handler,
      stunServers,
    );

    await connection.establish(this._discoverer);
    this.network.add(connection);

    return connection;
  }
}
