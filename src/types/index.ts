// ─── API wrapper ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  message: string
  data: T
}

// ─── Pizzeria ────────────────────────────────────────────────────────
export interface Pizzeria {
  id: string
  name: string
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

// ─── User ────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'EMPLOYEE'
  createdAt: string
}

export interface CreateAdminData {
  name: string
  email: string
  password: string
  pizzeriaId: string
}
