import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConsumerService } from "../../kafka/consumer.service.js";
import { OrderService } from "./order.service.js";
import { Order, OrderStatus } from "../../model/mysql.js";


@Injectable()
export class OrderConsumer implements OnModuleInit {
    constructor(
        private readonly consumerService: ConsumerService,
        private readonly orderService: OrderService,
    ) {}

    async onModuleInit() {
        await this.consumerService.consume({ topics: ["placedOrders"] }, {
            eachMessage: async ({topic, partition, message}) => {
                if (message.value) {
                    const order = JSON.parse(message.value.toString()) as Order
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    order.status = OrderStatus.PLACED
                    await this.orderService.updateOrder(order.id, order)
                }
            }
        })
    }
}