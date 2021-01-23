import { Answer, IAnswer } from './answer';
import { IOffer, Offer } from './offer';
import { INode } from '../node';

export interface IRTCPeerConnectionFactory {
  create(): RTCPeerConnection;
}

export class RTCPeerConnectionFactory implements IRTCPeerConnectionFactory {
  constructor(
    private readonly _stunServers: string[] = [],
  ) {
  }

  create(): RTCPeerConnection {
    return new RTCPeerConnection({
      iceServers: this._stunServers.map(server => ({
        urls: server,
      }))
    });
  }
}

export class WebRTCConnection {
  private _connection: RTCPeerConnection;
  private _channel?: RTCDataChannel;

  constructor(
    private readonly _from: INode,
    private readonly _to: INode,
    private readonly _handler: (message: string) => void,
    connectionFactory: IRTCPeerConnectionFactory,
  ) {
    const connection = connectionFactory.create();

    connection.addEventListener('datachannel', event => {
      this._channel = event.channel;
      this.subscribe();
    });

    this._connection = connection;
  }

  async createOffer(): Promise<IOffer> {
    this._channel = this._connection.createDataChannel('foo');
    this.subscribe();

    return new Promise<IOffer>((resolve, reject) => {
      this._connection.addEventListener('icecandidate', () => resolve(
        Offer.fromDescription(
          this._from,
          this._to,
          this._connection.localDescription as RTCSessionDescription,
        ),
      ));

      this._connection.addEventListener('icecandidateerror', reject);

      this._connection
        .createOffer()
        .then(description => this._connection.setLocalDescription(description))
        .catch(reject)
      ;
    })
  }

  async acceptOffer(offer: IOffer): Promise<IAnswer> {
    await this._connection.setRemoteDescription({
      type: 'offer',
      sdp: offer.sdp,
    });

    const description = await this._connection.createAnswer();
    await this._connection.setLocalDescription(description);

    return Answer.fromDescription(
      this._to,
      this._from,
      this._connection.localDescription as RTCSessionDescription,
    );
  }

  async establish(answer: IAnswer): Promise<void> {
    await this._connection.setRemoteDescription({
      type: 'answer',
      sdp: answer.sdp,
    });

    await new Promise<void>(resolve => {
      this._connection.addEventListener('connectionstatechange', () => {
        if (this._connection.connectionState === 'connected') {
          resolve();
        }
      });
    });
  }

  send(message: string): void {
    this._channel?.send(message);
  }

  private subscribe(): void {
    this._channel?.addEventListener('message', event => {
      this._handler(event.data);
    })
  }
}
