import { connect, StringCodec } from "nats";

const main = async () => {
  try {
    const natsClient = await connect({ servers: ["127.0.0.1:4222"] })
    
    // create a codec
    const stringCodec = StringCodec();

    natsClient.publish("hello", stringCodec.encode("world"));
    natsClient.publish("hello", stringCodec.encode("again"));

    const subscription = natsClient.subscribe("hello")

    for await (const message of subscription) {
      console.log(`[${subscription.getProcessed()}]: ${stringCodec.decode(message.data)}`)
    }
  } catch (error) {
    
  }
}

main()
