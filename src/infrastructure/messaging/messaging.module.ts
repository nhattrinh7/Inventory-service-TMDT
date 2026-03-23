import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MESSAGE_PUBLISHER } from '~/domain/contracts/message-publisher.interface'
import { RabbitMQPublisher } from '~/infrastructure/messaging/publishers/rabbitmq.publisher'
import { CqrsModule } from '@nestjs/cqrs'
import { ProductCreatedConsumer } from '~/infrastructure/messaging/consumers/product-created.consumer'
import { ProductUpdatedConsumer } from '~/infrastructure/messaging/consumers/product-updated.consumer'
import { GetStocksConsumer } from '~/infrastructure/messaging/consumers/get-stocks.consumer'
import { GetBuyCountConsumer } from '~/infrastructure/messaging/consumers/get-buy-count.consumer'
import { SagaInventoryConsumer } from '~/infrastructure/messaging/consumers/saga-inventory.consumer'
import { OrderDeliveryConsumer } from '~/infrastructure/messaging/consumers/order-delivery.consumer'

@Module({
  imports: [
    CqrsModule,
    ClientsModule.register([
      {
        name: 'NOTIFICATION_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin123@localhost:5672'],
          queue: 'notification_queue',
          persistent: true,
        },
      },
      {
        name: 'SAGA_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin123@localhost:5672'],
          queue: 'saga_queue',
          persistent: true,
        },
      },
    ]),
  ],
  controllers: [
    ProductCreatedConsumer,
    ProductUpdatedConsumer,
    GetStocksConsumer,
    GetBuyCountConsumer,
    SagaInventoryConsumer,
    OrderDeliveryConsumer,
  ],
  providers: [
    {
      provide: MESSAGE_PUBLISHER,
      useClass: RabbitMQPublisher,
    },
  ],
  exports: [ClientsModule, MESSAGE_PUBLISHER],
})
export class MessagingModule {}
