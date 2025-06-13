"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, addDoc, deleteDoc, doc, writeBatch, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "../lib/firebase"
import type { Order, OrderSortField, SortDirection } from "../types"

export function useOrdersFirebase() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderSearchTerm, setOrderSearchTerm] = useState("")
  const [orderLocationFilter, setOrderLocationFilter] = useState<string>("all")
  const [orderSortField, setOrderSortField] = useState<OrderSortField>("createdAt")
  const [orderSortDirection, setOrderSortDirection] = useState<SortDirection>("desc")
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])
  const [orderCurrentPage, setOrderCurrentPage] = useState(1)
  const orderItemsPerPage = 30

  // Fetch orders from Firestore
  useEffect(() => {
    const ordersCollection = collection(db, "orders")

    const unsubscribe = onSnapshot(
      ordersCollection,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: Number(data.id) || 0,
            shopId: String(data.shopId || ""),
            clientName: String(data.clientName || ""),
            amount: Number(data.amount) || 0,
            location: String(data.location || ""),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(), // Convert Firestore Timestamp to Date
            firebaseId: doc.id, // Store the Firestore document ID
          } as Order & { firebaseId: string }
        })
        setOrders(ordersData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching orders:", err)
        setError("Failed to load orders. Please try again later.")
        setLoading(false)
      },
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      // Safe string operations with explicit string conversion
      const shopIdLower = String(order.shopId || "").toLowerCase()
      const clientNameLower = String(order.clientName || "").toLowerCase()
      const locationLower = String(order.location || "").toLowerCase()
      const searchTermLower = String(orderSearchTerm || "").toLowerCase()

      const matchesSearch =
        shopIdLower.includes(searchTermLower) ||
        clientNameLower.includes(searchTermLower) ||
        locationLower.includes(searchTermLower)

      const matchesLocation =
        !orderLocationFilter || orderLocationFilter === "all" || order.location === orderLocationFilter

      return matchesSearch && matchesLocation
    })

    filtered.sort((a, b) => {
      let aValue: any = a[orderSortField]
      let bValue: any = b[orderSortField]

      // Handle undefined values and convert to appropriate types
      if (aValue === undefined || aValue === null) aValue = ""
      if (bValue === undefined || bValue === null) bValue = ""

      if (orderSortField === "clientName") {
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()
      } else if (orderSortField === "amount") {
        aValue = Number(aValue) || 0
        bValue = Number(bValue) || 0
      } else if (orderSortField === "createdAt") {
        aValue = aValue instanceof Date ? aValue.getTime() : 0
        bValue = bValue instanceof Date ? bValue.getTime() : 0
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

  // Add a new order to Firestore
  const addOrder = async (orderData: Omit<Order, "id" | "createdAt">) => {
    try {
      const ordersCollection = collection(db, "orders")

      // Get the highest ID to ensure uniqueness
      const maxId = orders.length > 0 ? Math.max(...orders.map((order) => order.id)) : 0
      const newId = maxId + 1

      const newOrder = {
        ...orderData,
        id: newId,
        shopId: String(orderData.shopId || ""),
        clientName: String(orderData.clientName || ""),
        amount: Number(orderData.amount) || 0,
        location: String(orderData.location || ""),
        createdAt: Timestamp.now(),
      }

      await addDoc(ordersCollection, newOrder)
      return true
    } catch (err) {
      console.error("Error adding order:", err)
      setError("Failed to add order. Please try again.")
      return false
    }
  }

  // Add multiple orders to Firestore
  const addBulkOrders = async (ordersData: Array<Omit<Order, "id" | "createdAt">>) => {
    try {
      const batch = writeBatch(db)
      const ordersCollection = collection(db, "orders")

      // Get the highest ID to ensure uniqueness
      const maxId = orders.length > 0 ? Math.max(...orders.map((order) => order.id)) : 0

      ordersData.forEach((orderData, index) => {
        const newOrderRef = doc(ordersCollection)
        const newOrder = {
          ...orderData,
          id: maxId + index + 1,
          shopId: String(orderData.shopId || ""),
          clientName: String(orderData.clientName || ""),
          amount: Number(orderData.amount) || 0,
          location: String(orderData.location || ""),
          createdAt: Timestamp.now(),
        }

        batch.set(newOrderRef, newOrder)
      })

      await batch.commit()
      return true
    } catch (err) {
      console.error("Error adding bulk orders:", err)
      setError("Failed to add orders. Please try again.")
      return false
    }
  }

  // Delete an order from Firestore
  const deleteOrder = async (orderId: number) => {
    try {
      const orderToDelete = orders.find((order) => order.id === orderId)

      if (!orderToDelete || !(orderToDelete as any).firebaseId) {
        throw new Error("Order not found")
      }

      const orderRef = doc(db, "orders", (orderToDelete as any).firebaseId)
      await deleteDoc(orderRef)
      return true
    } catch (err) {
      console.error("Error deleting order:", err)
      setError("Failed to delete order. Please try again.")
      return false
    }
  }

  // Bulk delete orders
  const handleBulkOrderDelete = async () => {
    try {
      const batch = writeBatch(db)

      for (const orderId of selectedOrders) {
        const orderToDelete = orders.find((order) => order.id === orderId)

        if (orderToDelete && (orderToDelete as any).firebaseId) {
          const orderRef = doc(db, "orders", (orderToDelete as any).firebaseId)
          batch.delete(orderRef)
        }
      }

      await batch.commit()
      setSelectedOrders([])
      return true
    } catch (err) {
      console.error("Error bulk deleting orders:", err)
      setError("Failed to delete selected orders. Please try again.")
      return false
    }
  }

  return {
    orders,
    loading,
    error,
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
    addOrder,
    addBulkOrders,
    deleteOrder,
    handleBulkOrderDelete,
  }
}
