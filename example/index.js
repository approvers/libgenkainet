const { DefaultHandlerFactory, MessagePacket, NewPacket, Node } = require('libgenkainet');
const { RTCPeerConnection } = require('wrtc');

const connectionFactory = {
  create() {
    return new RTCPeerConnection();
  },
};

const bob = new Node(
  'bob',
  {},
  new DefaultHandlerFactory({
    handle(from, message) {
      console.log(`bob received from ${from.id}: ${message}`);
    },
  }),
  connectionFactory,
);

const alice = new Node(
  'alice',
  {
    async discover(offer) {
      console.log('alice is trying to connect to bob');

      return (await bob.accept(offer))[1];
    }
  },
  new DefaultHandlerFactory({
    handle(from, message) {
      console.log(`alice received from ${from.id}: ${message}`);
    }
  }),
  connectionFactory,
);

(async () => {
  const connection = await alice.connect({
    id: 'bob',
  });

  console.log('connection established');

  connection.send(
    new NewPacket(
      connection,
      alice,
      bob,
    ),
  );

  connection.send(
    new MessagePacket(
      'hello!',
      alice,
      bob,
    ),
  );

  connection.send(
    new MessagePacket(
      'hi!',
      bob,
      alice,
    ),
  );
})();
