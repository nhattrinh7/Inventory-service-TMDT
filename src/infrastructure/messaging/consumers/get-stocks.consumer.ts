import { Controller } from '@nestjs/common'
import { Payload, Ctx, RmqContext, MessagePattern } from '@nestjs/microservices'
import { QueryBus } from '@nestjs/cqrs'
import { BaseRetryConsumer } from '~/common/utils/base-retry.consumer'
import { GetStocksQuery } from '~/application/queries/get-stocks/get-stocks.query'
import { type GetStocksPayload } from '~/domain/interfaces/inventory.interface'

@Controller()
export class GetStocksConsumer extends BaseRetryConsumer {
  constructor(
    private readonly queryBus: QueryBus
  ) {
    super()
  }

  @MessagePattern('get.stocks')
  async handleGetStocks(
    @Payload() data: GetStocksPayload,
    @Ctx() context: RmqContext,
  ) {
    const result = await this.handleWithRetry(context, async () => {
      this.logger.log(`Event get.stocks received, count=${data.productIds?.length}`)
      const result = await this.queryBus.execute(new GetStocksQuery(data.productIds))
      return result
    }) 

    return result
  }
}