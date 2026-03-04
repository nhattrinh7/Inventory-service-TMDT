import { Controller } from '@nestjs/common'
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices'
import { CommandBus } from '@nestjs/cqrs'
import { BaseRetryConsumer } from '~/common/utils/base-retry.consumer'
import { UpdateInventoryCommand } from '~/application/commands/update-inventory/update-inventory.command'
import { CreateInventoryCommand } from '~/application/commands/create-inventory/create-inventory.command'
import { SoftDeleteInventoryCommand } from '~/application/commands/soft-delete-inventory/soft-delete-inventory.command'

interface ProductUpdatedEvent {
  data: {
    stockUpdates?: Array<{ productVariantId: string; stock: number }>
    variantsToCreate?: Array<{ productId: string; productVariantId: string; stock: number; shopId: string }>
    variantsToDelete?: string[]  // Danh sách variantIds cần soft delete
  }
}

@Controller()
export class ProductUpdatedConsumer extends BaseRetryConsumer {
  constructor(
    private readonly commandBus: CommandBus
  ) {
    super()
  }

  @EventPattern('product.updated')
  async handleProductUpdated(
    @Payload() event: ProductUpdatedEvent,
    @Ctx() context: RmqContext,
  ) {
    await this.handleWithRetry(context, async () => {
      const { stockUpdates, variantsToCreate, variantsToDelete } = event.data
      this.logger.log(`Event product.updated received, stockUpdates=${stockUpdates?.length ?? 0}, variantsToCreate=${variantsToCreate?.length ?? 0}, variantsToDelete=${variantsToDelete?.length ?? 0}`)
      // 1. Update stocks cho variants hiện có
      if (stockUpdates && stockUpdates.length > 0) {
        await this.commandBus.execute(new UpdateInventoryCommand(stockUpdates))
      }

      // 2. Tạo inventory mới cho variants mới
      if (variantsToCreate && variantsToCreate.length > 0) {
        await this.commandBus.execute(new CreateInventoryCommand(variantsToCreate))
      }

      // 3. Soft delete inventories cho variants bị xóa
      if (variantsToDelete && variantsToDelete.length > 0) {
        await this.commandBus.execute(new SoftDeleteInventoryCommand(variantsToDelete))
      }
    })
  }
}
