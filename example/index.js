const { DefaultHandlerFactory, MessagePacket, NewPacket, Node } = require('libgenkainet');
const { RTCPeerConnection } = require('wrtc');

const connectionFactory = {
  create() {
    return new RTCPeerConnection();
  },
};

const discoverer = new Node(
  'discoverer',
  {},
  new DefaultHandlerFactory({
    handle(from, message) {
      console.log(`discoverer received from ${from.id}: ${message}`);
    },
  }),
  connectionFactory,
);

const pool = [discoverer];
const discover = async () => pool[pool.length - 1];
const offer = async (offer) => (await pool[pool.length - 1].accept(offer))[1];

const bob = new Node(
  'bob',
  { discover, offer },
  new DefaultHandlerFactory({
    handle(from, message) {
      console.log(`bob received from ${from.id}: ${message}`);
    },
  }),
  connectionFactory,
);

const alice = new Node(
  'alice',
  { discover, offer },
  new DefaultHandlerFactory({
    handle(from, message) {
      console.log(`alice received from ${from.id}: ${message}`);
    }
  }),
  connectionFactory,
);

(async () => {
  const bobToDiscoverer = await bob.connect();
  console.log(`connection established from ${bobToDiscoverer.from.id} to ${bobToDiscoverer.to.id}`);

  const aliceToDiscoverer = await alice.connect();
  console.log(`connection established from ${aliceToDiscoverer.from.id} to ${aliceToDiscoverer.to.id}`);

  bob.send(
    new NewPacket(
      bobToDiscoverer,
      bob,
    ),
  );

  alice.send(
    new NewPacket(
      aliceToDiscoverer,
      alice,
    ),
  );

  bobToDiscoverer.send(
    new MessagePacket(
      'hello!',
      bob,
      alice,
    ),
  );

  aliceToDiscoverer.send(
    new MessagePacket(
      'hi!',
      alice,
      bob,
    ),
  );
})();
