import { Connection } from './connection';
import { IDiscoverer } from './discoverer';
import { IHandler } from './handler';
import { Network } from './network';
import { IAnswer, IOffer } from './webrtc';

export interface INode {
  readonly id: string;
}

export class Node implements INode {
  public readonly network: Network;

  constructor(
    public readonly id: string,
    private readonly _discoverer: IDiscoverer,
    private readonly _handler: IHandler,
    private readonly _stunServers: string[]
  ) {
    this.network = new Network();
  }

  async connect(to: INode): Promise<Connection> {
    const connection = new Connection(
      this,
      to,
      this._handler,
      this._stunServers,
    );

    await connection.establish(this._discoverer);
    this.network.add(connection);

    return connection;
  }

  async accept(offer: IOffer): Promise<[Connection, IAnswer]> {
    const connection = new Connection(
      offer.from,
      this,
      this._handler,
      this._stunServers,
    );

    const answer = await connection.answer(offer);
    this.network.add(connection);

    return [connection, answer];
  }
}
