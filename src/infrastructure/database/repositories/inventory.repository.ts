import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { Inventory } from '~/domain/entities/inventory.entity'
import { InventoryMapper } from '~/infrastructure/database/mappers/inventory.mapper'
import { IInventoryRepository } from '~/domain/repositories/inventory.repository.interface'
import { GetStocksResponseType, ProductStock } from '~/domain/interfaces/inventory.interface'

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(inventories: Inventory[]): Promise<void> {
    const inventoryRecords = inventories.map(inventory =>
      InventoryMapper.toPersistence(inventory)
    )
    await this.prisma.inventory.createMany({
      data: inventoryRecords,
    })
  }

  async getStocksByProductIds(productIds: string[]): Promise<GetStocksResponseType> {
    // Query tất cả inventory records với productId trong list productIds
    const inventories = await this.prisma.inventory.findMany({
      where: {
        productId: {
          in: productIds,
        },
        isDeleted: false,
      },
      select: {
        productId: true,
        productVariantId: true,
        availableQuantity: true,
        soldQuantity: true,
      },
    })

    // Group theo productId và transform sang format GetStocksResponseType
    const stocksMap = new Map<string, ProductStock>()

    for (const inventory of inventories) {
      if (!stocksMap.has(inventory.productId)) {
        stocksMap.set(inventory.productId, {
          productId: inventory.productId,
          variants: [],
        })
      }

      const productStock = stocksMap.get(inventory.productId)!
      productStock.variants.push({
        productVariantId: inventory.productVariantId,
        stock: inventory.availableQuantity,
        soldQuantity: inventory.soldQuantity,
      })
    }

    return {
      stocks: Array.from(stocksMap.values()),
    }
  }

  async findByProductVariantId(productVariantId: string): Promise<Inventory | null> {
    const inventory = await this.prisma.inventory.findFirst({
      where: { 
        productVariantId,
        isDeleted: false,
      },
    })

    if (!inventory) {
      return null
    }

    return InventoryMapper.toDomain(inventory)
  }

  async softDeleteByVariantIds(variantIds: string[]): Promise<void> {
    await this.prisma.inventory.updateMany({
      where: { productVariantId: { in: variantIds } },
      data: { isDeleted: true },
    })
  }

  async updateStocks(variants: Array<{ productVariantId: string; availableQuantity: number; totalQuantity: number }>): Promise<void> {
    // Chỉ thực hiện data access, không có business logic
    await Promise.all(
      variants.map(variant =>
        this.prisma.inventory.update({
          where: { productVariantId: variant.productVariantId },
          data: {
            availableQuantity: variant.availableQuantity,
            totalQuantity: variant.totalQuantity,
            updatedAt: new Date(),
          },
        })
      )
    )
  }

  async getBuyCountAndIsInStockByVariantIds(productVariantIds: string[]): Promise<{ buyCount: number; isInStock: boolean }> {
    const inventories = await this.prisma.inventory.findMany({
      where: {
        productVariantId: {
          in: productVariantIds,
        },
        isDeleted: false,
      },
      select: {
        soldQuantity: true,
        availableQuantity: true,
      },
    })

    // Tính tổng soldQuantity
    const buyCount = inventories.reduce((sum, inv) => sum + inv.soldQuantity, 0)
    
    // isInStock = true nếu ít nhất 1 variant có availableQuantity > 0
    const isInStock = inventories.some(inv => inv.availableQuantity > 0)

    return { buyCount, isInStock }
  }

  async checkInventory(items: Array<{ productVariantId: string; quantity: number }>): Promise<void> {
    for (const item of items) {
      const inventory = await this.prisma.inventory.findUnique({
        where: { productVariantId: item.productVariantId },
      })

      if (!inventory) {
        throw new Error(`Không tìm thấy tồn kho cho variant ${item.productVariantId}`)
      }

      if (inventory.availableQuantity < item.quantity) {
        throw new Error(`Sản phẩm ${item.productVariantId} không đủ số lượng (còn ${inventory.availableQuantity}, cần ${item.quantity})`)
      }
    }
  }

  async findByProductVariantIdOrThrow(productVariantId: string, tx?: any): Promise<Inventory> {
    const client = tx ?? this.prisma
    const inventory = await client.inventory.findUnique({
      where: { productVariantId },
    })

    if (!inventory) {
      throw new Error(`Không tìm thấy tồn kho cho variant ${productVariantId}`)
    }

    return InventoryMapper.toDomain(inventory)
  }

  async decrementAvailableAndIncrementReserved(productVariantId: string, quantity: number, tx?: any): Promise<void> {
    const client = tx ?? this.prisma
    await client.inventory.update({
      where: { productVariantId },
      data: {
        availableQuantity: { decrement: quantity },
        reservedQuantity: { increment: quantity },
      },
    })
  }

  async incrementAvailableAndDecrementReserved(inventoryId: string, quantity: number, tx?: any): Promise<void> {
    const client = tx ?? this.prisma
    await client.inventory.update({
      where: { id: inventoryId },
      data: {
        availableQuantity: { increment: quantity },
        reservedQuantity: { decrement: quantity },
      },
    })
  }
}

