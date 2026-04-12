import { ICommand } from '@nestjs/cqrs'

export class CreateInventoryCommand implements ICommand {
  constructor(
    public readonly variants: Array<{
      productId: string
      productVariantId: string
      stock: number
      shopId: string
    }>,
  ) {}
}
