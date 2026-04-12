import { Inventory as PrismaInventory } from '@prisma/client'
import { Inventory } from '~/domain/entities/inventory.entity'

export class InventoryMapper {
  static toDomain(prismaInventory: PrismaInventory): Inventory {
    return new Inventory(
      prismaInventory.id,
      prismaInventory.productId,
      prismaInventory.productVariantId,
      prismaInventory.shopId,
      prismaInventory.totalQuantity,
      prismaInventory.reservedQuantity,
      prismaInventory.availableQuantity,
      prismaInventory.soldQuantity,
      prismaInventory.createdAt,
      prismaInventory.updatedAt,
      prismaInventory.isDeleted,
    )
  }

  static toPersistence(inventory: Inventory): PrismaInventory {
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
      isDeleted: inventory.isDeleted,
    }
  }
}
