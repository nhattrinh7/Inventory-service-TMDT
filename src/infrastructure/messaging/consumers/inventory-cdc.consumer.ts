import { Controller, Inject, Logger } from '@nestjs/common'
import { Payload, MessagePattern } from '@nestjs/microservices'
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch'
import {
  INVENTORY_REPOSITORY,
  type IInventoryRepository,
} from '~/domain/repositories/inventory.repository.interface'

@Controller()
export class InventoryCdcConsumer {
  private readonly logger = new Logger(InventoryCdcConsumer.name)

  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    private readonly esService: NestElasticsearchService,
  ) {}

  @MessagePattern('postgres.public.inventories')
  async handleInventoryCdc(@Payload() message: any) {
    if (!message) return

    const data = message.payload || message
    const { before, after } = data

    // Gom productId để tính tổng (đối chiếu schema: productId trong DB map thành product_id ở Postgres CDC)
    const productId = after?.product_id || before?.product_id
    if (!productId) return

    try {
      // 1. Lấy soldQuantity và availableQuantity cho cục SPU này
      const stats = await this.inventoryRepository.getProductStockStats(productId)

      // 2. Cập nhật Partial đè sinh tử đúng 2 trường lên ES
      await this.esService.update({
        index: 'products',
        id: productId,
        doc: {
          buy_count: stats.buyCount,
          is_in_stock: stats.isInStock,
        },
      })
      this.logger.debug(
        `CDC Sync ES: Product SPU ${productId} mapped buy_count=${stats.buyCount}, is_in_stock=${stats.isInStock}`,
      )
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        this.logger.debug(`Product ES not found yet for inventory sync: ${productId}. Awaiting catalog to build it first.`)
      } else {
        this.logger.error(`Failed CDC ES sync for product ${productId}:`, error.message)
      }
    }
  }
}
