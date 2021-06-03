package main

import (
	"fmt"
	"time"

	nats "github.com/nats-io/nats.go"
)

func main() {
	// Connect to NATS
	nc, _ := nats.Connect(nats.DefaultURL)

	// Create JetStream Context
	js, _ := nc.JetStream(nats.PublishAsyncMaxPending(256))

	// $ nats str add ORDERS --subjects "ORDERS.*" --ack --max-msgs=-1 --max-bytes=-1 --max-age=1y --storage file --retention limits --max-msg-size=-1 --discard=old
	si, err := js.AddStream(&nats.StreamConfig{
		Name:     "ORDERS",
		Subjects: []string{"ORDERS.*"},
	})
	if err != nil {
		panic(err)
	}
	fmt.Println(si)

	// Simple Stream Publisher
	pack, err := js.Publish("ORDERS.scratch", []byte("hello"))
	if err != nil {
		panic(err)
	}
	fmt.Println(pack)

	// Simple Async Stream Publisher
	for i := 0; i < 500; i++ {
		js.PublishAsync("ORDERS.scratch", []byte("hello"))
	}
	select {
	case <-js.PublishAsyncComplete():
	case <-time.After(5 * time.Second):
		fmt.Println("Did not resolve in time")
	}

	// Simple Async Ephemeral Consumer
	js.Subscribe("ORDERS.*", func(m *nats.Msg) {
		fmt.Printf("Received a JetStream message: %s\n", string(m.Data))
	})

	// Simple Sync Durable Consumer (optional SubOpts at the end)
	sub, err := js.SubscribeSync("ORDERS.*", nats.Durable("MONITOR"), nats.MaxDeliver(3))
	if err != nil {
		panic(err)
	}

	m, err := sub.NextMsg(time.Duration(10) * time.Second)
	fmt.Println(m)
	if err != nil {
		panic(err)
	}

	// Simple Pull Consumer
	sub, err = js.PullSubscribe("ORDERS.*", "MONITOR")
	if err != nil {
		panic(err)
	}
	msgs, err := sub.Fetch(10)
	fmt.Println(msgs)
	if err != nil {
		panic(err)
	}
	// Unsubscribe
	sub.Unsubscribe()

	// Drain
	sub.Drain()
}
