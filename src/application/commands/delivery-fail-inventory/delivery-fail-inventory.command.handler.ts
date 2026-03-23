import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { DeliveryFailInventoryCommand } from './delivery-fail-inventory.command'
import type { IInventoryRepository } from '~/domain/repositories/inventory.repository.interface'
import { INVENTORY_REPOSITORY } from '~/domain/repositories/inventory.repository.interface'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'

@CommandHandler(DeliveryFailInventoryCommand)
export class DeliveryFailInventoryHandler implements ICommandHandler<DeliveryFailInventoryCommand> {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: DeliveryFailInventoryCommand): Promise<void> {
    const { items } = command
    if (!items || items.length === 0) return

    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        await this.inventoryRepository.updateQuantityAfterDeliveryFail(
          item.productVariantId,
          item.quantity,
          tx,
        )
      }
    }, { maxWait: 10000, timeout: 15000 })
  }
}
