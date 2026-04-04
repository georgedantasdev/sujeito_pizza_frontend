export type OrderStatus = 'OPEN' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX'

export interface OrderItem {
  id: string
  quantity: number
  price: string
  note: string | null
  product: { id: string; name: string }
  size: { id: string; name: string; price: string } | null
  flavor: { id: string; name: string } | null
}

export interface Order {
  id: string
  status: OrderStatus
  totalPrice: string
  discount: string
  note: string | null
  paid: boolean
  paidAt: string | null
  paymentMethod: PaymentMethod | null
  table: { id: string; number: number }
  user: { id: string; name: string }
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateOrderData {
  tableId: string
  note?: string
}

export interface UpdateOrderStatusData {
  status: OrderStatus
}

export interface ProcessPaymentData {
  paymentMethod: PaymentMethod
  discount?: string
}

export const orderKeys = {
  all: ['orders'] as const,
  filtered: (status?: OrderStatus) => ['orders', { status }] as const,
  detail: (id: string) => ['orders', id] as const,
}
