import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateInventoryCommand } from '~/application/commands/create-inventory/create-inventory.command'
import { Inventory } from '~/domain/entities/inventory.entity'
import { INVENTORY_REPOSITORY, type IInventoryRepository } from '~/domain/repositories/inventory.repository.interface'


@CommandHandler(CreateInventoryCommand)
export class CreateInventoryHandler implements ICommandHandler<CreateInventoryCommand, void> {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(command: CreateInventoryCommand) {
    const { variants } = command

    const inventories = variants.map(item =>
      Inventory.create({
        productId: item.productId,
        productVariantId: item.productVariantId,
        stock: item.stock,
        shopId: item.shopId
      })
    )

    await this.inventoryRepository.createMany(inventories)
  }
}
