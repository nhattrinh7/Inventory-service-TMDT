import { Inventory } from '~/domain/entities/inventory.entity'
import { InventoryDto } from '~/presentation/dtos/inventory.dto'

export class InventoryMapper {
  static toInventoryResponse(inventory: Inventory): InventoryDto {
    return {
      id: inventory.id,
      productId: inventory.productId,
      productVariantId: inventory.productVariantId,
      shopId: inventory.shopId,
      totalQuantity: inventory.totalQuantity,
      reservedQuantity: inventory.reservedQuantity,
      availableQuantity: inventory.availableQuantity,
      soldQuantity: inventory.soldQuantity,
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
    }
  }
}
