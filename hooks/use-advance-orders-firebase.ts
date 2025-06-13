"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, addDoc, deleteDoc, doc, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "../lib/firebase"
import type { AdvanceOrder, AdvanceOrderSortField, SortDirection } from "../types"

export function useAdvanceOrdersFirebase() {
  const [advanceOrders, setAdvanceOrders] = useState<AdvanceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<AdvanceOrderSortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 30

  // Fetch advance orders from Firestore
  useEffect(() => {
    const advanceOrdersCollection = collection(db, "advanceOrders")

    const unsubscribe = onSnapshot(
      advanceOrdersCollection,
      (snapshot) => {
        const advanceOrdersData = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: Number(data.id) || 0,
            orderId: String(data.orderId || ""),
            shopId: String(data.shopId || ""),
            requestType: data.requestType || "System Message",
            message: String(data.message || ""),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            firebaseId: doc.id, // Store the Firestore document ID
          } as AdvanceOrder & { firebaseId: string }
        })
        setAdvanceOrders(advanceOrdersData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching advance orders:", err)
        setError("Failed to load advance orders. Please try again later.")
        setLoading(false)
      },
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const filteredAndSortedAdvanceOrders = useMemo(() => {
    const filtered = advanceOrders.filter((order) => {
      const orderIdLower = String(order.orderId || "").toLowerCase()
      const shopIdLower = String(order.shopId || "").toLowerCase()
      const messageLower = String(order.message || "").toLowerCase()
      const searchTermLower = String(searchTerm || "").toLowerCase()

      const matchesSearch =
        orderIdLower.includes(searchTermLower) ||
        shopIdLower.includes(searchTermLower) ||
        messageLower.includes(searchTermLower)

      const matchesRequestType =
        !requestTypeFilter || requestTypeFilter === "all" || order.requestType === requestTypeFilter

      return matchesSearch && matchesRequestType
    })

    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle undefined values and convert to appropriate types
      if (aValue === undefined || aValue === null) aValue = ""
      if (bValue === undefined || bValue === null) bValue = ""

      if (sortField === "orderId" || sortField === "shopId") {
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()
      } else if (sortField === "createdAt") {
        aValue = aValue instanceof Date ? aValue.getTime() : 0
        bValue = bValue instanceof Date ? bValue.getTime() : 0
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [advanceOrders, searchTerm, requestTypeFilter, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedAdvanceOrders.length / itemsPerPage)
  const paginatedAdvanceOrders = filteredAndSortedAdvanceOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handleSort = (field: AdvanceOrderSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Add a new advance order to Firestore
  const addAdvanceOrder = async (orderData: Omit<AdvanceOrder, "id" | "createdAt">) => {
    try {
      const advanceOrdersCollection = collection(db, "advanceOrders")

      // Get the highest ID to ensure uniqueness
      const maxId = advanceOrders.length > 0 ? Math.max(...advanceOrders.map((order) => order.id)) : 0
      const newId = maxId + 1

      const newAdvanceOrder = {
        ...orderData,
        id: newId,
        orderId: String(orderData.orderId || ""),
        shopId: String(orderData.shopId || ""),
        requestType: orderData.requestType || "System Message",
        message: String(orderData.message || ""),
        createdAt: Timestamp.now(),
      }

      await addDoc(advanceOrdersCollection, newAdvanceOrder)
      return true
    } catch (err) {
      console.error("Error adding advance order:", err)
      setError("Failed to add advance order. Please try again.")
      return false
    }
  }

  // Delete an advance order from Firestore
  const deleteAdvanceOrder = async (orderId: string) => {
    try {
      const orderToDelete = advanceOrders.find((order) => order.orderId === orderId)

      if (!orderToDelete || !(orderToDelete as any).firebaseId) {
        throw new Error("Advance order not found")
      }

      const orderRef = doc(db, "advanceOrders", (orderToDelete as any).firebaseId)
      await deleteDoc(orderRef)
      return true
    } catch (err) {
      console.error("Error deleting advance order:", err)
      setError("Failed to delete advance order. Please try again.")
      return false
    }
  }

  return {
    advanceOrders,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    requestTypeFilter,
    setRequestTypeFilter,
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredAndSortedAdvanceOrders,
    paginatedAdvanceOrders,
    totalPages,
    addAdvanceOrder,
    deleteAdvanceOrder,
  }
}
