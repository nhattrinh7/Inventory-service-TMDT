import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { INVENTORY_REPOSITORY, type IInventoryRepository } from '~/domain/repositories/inventory.repository.interface'

import { CheckInventoryToMinusQuery } from './check-inventory-to-minus.query'

type CheckInventoryToMinusResponseType = {
  isMinusSuccess: boolean
  quantity: number
}

@QueryHandler(CheckInventoryToMinusQuery)
export class CheckInventoryToMinusHandler implements IQueryHandler<CheckInventoryToMinusQuery, CheckInventoryToMinusResponseType> {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
      private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(query: CheckInventoryToMinusQuery): Promise<CheckInventoryToMinusResponseType> {
    const { productVariantId, quantity } = query.payload

    // Lấy thông tin inventory từ repository
    const inventory = await this.inventoryRepository.findByProductVariantId(productVariantId)

    // Nếu không tìm thấy inventory, trả về không thể trừ
    if (!inventory) {
      return {
        isMinusSuccess: false,
        quantity: 0
      }
    }

    // Business logic: Kiểm tra số lượng mong muốn có vượt quá availableQuantity không
    if (quantity > inventory.availableQuantity) {
      // Vượt quá: trả về isMinusSuccess=false và quantity=availableQuantity
      return {
        isMinusSuccess: false,
        quantity: inventory.availableQuantity
      }
    }

    // Không vượt: trả về isMinusSuccess=true và quantity=số lượng mong muốn
    return {
      isMinusSuccess: true,
      quantity: quantity
    }
  }
}
