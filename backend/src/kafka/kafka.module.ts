import { Module } from '@nestjs/common';
import { ProducerService } from './producer.service.js';
import { ConsumerService } from './consumer.service.js';

@Module({
    providers: [ProducerService, ConsumerService],
    exports: [ProducerService, ConsumerService]
})
export class KafkaModule {}
