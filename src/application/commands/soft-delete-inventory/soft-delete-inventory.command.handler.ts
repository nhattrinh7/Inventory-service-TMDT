import { Inject, Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { SoftDeleteInventoryCommand } from '~/application/commands/soft-delete-inventory/soft-delete-inventory.command'
import { INVENTORY_REPOSITORY, type IInventoryRepository } from '~/domain/repositories/inventory.repository.interface'

@CommandHandler(SoftDeleteInventoryCommand)
export class SoftDeleteInventoryHandler implements ICommandHandler<SoftDeleteInventoryCommand, void> {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(command: SoftDeleteInventoryCommand) {
    const { variantIds } = command

    if (variantIds.length === 0) return

    // Soft delete inventories theo variantIds
    await this.inventoryRepository.softDeleteByVariantIds(variantIds)
  }
}
