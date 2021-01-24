import { IDiscoverer } from './discoverer';
import { INode } from './node';
import { IPacket } from './packet';
import { IAnswer, IOffer, IRTCPeerConnectionFactory, RTCPeerConnectionFactory, WebRTCConnection } from './webrtc';
import { IHandler } from './handler';

export type ConnectionState = 'pending' | 'connecting' | 'established' | 'abandoned';

export interface IConnection {
  readonly from: INode,
  readonly to: INode,
  readonly state: ConnectionState,
  readonly establishedAt: Date | null,
}

export class Connection implements IConnection {
  public onDisconnected?: () => void;
  private readonly _rtc: WebRTCConnection;
  private _state: ConnectionState = 'pending';
  private _establishedAt: Date | null = null;

  public get state(): ConnectionState {
    return this._state;
  }

  public get establishedAt(): Date | null {
    return this._establishedAt;
  }

  constructor(
    public readonly from: INode,
    public readonly to: INode,
    private readonly _handler: IHandler,
    connectionFactory: IRTCPeerConnectionFactory = new RTCPeerConnectionFactory(),
  ) {
    this._rtc = new WebRTCConnection(
      from,
      to,
      message => this.handle(message),
      connectionFactory,
    );
  }

  async establish(discoverer: IDiscoverer): Promise<void> {
    this._state = 'connecting';

    const offer = await this._rtc.createOffer();
    const answer = await discoverer.offer(offer);
    await this._rtc.establish(answer, () => {
      this._state = 'abandoned';
      this.onDisconnected?.call(this);
    });

    this._state = 'established';
    this._establishedAt = new Date();
  }

  async answer(offer: IOffer): Promise<IAnswer> {
    this._state = 'connecting';

    return await this._rtc.acceptOffer(offer);
  }

  send(packet: IPacket): void {
    this._rtc.send(
      JSON.stringify(packet),
    );
  }

  private handle(message: string): void {
    this._handler.handle(
      JSON.parse(message) as IPacket,
    );
  }
}
