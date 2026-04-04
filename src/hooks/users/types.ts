export interface User {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE'
  createdAt: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'EMPLOYEE'
  createdAt: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'EMPLOYEE'
}

export interface CreateAdminData {
  name: string
  email: string
  password: string
  pizzeriaId: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
}

export const userKeys = {
  all: ['users'] as const,
}
