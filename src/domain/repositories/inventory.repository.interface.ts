import { Inventory } from '~/domain/entities/inventory.entity'
import { GetStocksResponseType } from '~/domain/interfaces/inventory.interface'

export interface IInventoryRepository {
  createMany(inventories: Inventory[]): Promise<void>
  getStocksByProductIds(productIds: string[]): Promise<GetStocksResponseType>
  findByProductVariantId(productVariantId: string): Promise<Inventory | null>
  updateStocks(variants: Array<{ productVariantId: string; availableQuantity: number; totalQuantity: number }>): Promise<void>
  softDeleteByVariantIds(variantIds: string[]): Promise<void>
  getBuyCountAndIsInStockByVariantIds(productVariantIds: string[]): Promise<{ buyCount: number; isInStock: boolean }>
  checkInventory(items: Array<{ productVariantId: string; quantity: number }>): Promise<void>

  // Saga atomic operations
  findByProductVariantIdOrThrow(productVariantId: string, tx?: any): Promise<Inventory>
  decrementAvailableAndIncrementReserved(productVariantId: string, quantity: number, tx?: any): Promise<void>
  incrementAvailableAndDecrementReserved(inventoryId: string, quantity: number, tx?: any): Promise<void>
}
export const INVENTORY_REPOSITORY = Symbol('IInventoryRepository')

