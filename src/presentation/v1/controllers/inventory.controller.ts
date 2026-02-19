import {
  Body,
  Controller,
  Put,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { CheckInventoryToMinusBodyDto, CheckInventoryToPlusBodyDto } from '~/presentation/dtos/inventory.dto'
import { CheckInventoryToMinusQuery } from '~/application/queries/check-inventory-to-minus/check-inventory-to-minus.query'
import { CheckInventoryToPlusQuery } from '~/application/queries/check-inventory-to-plus/check-inventory-to-plus.query'

@Controller('v1/inventories')
export class InventoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Put('check-inventory-to-minus')
  async checkInventoryToMinus(
    @Body() body: CheckInventoryToMinusBodyDto,
  ): Promise<{ message: string, data: { isMinusSuccess: boolean, quantity: number } }> {
    const result = await this.queryBus.execute(new CheckInventoryToMinusQuery(body))
    
    return { message: 'Check inventory to minus successful', data: result }
  }

  @Put('check-inventory-to-plus')
  async checkInventoryToPlus(
    @Body() body: CheckInventoryToPlusBodyDto,
  ): Promise<{ message: string, data: { isPlusSuccess: boolean, quantity: number } }> {
    const result = await this.queryBus.execute(new CheckInventoryToPlusQuery(body))
    
    return { message: 'Check inventory to plus successful', data: result }
  }

}
