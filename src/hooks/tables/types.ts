export type TableStatus = 'FREE' | 'OCCUPIED'
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX'

export interface Table {
  id: string
  number: number
  pizzeriaId: string
  status: TableStatus
  openedAt: string | null
  openedById: string | null
  paymentMethod: PaymentMethod | null
  discount: string
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTableData {
  number: number
}

export interface CloseTableData {
  id: string
  paymentMethod?: PaymentMethod
  discount?: number
}

export const tableKeys = {
  all: ['tables'] as const,
  detail: (id: string) => ['tables', id] as const,
  orders: (id: string) => ['tables', id, 'orders'] as const,
}
