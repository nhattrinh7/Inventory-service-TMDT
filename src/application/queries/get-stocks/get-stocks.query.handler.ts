import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import {
  INVENTORY_REPOSITORY,
  type IInventoryRepository,
} from '~/domain/repositories/inventory.repository.interface'

import { GetStocksQuery } from '~/application/queries/get-stocks/get-stocks.query'
import { GetStocksResponseType } from '~/domain/interfaces/inventory.interface'

@QueryHandler(GetStocksQuery)
export class GetStocksHandler implements IQueryHandler<GetStocksQuery, GetStocksResponseType> {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(query: GetStocksQuery) {
    const { productIds } = query
    const result = await this.inventoryRepository.getStocksByProductIds(productIds)

    return result
  }
}
