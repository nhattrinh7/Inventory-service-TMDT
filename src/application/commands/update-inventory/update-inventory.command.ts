import { ICommand } from '@nestjs/cqrs'

export class UpdateInventoryCommand implements ICommand {
  constructor(
    public readonly variants: Array<{
      productVariantId: string
      stock: number
    }>,
  ) {}
}
