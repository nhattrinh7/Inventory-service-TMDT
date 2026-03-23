export class DeliverySuccessInventoryCommand {
  constructor(
    public readonly items: Array<{ productVariantId: string; quantity: number }>,
  ) {}
}
