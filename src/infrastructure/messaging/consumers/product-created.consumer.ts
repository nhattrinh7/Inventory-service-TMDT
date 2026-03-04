import { Controller } from '@nestjs/common'
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices'
import { CommandBus } from '@nestjs/cqrs'
import { BaseRetryConsumer } from '~/common/utils/base-retry.consumer'
import { CreateInventoryCommand } from '~/application/commands/create-inventory/create-inventory.command'

@Controller()
export class ProductCreatedConsumer extends BaseRetryConsumer {
  constructor(
    private readonly commandBus: CommandBus
  ) {
    super()
  }

  @EventPattern('product.created')
  async handleProductCreated(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    await this.handleWithRetry(context, async () => {
      this.logger.log(`Event product.created received, variants=${data.variants?.length}`)
      await this.commandBus.execute(new CreateInventoryCommand(data.variants))
    })
  }
}
