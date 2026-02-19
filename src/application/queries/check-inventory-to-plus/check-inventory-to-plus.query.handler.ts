import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { INVENTORY_REPOSITORY, type IInventoryRepository } from '~/domain/repositories/inventory.repository.interface'

import { CheckInventoryToPlusQuery } from './check-inventory-to-plus.query'

type CheckInventoryToPlusResponseType = {
  isPlusSuccess: boolean
  quantity: number
}

@QueryHandler(CheckInventoryToPlusQuery)
export class CheckInventoryToPlusHandler implements IQueryHandler<CheckInventoryToPlusQuery, CheckInventoryToPlusResponseType> {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
      private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(query: CheckInventoryToPlusQuery): Promise<CheckInventoryToPlusResponseType> {
    const { productVariantId, quantity } = query.payload

    // Lấy thông tin inventory từ repository
    const inventory = await this.inventoryRepository.findByProductVariantId(productVariantId)

    // Nếu không tìm thấy inventory, trả về không thể cộng
    if (!inventory) {
      return {
        isPlusSuccess: false,
        quantity: 0
      }
    }

    // Business logic: Kiểm tra số lượng mong muốn có vượt quá availableQuantity không
    if (quantity > inventory.availableQuantity) {
      // Vượt quá: trả về isPlusSuccess=false và quantity=availableQuantity
      return {
        isPlusSuccess: false,
        quantity: inventory.availableQuantity
      }
    }

    // Không vượt: trả về isPlusSuccess=true và quantity=số lượng mong muốn
    return {
      isPlusSuccess: true,
      quantity: quantity
    }
  }
}
