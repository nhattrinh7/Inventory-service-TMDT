import { Reservation } from '~/domain/entities/reservation.entity'

export interface IReservationRepository {
  create(reservation: Reservation, tx?: any): Promise<void>
  findById(id: string, tx?: any): Promise<Reservation | null>
  update(reservation: Reservation, tx?: any): Promise<void>
}

export const RESERVATION_REPOSITORY = Symbol('IReservationRepository')
