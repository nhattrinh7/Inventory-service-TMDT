import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { Reservation } from '~/domain/entities/reservation.entity'
import { ReservationMapper } from '~/infrastructure/database/mappers/reservation.mapper'
import { IReservationRepository } from '~/domain/repositories/reservation.repository.interface'

@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(reservation: Reservation, tx?: any): Promise<void> {
    const client = tx ?? this.prisma
    const data = ReservationMapper.toPersistence(reservation)

    await client.reservation.create({ data })
  }

  async findById(id: string, tx?: any): Promise<Reservation | null> {
    const client = tx ?? this.prisma
    const reservation = await client.reservation.findUnique({
      where: { id },
    })

    if (!reservation) {
      return null
    }

    return ReservationMapper.toDomain(reservation)
  }

  async update(reservation: Reservation, tx?: any): Promise<void> {
    const client = tx ?? this.prisma
    const data = ReservationMapper.toPersistence(reservation)

    await client.reservation.update({
      where: { id: reservation.id },
      data,
    })
  }
}
