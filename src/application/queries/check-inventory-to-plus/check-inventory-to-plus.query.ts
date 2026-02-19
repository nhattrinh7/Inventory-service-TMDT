import { IQuery } from '@nestjs/cqrs'
import { CheckInventoryToPlusBodyDto } from '~/presentation/dtos/inventory.dto'

export class CheckInventoryToPlusQuery implements IQuery {
  constructor(
    public readonly payload: CheckInventoryToPlusBodyDto,
  ) {}
}

