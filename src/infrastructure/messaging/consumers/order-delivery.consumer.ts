import { Controller } from '@nestjs/common'
import { Payload, Ctx, RmqContext, EventPattern } from '@nestjs/microservices'
import { CommandBus } from '@nestjs/cqrs'
import { BaseRetryConsumer } from '~/common/utils/base-retry.consumer'
import { DeliverySuccessInventoryCommand } from '~/application/commands/delivery-success-inventory/delivery-success-inventory.command'
import { DeliveryFailInventoryCommand } from '~/application/commands/delivery-fail-inventory/delivery-fail-inventory.command'

@Controller()
export class OrderDeliveryConsumer extends BaseRetryConsumer {
  constructor(
    private readonly commandBus: CommandBus
  ) {
    super()
  }

  @EventPattern('inventory.delivery-success')
  async handleDeliverySuccess(
    @Payload() data: { orderId: string; items: Array<{ productVariantId: string; quantity: number }> },
    @Ctx() context: RmqContext,
  ) {
    await this.handleWithRetry(context, async () => {
      this.logger.log(`Event inventory.delivery-success received, orderId=${data.orderId}`)
      await this.commandBus.execute(new DeliverySuccessInventoryCommand(data.items))
    })
  }

  @EventPattern('inventory.delivery-fail')
  async handleDeliveryFail(
    @Payload() data: { orderId: string; items: Array<{ productVariantId: string; quantity: number }> },
    @Ctx() context: RmqContext,
  ) {
    await this.handleWithRetry(context, async () => {
      this.logger.log(`Event inventory.delivery-fail received, orderId=${data.orderId}`)
      await this.commandBus.execute(new DeliveryFailInventoryCommand(data.items))
    })
  }
}
