export interface StockItem {
  productVariantId: string
  stock: number
  soldQuantity: number
}

export interface ProductStock {
  productId: string
  variants: StockItem[]
}

export interface GetStocksResponseType {
  stocks: ProductStock[]
}

export interface GetStocksPayload {
  productIds: string[]
}
