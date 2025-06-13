import type { Shop, Order, ExportSettings, OrderExportSettings } from "../types"
import { exportColumns, orderExportColumns } from "../data/constants"

export function exportToCSV(data: any[], columns: string[], filename: string, columnMap: any[]) {
  const headers = columns.map((column) => columnMap.find((c) => c.key === column)?.label || column)
  const csvContent = [
    headers.join(","),
    ...data.map((item) =>
      columns
        .map((column) => {
          let value = item[column]
          if (Array.isArray(value)) {
            value = value.join("; ")
          }
          if (typeof value === "string" && value.includes(",")) {
            value = `"${value}"`
          }
          return value
        })
        .join(","),
    ),
  ].join("\n")

  downloadFile(csvContent, `${filename}.csv`, "text/csv")
}

export function exportToJSON(data: any[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, `${filename}.json`, "application/json")
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export function getFilteredShopsForExport(
  shops: Shop[],
  filteredShops: Shop[],
  selectedShops: number[],
  exportSettings: ExportSettings,
): Shop[] {
  let dataToExport: Shop[] = []

  if (exportSettings.scope === "all") {
    dataToExport = shops
  } else if (exportSettings.scope === "filtered") {
    dataToExport = filteredShops
  } else if (exportSettings.scope === "selected") {
    dataToExport = shops.filter((shop) => selectedShops.includes(shop.id))
  }

  // Apply additional filters
  dataToExport = dataToExport.filter((shop) => {
    if (exportSettings.filters.status !== "all" && shop.status !== exportSettings.filters.status) {
      return false
    }

    if (
      exportSettings.filters.tags.length > 0 &&
      !exportSettings.filters.tags.every((tag) => shop.tags.includes(tag))
    ) {
      return false
    }

    if (
      shop.creditScore < exportSettings.filters.creditScoreMin ||
      shop.creditScore > exportSettings.filters.creditScoreMax
    ) {
      return false
    }

    if (exportSettings.filters.balanceMin !== undefined && shop.balance < exportSettings.filters.balanceMin) {
      return false
    }

    if (exportSettings.filters.balanceMax !== undefined && shop.balance > exportSettings.filters.balanceMax) {
      return false
    }

    return true
  })

  return dataToExport
}

export function getFilteredOrdersForExport(
  orders: Order[],
  filteredOrders: Order[],
  selectedOrders: number[],
  exportSettings: OrderExportSettings,
): Order[] {
  let dataToExport: Order[] = []

  if (exportSettings.scope === "all") {
    dataToExport = orders
  } else if (exportSettings.scope === "filtered") {
    dataToExport = filteredOrders
  } else if (exportSettings.scope === "selected") {
    dataToExport = orders.filter((order) => selectedOrders.includes(order.id))
  }

  // Apply additional filters
  dataToExport = dataToExport.filter((order) => {
    if (exportSettings.filters.location !== "all" && order.location !== exportSettings.filters.location) {
      return false
    }

    if (exportSettings.filters.dateFrom !== undefined && order.createdAt < exportSettings.filters.dateFrom) {
      return false
    }

    if (exportSettings.filters.dateTo !== undefined && order.createdAt > exportSettings.filters.dateTo) {
      return false
    }

    if (exportSettings.filters.amountMin !== undefined && order.amount < exportSettings.filters.amountMin) {
      return false
    }

    if (exportSettings.filters.amountMax !== undefined && order.amount > exportSettings.filters.amountMax) {
      return false
    }

    return true
  })

  return dataToExport
}

export function handleShopExport(
  shops: Shop[],
  filteredShops: Shop[],
  selectedShops: number[],
  exportSettings: ExportSettings,
) {
  const dataToExport = getFilteredShopsForExport(shops, filteredShops, selectedShops, exportSettings)

  // Map columns
  const mappedData = dataToExport.map((item) => {
    const mappedItem: { [key: string]: any } = {}
    exportSettings.columns.forEach((column) => {
      mappedItem[column] = item[column as keyof Shop]
    })
    return mappedItem
  })

  if (exportSettings.format === "csv") {
    exportToCSV(mappedData, exportSettings.columns, "shops", exportColumns)
  } else if (exportSettings.format === "json") {
    exportToJSON(mappedData, "shops")
  } else if (exportSettings.format === "excel") {
    alert("Excel export requires additional library integration (xlsx)")
  }
}

export function handleOrderExport(
  orders: Order[],
  filteredOrders: Order[],
  selectedOrders: number[],
  exportSettings: OrderExportSettings,
) {
  const dataToExport = getFilteredOrdersForExport(orders, filteredOrders, selectedOrders, exportSettings)

  // Map columns and format dates
  const mappedData = dataToExport.map((item) => {
    const mappedItem: { [key: string]: any } = {}
    exportSettings.columns.forEach((column) => {
      if (column === "createdAt") {
        mappedItem[column] = item[column].toLocaleString()
      } else {
        mappedItem[column] = item[column as keyof Order]
      }
    })
    return mappedItem
  })

  if (exportSettings.format === "csv") {
    exportToCSV(mappedData, exportSettings.columns, "orders", orderExportColumns)
  } else if (exportSettings.format === "json") {
    exportToJSON(mappedData, "orders")
  } else if (exportSettings.format === "excel") {
    alert("Excel export requires additional library integration (xlsx)")
  }
}
