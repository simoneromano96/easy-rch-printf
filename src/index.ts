import { connect, consumerOpts, createInbox, StringCodec } from "nats";

const main = async () => {
  try {
    const natsClient = await connect({ servers: ["127.0.0.1:4222"] })
    
    const js = natsClient.jetstream();

    const stream = "mystream";
    const subj = `mystream.A`;

    const opts = consumerOpts();
    opts.durable("me");
    opts.manualAck();
    opts.ackExplicit();
    opts.deliverTo(createInbox());
    
    let sub = await js.subscribe(subj, opts);
    const done1 = (async () => {
      for await (const m of sub) {
        m.ack();
      }
    })();

    const psub = await js.pullSubscribe(subj, { config: { durable_name: "c" } });
    const done2 = (async () => {
      for await (const m of psub) {
        console.log(`${m.info.stream}[${m.seq}]`);
        m.ack();
      }
    })();
    psub.unsubscribe(4);
    
    // To start receiving messages you pull the subscription
    setInterval(() => {
      psub.pull({ batch: 10, expires: 10000 });
    }, 10000);

    Promise.all([done1, done2]);
    /*
    // create a codec
    const stringCodec = StringCodec();

    natsClient.publish("hello", stringCodec.encode("world"));
    natsClient.publish("hello", stringCodec.encode("again"));

    const subscription = natsClient.subscribe("hello")

    for await (const message of subscription) {
      console.log(`[${subscription.getProcessed()}]: ${stringCodec.decode(message.data)}`)
    }
    */
  } catch (error) {
    
  }
}

main()
