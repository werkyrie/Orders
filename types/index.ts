export interface Shop {
  id: number
  shopId: string
  clientName: string
  status: "Active" | "On Hold" | "Inactive"
  tags: string[]
  creditScore: number
  balance: number
  firebaseId?: string // Optional Firebase document ID
}

export interface Order {
  id: number
  shopId: string
  clientName: string
  amount: number
  location: string
  createdAt: Date
  firebaseId?: string // Optional Firebase document ID
}

export interface AdvanceOrder {
  id: number
  orderId: string
  shopId: string
  requestType: "System Message" | "Buyer Inquiry"
  message: string
  createdAt: Date
  firebaseId?: string // Optional Firebase document ID
}

export interface BulkOrderRow {
  id: number
  shopId: string
  amount: number | ""
  location: string
  clientInfo?: Shop | null
  isLoading?: boolean
  error?: string
}

export type SortField = "clientName" | "creditScore" | "balance"
export type SortDirection = "asc" | "desc"
export type OrderSortField = "clientName" | "amount" | "createdAt"
export type AdvanceOrderSortField = "orderId" | "shopId" | "requestType" | "createdAt"

export interface ExportSettings {
  format: string
  scope: string
  columns: string[]
  filters: {
    status: string
    tags: string[]
    creditScoreMin: number
    creditScoreMax: number
    balanceMin?: number
    balanceMax?: number
  }
}

export interface OrderExportSettings {
  format: string
  scope: string
  columns: string[]
  filters: {
    location: string
    dateFrom?: Date
    dateTo?: Date
    amountMin?: number
    amountMax?: number
  }
}
