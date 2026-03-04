export class SagaReserveInventoryCommand {
  constructor(
    public readonly sagaId: string,
    public readonly userId: string,
    public readonly items: Array<{ productVariantId: string; quantity: number }>,
  ) {}
}
