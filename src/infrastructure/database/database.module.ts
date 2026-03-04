import { Module } from '@nestjs/common'
import { PrismaService } from '~/infrastructure/database/prisma/prisma.service'
import { INVENTORY_REPOSITORY } from '~/domain/repositories/inventory.repository.interface'
import { InventoryRepository } from '~/infrastructure/database/repositories/inventory.repository'
import { RESERVATION_REPOSITORY } from '~/domain/repositories/reservation.repository.interface'
import { ReservationRepository } from '~/infrastructure/database/repositories/reservation.repository'
import { CqrsModule } from '@nestjs/cqrs'

@Module({
  imports: [CqrsModule],
  providers: [
    PrismaService,
    {
      provide: INVENTORY_REPOSITORY,
      useClass: InventoryRepository,
    },
    {
      provide: RESERVATION_REPOSITORY,
      useClass: ReservationRepository,
    },
  ],
  exports: [
    PrismaService,
    INVENTORY_REPOSITORY,
    RESERVATION_REPOSITORY,
  ],
})
export class DatabaseModule {}

