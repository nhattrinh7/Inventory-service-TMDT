import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UpdateInventoryCommand } from '~/application/commands/update-inventory/update-inventory.command'
import {
  INVENTORY_REPOSITORY,
  type IInventoryRepository,
} from '~/domain/repositories/inventory.repository.interface'

@CommandHandler(UpdateInventoryCommand)
export class UpdateInventoryHandler implements ICommandHandler<UpdateInventoryCommand, void> {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(command: UpdateInventoryCommand) {
    const { variants } = command

    // Business Logic: Lấy inventory hiện tại và tính toán totalQuantity mới
    const variantsWithCalculatedTotal = await Promise.all(
      variants.map(async variant => {
        // Lấy reservedQuantity hiện tại
        const inventory = await this.inventoryRepository.findByProductVariantId(
          variant.productVariantId,
        )

        if (!inventory) {
          throw new Error(`Inventory not found for productVariantId: ${variant.productVariantId}`)
        }

        // Tính totalQuantity = reservedQuantity hiện tại + availableQuantity mới
        const totalQuantity = inventory.reservedQuantity + variant.stock

        return {
          productVariantId: variant.productVariantId,
          availableQuantity: variant.stock,
          totalQuantity,
        }
      }),
    )

    // Repository chỉ thực hiện data access
    await this.inventoryRepository.updateStocks(variantsWithCalculatedTotal)
  }
}
