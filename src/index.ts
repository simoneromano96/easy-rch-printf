import { connect } from "node-nats-streaming";

const sc = connect('test-cluster', 'test')
 
sc.on('connect', () => {
  // Simple Publisher (all publishes are async in the node version of the client)
  sc.publish('foo', 'Hello node-nats-streaming!', (err, guid) => {
    if (err) {
      console.log('publish failed: ' + err)
    } else {
      console.log('published message with guid: ' + guid)
    }
  })
 
  // Subscriber can specify how many existing messages to get.
  const opts = sc.subscriptionOptions().setStartWithLastReceived()
  const subscription = sc.subscribe('foo', opts)
  subscription.on('message', (msg) => {
    console.log('Received a message [' + msg.getSequence() + '] ' + msg.getData())
  })
 
  // After one second, unsubscribe, when that is done, close the connection
  setTimeout(() => {
    subscription.unsubscribe()
    subscription.on('unsubscribed', () => {
      sc.close()
    })
  }, 1000)
})
 
sc.on('close', () => {
  process.exit()
})

/*
const main = async () => {
  try {
    const natsClient = connect("test", "test-client", { url: "localhost" })

    natsClient.on("connect", () => {
      console.log("client connected")
      
      // Subscriber can specify how many existing messages to get.
      const opts = natsClient.subscriptionOptions().setStartWithLastReceived()
      const subscription = natsClient.subscribe('foo', opts)
      subscription.on('message', (msg) => {
        console.log('Received a message [' + msg.getSequence() + '] ' + msg.getData())
      })
      

      natsClient.publish("foo", "bar", (err, guid) => {
        if (err) {
          console.log('publish failed: ' + err)
        } else {
          console.log('published message with guid: ' + guid)
        }
      })
    })
    
  } catch (error) {
    
  }
}

main()
*/