export class SagaReleaseInventoryCommand {
  constructor(
    public readonly sagaId: string,
    public readonly reservationIds: string[],
    public readonly failureReason: string,
  ) {}
}
