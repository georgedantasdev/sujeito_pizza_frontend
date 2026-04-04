export interface Table {
  id: string
  number: number
  pizzeriaId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTableData {
  number: number
}

export const tableKeys = {
  all: ['tables'] as const,
}
