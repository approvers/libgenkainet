import { Answer, IAnswer } from './answer';
import { IOffer, Offer } from './offer';
import { INode } from '../node';

export class WebRTCConnection {
  private _connection: RTCPeerConnection;
  private _channel?: RTCDataChannel;

  constructor(
    private readonly _from: INode,
    private readonly _handler: (message: string) => void,
    stunServers: string[],
  ) {
    const connection = new RTCPeerConnection({
      iceServers: stunServers.map(server => ({
        urls: server,
      })),
    });

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
    await this._connection.setRemoteDescription(
      new RTCSessionDescription({
        type: 'offer',
        sdp: offer.sdp,
      }),
    );

    const description = await this._connection.createAnswer();
    await this._connection.setLocalDescription(description);

    return Answer.fromDescription(
      this._from,
      this._connection.localDescription as RTCSessionDescription,
    );
  }

  async establish(answer: IAnswer): Promise<void> {
    await this._connection.setRemoteDescription(
      new RTCSessionDescription({
        type: 'answer',
        sdp: answer.sdp,
      })
    );
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
