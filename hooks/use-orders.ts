"use client"

import { useState, useMemo } from "react"
import type { Order, OrderSortField, SortDirection } from "../types"
import { initialOrders } from "../data/constants"

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [orderSearchTerm, setOrderSearchTerm] = useState("")
  const [orderLocationFilter, setOrderLocationFilter] = useState<string>("all")
  const [orderSortField, setOrderSortField] = useState<OrderSortField>("createdAt")
  const [orderSortDirection, setOrderSortDirection] = useState<SortDirection>("desc")
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])
  const [orderCurrentPage, setOrderCurrentPage] = useState(1)
  const orderItemsPerPage = 10

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch =
        order.shopId.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.clientName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.location.toLowerCase().includes(orderSearchTerm.toLowerCase())

      const matchesLocation =
        !orderLocationFilter || orderLocationFilter === "all" || order.location === orderLocationFilter

      return matchesSearch && matchesLocation
    })

    filtered.sort((a, b) => {
      let aValue: any = a[orderSortField]
      let bValue: any = b[orderSortField]

      if (orderSortField === "clientName") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return orderSortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return orderSortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [orders, orderSearchTerm, orderLocationFilter, orderSortField, orderSortDirection])

  const orderTotalPages = Math.ceil(filteredAndSortedOrders.length / orderItemsPerPage)
  const paginatedOrders = filteredAndSortedOrders.slice(
    (orderCurrentPage - 1) * orderItemsPerPage,
    orderCurrentPage * orderItemsPerPage,
  )

  const handleOrderSort = (field: OrderSortField) => {
    if (orderSortField === field) {
      setOrderSortDirection(orderSortDirection === "asc" ? "desc" : "asc")
    } else {
      setOrderSortField(field)
      setOrderSortDirection("asc")
    }
  }

  const handleSelectOrder = (orderId: number, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId])
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId))
    }
  }

  const handleSelectAllOrders = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(paginatedOrders.map((order) => order.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleBulkOrderDelete = () => {
    setOrders(orders.filter((order) => !selectedOrders.includes(order.id)))
    setSelectedOrders([])
  }

  return {
    orders,
    setOrders,
    orderSearchTerm,
    setOrderSearchTerm,
    orderLocationFilter,
    setOrderLocationFilter,
    orderSortField,
    orderSortDirection,
    handleOrderSort,
    selectedOrders,
    handleSelectOrder,
    handleSelectAllOrders,
    orderCurrentPage,
    setOrderCurrentPage,
    orderItemsPerPage,
    filteredAndSortedOrders,
    paginatedOrders,
    orderTotalPages,
    handleBulkOrderDelete,
  }
}
