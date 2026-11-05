import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem, CatalogItemType, OrderMessage, OrderStatus } from '../../model/mysql.js';
import { ProducerService } from '../../kafka/producer.service.js';

@Injectable()
export class OrderService {

    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,

        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,

        @InjectRepository(OrderMessage)
        private orderMessageRepository: Repository<OrderMessage>,

        private readonly producerService: ProducerService
    ) {}

    async seedDatabase(userIds: string[], catalogItemIds: string[]) {
        const order1 = await this.orderRepository.save({ userId: userIds[0], status: OrderStatus.PLACED })
        await this.orderItemRepository.save({ orderId: order1.id, quantity: 1, catalogId: catalogItemIds[0]})
        await this.orderItemRepository.save({ orderId: order1.id, quantity: 1, catalogId: catalogItemIds[8]})
        await this.orderItemRepository.save({ orderId: order1.id, quantity: 1, catalogId: catalogItemIds[17]})
        await this.orderMessageRepository.save({ orderId: order1.id, userId: userIds[0], message: "Hello! I would like his combination please!"})
        await this.orderMessageRepository.save({ orderId: order1.id, userId: userIds[2], message: "Of course! I should have this finished in 2 weeks."})
        await this.orderMessageRepository.save({ orderId: order1.id, userId: userIds[0], message: "Thanks!"})
        const order2 = await this.orderRepository.save({ userId: userIds[1], status: OrderStatus.PLACED })
        await this.orderItemRepository.save({ orderId: order2.id, quantity: 1, catalogId: catalogItemIds[3]})
        await this.orderItemRepository.save({ orderId: order2.id, quantity: 1, catalogId: catalogItemIds[13]})
        await this.orderItemRepository.save({ orderId: order2.id, quantity: 1, catalogId: catalogItemIds[15]})
        await this.orderItemRepository.save({ orderId: order2.id, quantity: 1, catalogId: catalogItemIds[16]})
        await this.orderMessageRepository.save({ orderId: order2.id, userId: userIds[1], message: "Hello, I would like to inquire about this current set."})
        await this.orderMessageRepository.save({ orderId: order2.id, userId: userIds[2], message: "I think this looks like a good setup, did you any specific details?"})
        await this.orderMessageRepository.save({ orderId: order2.id, userId: userIds[1], message: "Yes here you can view some reference images in this google drive: LINK"})
        await this.orderMessageRepository.save({ orderId: order2.id, userId: userIds[2], message: "Great, I will sketch up a few examples this week."})
        await this.orderMessageRepository.save({ orderId: order2.id, userId: userIds[2], message: "Perfect, keep me updated please."})
        const orders = await this.searchOrders({})
        return orders.map((order) => order.id)
    }

    async searchOrders(order: Partial<Order>) {
        return await this.orderRepository.find({
            where: order
        });
    }

    async createOrder(userId: string, catalogItemIds: string[]) {
        const _order = await this.orderRepository.save({
            userId: userId,
            status: OrderStatus.PROCESSING 
        })
        for (let catalogId of catalogItemIds) {
            await this.orderItemRepository.save({
                orderId: _order.id,
                quantity: 1,
                catalogId: catalogId
            })
        }
        await this.producerService.produce({
            topic: 'placedOrders',
            messages: [
                {
                    value: JSON.stringify(_order)
                }
            ]
        })
        return _order
    }

    async getOrder(id: string) {
        return await this.orderRepository.findOne({
            where: {id: id},
            relations: { items: true, messages: true}
        });
    }

    async updateOrder(id: string, order: Partial<Order>) {
        const _order = await this.orderRepository.findOneBy({ id });
        if (_order) {
            _order.status = order.status ?? _order.status
            return await this.orderRepository.save(_order);
        }
        throw new BadRequestException('Operation failed');
    }

    async deleteOrder(id: string) {
        await this.orderMessageRepository.delete({ orderId: id })
        await this.orderItemRepository.delete({ orderId: id })
        return await this.orderRepository.delete(id)
    }

    async getMessages(orderId: string) {
        return await this.orderMessageRepository.find({
            where: {orderId: orderId},
        });
    }

    async createMessage(orderId: string, userId: string|null, message: string) {
        if ( !userId ) {
            throw new BadRequestException('User ID must be valid');
        }
        return await this.orderMessageRepository.save({
            orderId: orderId,
            userId: userId,
            message: message,
        })
    }

}
