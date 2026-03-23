import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { DeliverySuccessInventoryCommand } from './delivery-success-inventory.command'
import type { IInventoryRepository } from '~/domain/repositories/inventory.repository.interface'
import { INVENTORY_REPOSITORY } from '~/domain/repositories/inventory.repository.interface'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'

@CommandHandler(DeliverySuccessInventoryCommand)
export class DeliverySuccessInventoryHandler implements ICommandHandler<DeliverySuccessInventoryCommand> {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: DeliverySuccessInventoryCommand): Promise<void> {
    const { items } = command
    if (!items || items.length === 0) return

    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        await this.inventoryRepository.updateQuantityAfterDeliverySuccess(
          item.productVariantId,
          item.quantity,
          tx,
        )
      }
    }, { maxWait: 10000, timeout: 15000 })
  }
}
