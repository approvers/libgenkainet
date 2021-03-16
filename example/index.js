const { DefaultHandlerFactory, MessagePacket, NewPacket, Node, OfferPacket } = require('libgenkainet');
const { RTCPeerConnection } = require('wrtc');
const EventEmitter = require('events');

const connectionFactory = {
  create() {
    return new RTCPeerConnection();
  },
};

const onAnswer = new EventEmitter();
const discoverer = new Node(
  'discoverer',
  {},
  new DefaultHandlerFactory(
    {
      handle(from, message) {
        console.log(`discoverer received from ${from.id}: ${message}`);
      },
    },
    {
      handle(answer) {
        onAnswer.emit(answer.from.id, answer);
      },
    },
  ),
  connectionFactory,
);

discoverer.network.onUpdated = () => {
  console.log(
    'network updated:',
    discoverer.network.connections
      .map(conn => `${conn.from.id} -> ${conn.to.id}`)
      .join(', ')
  );
};

const pool = () => [
  discoverer,
  ...discoverer.network.connections
    .map(conn => [conn.from, conn.to])
    .flat()
    .filter(node => node.id !== discoverer.id),
];

const discover = async () => {
  const nodes = pool();
  return nodes[nodes.length - 1];
};

const offer = async (offer) => {
  if (offer.to.id === discoverer.id) {
    return (await discoverer.accept(offer))[1];
  }

  discoverer.send(
    new OfferPacket(
      offer,
      discoverer,
      offer.to,
    ),
  );

  return await new Promise(resolve => {
    onAnswer.once(offer.to.id, answer => {
      resolve(answer);
    });
  });
};

const bob = new Node(
  'bob',
  new DefaultHandlerFactory({
    handle(from, message) {
      console.log(`bob received from ${from.id}: ${message}`);
    },
  }),
  connectionFactory,
);

const alice = new Node(
  'alice',
  new DefaultHandlerFactory({
    handle(from, message) {
      console.log(`alice received from ${from.id}: ${message}`);
    }
  }),
  connectionFactory,
);

(async () => {
  const bobToDiscoverer = await bob.connect({ discover, offer });
  console.log(`connection established from ${bobToDiscoverer.from.id} to ${bobToDiscoverer.to.id}`);

  bob.send(
    new NewPacket(
      bobToDiscoverer,
      bob,
    ),
  );

  const aliceToBob = await alice.connect();
  console.log(`connection established from ${aliceToBob.from.id} to ${aliceToBob.to.id}`);

  alice.send(
    new NewPacket(
      aliceToBob,
      alice,
    ),
  );

  // Wait for the stream becomes available
  await new Promise(resolve => setTimeout(resolve, 500));

  bob.send(
    new MessagePacket(
      'hello!',
      bob,
      alice,
    ),
  );

  alice.send(
    new MessagePacket(
      'hello',
      alice,
      discoverer,
    ),
  );
})();
