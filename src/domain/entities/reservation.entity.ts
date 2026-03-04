import { v4 as uuidv4 } from 'uuid'
import { ReservationStatus } from '~/domain/enums/reservation.enum'

export class Reservation {
  constructor(
    public id: string,
    public inventoryId: string,
    public sagaId: string,
    public orderId: string | null,
    public userId: string,
    public quantity: number,
    public status: ReservationStatus,
    public expiresAt: Date,
    public confirmedAt: Date | null,
    public cancelledAt: Date | null,
    public cancellationReason: string | null,
    public createdAt: Date,
  ) {}

  static create(params: {
    inventoryId: string
    sagaId: string
    userId: string
    quantity: number
  }): Reservation {
    return new Reservation(
      uuidv4(),
      params.inventoryId,
      params.sagaId,
      null,
      params.userId,
      params.quantity,
      ReservationStatus.PENDING,
      new Date(Date.now() + 15 * 60 * 1000), // 15 phút
      null,
      null,
      null,
      new Date(),
    )
  }

  cancel(reason: string): void {
    this.status = ReservationStatus.CANCELLED
    this.cancelledAt = new Date()
    this.cancellationReason = reason
  }
}
