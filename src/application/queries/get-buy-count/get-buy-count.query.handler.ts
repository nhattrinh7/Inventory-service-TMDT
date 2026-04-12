import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { GetBuyCountQuery } from '~/application/queries/get-buy-count/get-buy-count.query'
import {
  INVENTORY_REPOSITORY,
  type IInventoryRepository,
} from '~/domain/repositories/inventory.repository.interface'

@QueryHandler(GetBuyCountQuery)
export class GetBuyCountHandler
  implements IQueryHandler<GetBuyCountQuery, { buyCount: number; isInStock: boolean }>
{
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(query: GetBuyCountQuery): Promise<{ buyCount: number; isInStock: boolean }> {
    const { productVariantIds } = query
    return this.inventoryRepository.getBuyCountAndIsInStockByVariantIds(productVariantIds)
  }
}
