import { Controller, Inject } from '@nestjs/common'
import { Payload, Ctx, RmqContext, EventPattern } from '@nestjs/microservices'
import { CommandBus } from '@nestjs/cqrs'
import { BaseRetryConsumer } from '~/common/utils/base-retry.consumer'
import { SagaReserveInventoryCommand } from '~/application/commands/saga-reserve-inventory/saga-reserve-inventory.command'
import { SagaReleaseInventoryCommand } from '~/application/commands/saga-release-inventory/saga-release-inventory.command'
import type { IMessagePublisher } from '~/domain/contracts/message-publisher.interface'
import { MESSAGE_PUBLISHER } from '~/domain/contracts/message-publisher.interface'

@Controller()
export class SagaInventoryConsumer extends BaseRetryConsumer {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(MESSAGE_PUBLISHER)
    private readonly messagePublisher: IMessagePublisher,
  ) {
    super()
  }

  @EventPattern('saga.reserve-inventory')
  async handleReserveInventory(
    @Payload() data: {
      sagaId: string
      userId: string
      items: Array<{ productVariantId: string; quantity: number }>
    },
    @Ctx() context: RmqContext,
  ) {
    await this.handleWithRetry(context, async () => {
      this.logger.log(`Event saga.reserve-inventory received, sagaId=${data.sagaId}`)
      try {
        const result = await this.commandBus.execute(
          new SagaReserveInventoryCommand(data.sagaId, data.userId, data.items),
        )

        this.messagePublisher.emitToSagaOrchestrator('saga.result.reserve-inventory', {
          sagaId: data.sagaId,
          success: true,
          reservationIds: result.reservationIds,
        })
      } catch (error: any) {
        this.messagePublisher.emitToSagaOrchestrator('saga.result.reserve-inventory', {
          sagaId: data.sagaId,
          success: false,
          error: error.message || 'Lỗi reserve inventory',
        })
      }
    })
  }

  @EventPattern('saga.release-inventory')
  async handleReleaseInventory(
    @Payload() data: {
      sagaId: string
      reservationIds: string[]
      failureReason: string
    },
    @Ctx() context: RmqContext,
  ) {
    await this.handleWithRetry(context, async () => {
      this.logger.log(`Event saga.release-inventory received, sagaId=${data.sagaId}`)
      try {
        await this.commandBus.execute(
          new SagaReleaseInventoryCommand(data.sagaId, data.reservationIds, data.failureReason),
        )
      } catch (error: any) {
        this.logger.error(`Release inventory failed: ${error.message}`)
      }
    })
  }
}
