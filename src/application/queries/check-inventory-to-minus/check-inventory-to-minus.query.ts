import { IQuery } from '@nestjs/cqrs'
import { CheckInventoryToMinusBodyDto } from '~/presentation/dtos/inventory.dto'

export class CheckInventoryToMinusQuery implements IQuery {
  constructor(
    public readonly payload: CheckInventoryToMinusBodyDto,
  ) {}
}
