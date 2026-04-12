import { IQuery } from '@nestjs/cqrs'

export class GetStocksQuery implements IQuery {
  constructor(public readonly productIds: Array<string>) {}
}
