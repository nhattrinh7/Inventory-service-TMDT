import { Controller } from '@nestjs/common'
import { Payload, Ctx, RmqContext, MessagePattern } from '@nestjs/microservices'
import { QueryBus } from '@nestjs/cqrs'
import { BaseRetryConsumer } from '~/common/utils/base-retry.consumer'
import { GetBuyCountQuery } from '~/application/queries/get-buy-count/get-buy-count.query'

interface GetBuyCountPayload {
  productVariantIds: string[]
}

@Controller()
export class GetBuyCountConsumer extends BaseRetryConsumer {
  constructor(private readonly queryBus: QueryBus) {
    super()
  }

  @MessagePattern('get.buy.count')
  async handleGetBuyCount(@Payload() data: GetBuyCountPayload, @Ctx() context: RmqContext) {
    const result = await this.handleWithRetry(context, async () => {
      const result = await this.queryBus.execute(new GetBuyCountQuery(data.productVariantIds))
      return result
    })

    return result
  }
}
