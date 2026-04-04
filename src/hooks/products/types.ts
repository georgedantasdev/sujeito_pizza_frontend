export interface ProductSize {
  id: string
  name: string
  price: string
  productId: string
}

export interface ProductFlavor {
  id: string
  name: string
  productId: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  available: boolean
  sizes: ProductSize[]
  flavors: ProductFlavor[]
  createdAt: string
  updatedAt: string
}

export interface CreateProductData {
  name: string
  description?: string
  imageUrl?: string
  sizes: { name: string; price: string }[]
  flavors: { name: string }[]
}

export interface UpdateProductData {
  name?: string
  description?: string
  imageUrl?: string
  available?: boolean
}

export const productKeys = {
  all: ['products'] as const,
  detail: (id: string) => ['products', id] as const,
}
