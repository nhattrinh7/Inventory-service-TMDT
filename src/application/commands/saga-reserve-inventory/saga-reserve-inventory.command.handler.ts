import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { SagaReserveInventoryCommand } from './saga-reserve-inventory.command'
import type { IInventoryRepository } from '~/domain/repositories/inventory.repository.interface'
import { INVENTORY_REPOSITORY } from '~/domain/repositories/inventory.repository.interface'
import type { IReservationRepository } from '~/domain/repositories/reservation.repository.interface'
import { RESERVATION_REPOSITORY } from '~/domain/repositories/reservation.repository.interface'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { Reservation } from '~/domain/entities/reservation.entity'

@CommandHandler(SagaReserveInventoryCommand)
export class SagaReserveInventoryHandler implements ICommandHandler<SagaReserveInventoryCommand> {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: SagaReserveInventoryCommand): Promise<{ success: boolean; reservationIds: string[] }> {
    const { sagaId, userId, items } = command
    const reservationIds: string[] = []

    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        // Tìm inventory, throw nếu không có
        const inventory = await this.inventoryRepository.findByProductVariantIdOrThrow(item.productVariantId, tx)

        // Check số lượng
        if (inventory.availableQuantity < item.quantity) {
          throw new Error(
            `Sản phẩm ${item.productVariantId} không đủ số lượng (còn ${inventory.availableQuantity}, cần ${item.quantity})`,
          )
        }

        // Cập nhật số lượng inventory
        await this.inventoryRepository.decrementAvailableAndIncrementReserved(item.productVariantId, item.quantity, tx)

        // Tạo reservation entity
        const reservation = Reservation.create({
          inventoryId: inventory.id,
          sagaId,
          userId,
          quantity: item.quantity,
        })

        // Lưu reservation
        await this.reservationRepository.create(reservation, tx)

        reservationIds.push(reservation.id)
      }
    }, { maxWait: 10000, timeout: 15000 })

    return {
      success: true,
      reservationIds,
    }
  }
}
