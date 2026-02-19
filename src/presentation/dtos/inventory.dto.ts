import { createZodDto } from 'nestjs-zod'
import z from 'zod'


export const InventorySchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  productVariantId: z.uuid(),
  shopId: z.uuid(),
  totalQuantity: z.number().min(0),
  reservedQuantity: z.number().min(0),
  availableQuantity: z.number().min(0),
  soldQuantity: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export class InventoryDto extends createZodDto(InventorySchema) {}

export const createInventorySchema = InventorySchema.pick({
  productId: true,
  productVariantId: true,
  shopId: true,
})
export const createInventoryBodySchema = createInventorySchema.extend({
  stock: z.number().min(0),
})
export class CreateInventoryBodyDto extends createZodDto(createInventoryBodySchema) {}

export const checkInventoryToMinusSchema = z.object({
  productVariantId: z.uuid(),
  quantity: z.number().min(0),
})
export class CheckInventoryToMinusBodyDto extends createZodDto(checkInventoryToMinusSchema) {}
export class CheckInventoryToPlusBodyDto extends createZodDto(checkInventoryToMinusSchema) {}
