import { Reservation as PrismaReservation } from '@prisma/client'
import { Reservation } from '~/domain/entities/reservation.entity'
import { ReservationStatus } from '~/domain/enums/reservation.enum'

export class ReservationMapper {
  static toDomain(prismaReservation: PrismaReservation): Reservation {
    return new Reservation(
      prismaReservation.id,
      prismaReservation.inventoryId,
      prismaReservation.sagaId,
      prismaReservation.orderId,
      prismaReservation.userId,
      prismaReservation.quantity,
      prismaReservation.status as ReservationStatus,
      prismaReservation.expiresAt,
      prismaReservation.confirmedAt,
      prismaReservation.cancelledAt,
      prismaReservation.cancellationReason,
      prismaReservation.createdAt,
    )
  }

  static toPersistence(reservation: Reservation): PrismaReservation {
    return {
      id: reservation.id,
      inventoryId: reservation.inventoryId,
      sagaId: reservation.sagaId,
      orderId: reservation.orderId,
      userId: reservation.userId,
      quantity: reservation.quantity,
      status: reservation.status as any,
      expiresAt: reservation.expiresAt,
      confirmedAt: reservation.confirmedAt,
      cancelledAt: reservation.cancelledAt,
      cancellationReason: reservation.cancellationReason,
      createdAt: reservation.createdAt,
    }
  }
}
