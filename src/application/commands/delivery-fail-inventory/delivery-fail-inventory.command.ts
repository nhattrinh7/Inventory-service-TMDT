export class DeliveryFailInventoryCommand {
  constructor(
    public readonly items: Array<{ productVariantId: string; quantity: number }>,
  ) {}
}
