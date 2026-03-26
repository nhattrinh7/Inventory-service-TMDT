import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { SagaReleaseInventoryCommand } from './saga-release-inventory.command'
import type { IInventoryRepository } from '~/domain/repositories/inventory.repository.interface'
import { INVENTORY_REPOSITORY } from '~/domain/repositories/inventory.repository.interface'
import type { IReservationRepository } from '~/domain/repositories/reservation.repository.interface'
import { RESERVATION_REPOSITORY } from '~/domain/repositories/reservation.repository.interface'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { ReservationStatus } from '~/domain/enums/reservation.enum'
import { PRISMA_TX_MAX_WAIT, PRISMA_TX_TIMEOUT } from '~/common/constants/index.constants'

@CommandHandler(SagaReleaseInventoryCommand)
export class SagaReleaseInventoryHandler implements ICommandHandler<SagaReleaseInventoryCommand> {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: SagaReleaseInventoryCommand): Promise<void> {
    const { reservationIds, failureReason } = command

    await this.prisma.$transaction(async (tx) => {
      for (const reservationId of reservationIds) {
        // Tìm reservation
        const reservation = await this.reservationRepository.findById(reservationId, tx)

        if (!reservation || reservation.status !== ReservationStatus.PENDING) continue

        // Cancel reservation (domain logic)
        reservation.cancel(failureReason)

        // Trả lại số lượng đã giữ về inventory
        await this.inventoryRepository.incrementAvailableAndDecrementReserved(
          reservation.inventoryId,
          reservation.quantity,
          tx,
        )

        // Cập nhật trạng thái reservation
        await this.reservationRepository.update(reservation, tx)
      }
    }, { maxWait: PRISMA_TX_MAX_WAIT, timeout: PRISMA_TX_TIMEOUT })
  }
}
