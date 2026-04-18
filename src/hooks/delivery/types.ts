export type DeliveryStatus = 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX'

export interface DeliveryItem {
  id: string
  quantity: number
  price: string
  note: string | null
  product: { id: string; name: string }
  size: { id: string; name: string; price: string } | null
  flavor: { id: string; name: string } | null
}

export interface Delivery {
  id: string
  customerName: string
  status: DeliveryStatus
  totalPrice: string
  paymentMethod: PaymentMethod | null
  discount: string
  paidAt: string | null
  note: string | null
  user: { id: string; name: string }
  items: DeliveryItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateDeliveryData {
  customerName: string
  note?: string
}

export interface AddDeliveryItemData {
  productId: string
  sizeId: string
  flavorId?: string
  quantity: number
  note?: string
}

export interface UpdateDeliveryStatusData {
  status: DeliveryStatus
}

export interface ProcessDeliveryPaymentData {
  paymentMethod: PaymentMethod
  discount?: string
}

export const deliveryKeys = {
  all: ['deliveries'] as const,
  filtered: (status?: DeliveryStatus) => ['deliveries', { status }] as const,
  detail: (id: string) => ['deliveries', id] as const,
}
