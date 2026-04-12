import { ICommand } from '@nestjs/cqrs'

export class SoftDeleteInventoryCommand implements ICommand {
  constructor(public readonly variantIds: string[]) {}
}
