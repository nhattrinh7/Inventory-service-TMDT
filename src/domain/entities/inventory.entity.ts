import { AggregateRoot } from '@nestjs/cqrs'
import { CreateInventoryBodyDto } from '~/presentation/dtos/inventory.dto'
import { v4 as uuidv4 } from 'uuid'

export class Inventory extends AggregateRoot {
  constructor(
    public id: string,
    public productId: string,
    public productVariantId: string,
    public shopId: string,
    public totalQuantity: number,
    public reservedQuantity: number,
    public availableQuantity: number,
    public soldQuantity: number,
    public createdAt: Date,
    public updatedAt: Date,
    public isDeleted: boolean,
  ) {
    super()
  }

  static create(props: CreateInventoryBodyDto): Inventory {
    const inventory = new Inventory(
      uuidv4(),
      props.productId,
      props.productVariantId,
      props.shopId,
      props.stock,
      0,
      props.stock,
      0,
      new Date(),
      new Date(),
      false,
    )

    return inventory
  }
}
