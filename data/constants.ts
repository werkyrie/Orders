import type { Shop, Order } from "../types"

export const statusOptions = ["Active", "On Hold", "Inactive"] as const
export const tagOptions = [
  "New Shop",
  "With Loan",
  "Frozen",
  "Hold Withdrawal",
  "No Product",
  "Old Client",
  "VIP",
] as const
export const locationOptions = [
  "Albania",
  "Argentina",
  "Australia",
  "Canada",
  "France",
  "Germany",
  "Italy",
  "Japan",
  "Malaysia",
  "Netherlands",
  "Philippines",
  "Russia",
  "Singapore",
  "South Korea",
  "Spain",
  "Switzerland",
  "Thailand",
  "Turkey",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Vietnam",
  "China",
] as const

export const initialShops: Shop[] = [
  {
    id: 1,
    shopId: "SH001",
    clientName: "John's Electronics",
    status: "Active",
    tags: ["New Shop", "VIP"],
    creditScore: 85,
    balance: 15000.5,
  },
  {
    id: 2,
    shopId: "SH002",
    clientName: "Mary's Boutique",
    status: "On Hold",
    tags: ["With Loan", "Old Client"],
    creditScore: 72,
    balance: -2500.0,
  },
  {
    id: 3,
    shopId: "SH003",
    clientName: "Tech Solutions Inc",
    status: "Active",
    tags: ["VIP", "No Product"],
    creditScore: 78,
    balance: 8750.25,
  },
  {
    id: 4,
    shopId: "SH004",
    clientName: "Corner Store",
    status: "Inactive",
    tags: ["Frozen", "Old Client"],
    creditScore: 65,
    balance: 0.0,
  },
  {
    id: 5,
    shopId: "SH005",
    clientName: "Fashion Forward",
    status: "Active",
    tags: ["New Shop", "With Loan"],
    creditScore: 70,
    balance: 12300.75,
  },
]

export const initialOrders: Order[] = [
  {
    id: 1,
    shopId: "SH001",
    clientName: "John's Electronics",
    amount: 1200.5,
    location: "United States",
    createdAt: new Date(2023, 5, 15, 9, 30),
  },
  {
    id: 2,
    shopId: "SH003",
    clientName: "Tech Solutions Inc",
    amount: 3500.0,
    location: "Canada",
    createdAt: new Date(2023, 5, 18, 14, 45),
  },
  {
    id: 3,
    shopId: "SH002",
    clientName: "Mary's Boutique",
    amount: 750.25,
    location: "United Kingdom",
    createdAt: new Date(2023, 5, 20, 11, 15),
  },
  {
    id: 4,
    shopId: "SH005",
    clientName: "Fashion Forward",
    amount: 2100.0,
    location: "France",
    createdAt: new Date(2023, 5, 10, 16, 20),
  },
]

export const exportFormats = [
  { label: "CSV", value: "csv" },
  { label: "Excel", value: "excel" },
  { label: "JSON", value: "json" },
]

export const exportScopes = [
  { label: "All Data", value: "all" },
  { label: "Filtered Data", value: "filtered" },
  { label: "Selected Rows", value: "selected" },
]

export const exportColumns = [
  { label: "Shop ID", key: "shopId" },
  { label: "Client Name", key: "clientName" },
  { label: "Status", key: "status" },
  { label: "Tags", key: "tags" },
  { label: "Credit Score", key: "creditScore" },
  { label: "Balance", key: "balance" },
]

export const orderExportColumns = [
  { label: "Order ID", key: "id" },
  { label: "Shop ID", key: "shopId" },
  { label: "Client Name", key: "clientName" },
  { label: "Amount", key: "amount" },
  { label: "Location", key: "location" },
  { label: "Date", key: "createdAt" },
]
