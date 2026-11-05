import { Injectable, OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import { Consumer, ConsumerRunConfig, ConsumerSubscribeTopics, Kafka, Producer, ProducerRecord } from 'kafkajs'

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
    private readonly kafka = new Kafka({
        brokers: ['kafka:9092']
    })
    private readonly consumers: Consumer[] = []

    async consume(topics: ConsumerSubscribeTopics, config: ConsumerRunConfig) {
        const consumer = this.kafka.consumer({ groupId: "app" })
        await consumer.connect()
        await consumer.subscribe(topics)
        await consumer.run(config)
        this.consumers.push(consumer)
    }

    async onApplicationShutdown() {
        for (const consumer of this.consumers) {
            await consumer.disconnect()
        }
    }
}
