import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CatalogService } from './services/catalog/catalog.service.js';
import { OrderService } from './services/order/order.service.js';
import { UserService } from './services/user/user.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogItem, Order, OrderItem, OrderMessage, User } from './model/mysql.js';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv, Keyv } from '@keyv/redis';
import { KeyvCacheableMemory } from 'cacheable';
import { KafkaModule } from './kafka/kafka.module.js';
import { OrderConsumer } from './services/order/order.consumer.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'db',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'primary',
      entities: [User, Order, OrderItem, OrderMessage, CatalogItem],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Order, OrderItem, OrderMessage, CatalogItem]),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const redisStore = createKeyv('redis://redis:6379');
        redisStore.on('error', (err) => console.error('Redis error:', err));
        return {
          stores: [
            new Keyv({
              store: new KeyvCacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            redisStore,
          ],
        };
      },
    }),
    KafkaModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserService, OrderService, CatalogService, OrderConsumer],
})
export class AppModule {}
