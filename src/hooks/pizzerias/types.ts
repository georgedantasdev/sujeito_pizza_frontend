export interface Pizzeria {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePizzeriaData {
  name: string
  document: string
  admin: {
    name: string
    email: string
    password: string
  }
}

export interface UpdatePizzeriaData {
  name?: string
}

export const pizzeriaKeys = {
  all: ['pizzerias'] as const,
  detail: (id: string) => ['pizzerias', id] as const,
}
