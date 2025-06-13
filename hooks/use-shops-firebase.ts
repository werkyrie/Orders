"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, addDoc, updateDoc, deleteDoc, doc, writeBatch, onSnapshot } from "firebase/firestore"
import { db } from "../lib/firebase"
import type { Shop, SortField, SortDirection } from "../types"

export function useShopsFirebase() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tagFilters, setTagFilters] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>("clientName")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [selectedShops, setSelectedShops] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 30

  // Fetch shops from Firestore
  useEffect(() => {
    const shopsCollection = collection(db, "shops")

    const unsubscribe = onSnapshot(
      shopsCollection,
      (snapshot) => {
        const shopsData = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: Number(data.id) || 0,
            shopId: String(data.shopId || ""),
            clientName: String(data.clientName || ""),
            status: data.status || "Active",
            tags: Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : [],
            creditScore: Number(data.creditScore) || 0,
            balance: Number(data.balance) || 0,
            firebaseId: doc.id, // Store the Firestore document ID
          } as Shop & { firebaseId: string }
        })
        setShops(shopsData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching shops:", err)
        setError("Failed to load shops. Please try again later.")
        setLoading(false)
      },
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const filteredAndSortedShops = useMemo(() => {
    const filtered = shops.filter((shop) => {
      // Safe string operations with explicit string conversion
      const shopIdLower = String(shop.shopId || "").toLowerCase()
      const clientNameLower = String(shop.clientName || "").toLowerCase()
      const searchTermLower = String(searchTerm || "").toLowerCase()

      const matchesSearch =
        shopIdLower.includes(searchTermLower) ||
        clientNameLower.includes(searchTermLower) ||
        (Array.isArray(shop.tags) &&
          shop.tags.some((tag) =>
            String(tag || "")
              .toLowerCase()
              .includes(searchTermLower),
          ))

      const matchesStatus = !statusFilter || statusFilter === "all" || shop.status === statusFilter
      const matchesTags =
        tagFilters.length === 0 || tagFilters.some((tag) => Array.isArray(shop.tags) && shop.tags.includes(tag))

      return matchesSearch && matchesStatus && matchesTags
    })

    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle undefined values and convert to appropriate types
      if (aValue === undefined || aValue === null) aValue = ""
      if (bValue === undefined || bValue === null) bValue = ""

      if (sortField === "clientName") {
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()
      } else if (sortField === "creditScore" || sortField === "balance") {
        aValue = Number(aValue) || 0
        bValue = Number(bValue) || 0
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [shops, searchTerm, statusFilter, tagFilters, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedShops.length / itemsPerPage)
  const paginatedShops = filteredAndSortedShops.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSelectShop = (shopId: number, checked: boolean) => {
    if (checked) {
      setSelectedShops([...selectedShops, shopId])
    } else {
      setSelectedShops(selectedShops.filter((id) => id !== shopId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedShops(paginatedShops.map((shop) => shop.id))
    } else {
      setSelectedShops([])
    }
  }

  // Add a new shop to Firestore
  const addShop = async (shopData: Omit<Shop, "id">) => {
    try {
      const shopsCollection = collection(db, "shops")

      // Get the highest ID to ensure uniqueness
      const maxId = shops.length > 0 ? Math.max(...shops.map((shop) => shop.id)) : 0
      const newId = maxId + 1

      const newShop = {
        ...shopData,
        id: newId,
        shopId: String(shopData.shopId || ""),
        clientName: String(shopData.clientName || ""),
        status: shopData.status || "Active",
        tags: Array.isArray(shopData.tags) ? shopData.tags.map((tag) => String(tag)) : [],
        creditScore: Number(shopData.creditScore) || 0,
        balance: Number(shopData.balance) || 0,
      }

      await addDoc(shopsCollection, newShop)
      return true
    } catch (err) {
      console.error("Error adding shop:", err)
      setError("Failed to add shop. Please try again.")
      return false
    }
  }

  // Add multiple shops to Firestore (for import functionality)
  const addBulkShops = async (shopsData: Array<Omit<Shop, "id">>) => {
    try {
      const batch = writeBatch(db)
      const shopsCollection = collection(db, "shops")

      // Get the highest ID to ensure uniqueness
      const maxId = shops.length > 0 ? Math.max(...shops.map((shop) => shop.id)) : 0

      shopsData.forEach((shopData, index) => {
        const newShopRef = doc(shopsCollection)
        const newShop = {
          ...shopData,
          id: maxId + index + 1,
          shopId: String(shopData.shopId || ""),
          clientName: String(shopData.clientName || ""),
          status: shopData.status || "Active",
          tags: Array.isArray(shopData.tags) ? shopData.tags.map((tag) => String(tag)) : [],
          creditScore: Number(shopData.creditScore) || 0,
          balance: Number(shopData.balance) || 0,
        }

        batch.set(newShopRef, newShop)
      })

      await batch.commit()
      return true
    } catch (err) {
      console.error("Error adding bulk shops:", err)
      setError("Failed to import shops. Please try again.")
      return false
    }
  }

  // Update a shop in Firestore
  const updateShop = async (shopId: number, shopData: Partial<Shop>) => {
    try {
      const shopToUpdate = shops.find((shop) => shop.id === shopId)

      if (!shopToUpdate || !(shopToUpdate as any).firebaseId) {
        throw new Error("Shop not found")
      }

      const shopRef = doc(db, "shops", (shopToUpdate as any).firebaseId)
      await updateDoc(shopRef, shopData)
      return true
    } catch (err) {
      console.error("Error updating shop:", err)
      setError("Failed to update shop. Please try again.")
      return false
    }
  }

  // Delete a shop from Firestore
  const deleteShop = async (shopId: number) => {
    try {
      const shopToDelete = shops.find((shop) => shop.id === shopId)

      if (!shopToDelete || !(shopToDelete as any).firebaseId) {
        throw new Error("Shop not found")
      }

      const shopRef = doc(db, "shops", (shopToDelete as any).firebaseId)
      await deleteDoc(shopRef)
      return true
    } catch (err) {
      console.error("Error deleting shop:", err)
      setError("Failed to delete shop. Please try again.")
      return false
    }
  }

  // Bulk delete shops
  const handleBulkDelete = async () => {
    try {
      const batch = writeBatch(db)

      for (const shopId of selectedShops) {
        const shopToDelete = shops.find((shop) => shop.id === shopId)

        if (shopToDelete && (shopToDelete as any).firebaseId) {
          const shopRef = doc(db, "shops", (shopToDelete as any).firebaseId)
          batch.delete(shopRef)
        }
      }

      await batch.commit()
      setSelectedShops([])
      return true
    } catch (err) {
      console.error("Error bulk deleting shops:", err)
      setError("Failed to delete selected shops. Please try again.")
      return false
    }
  }

  // Bulk update shop status
  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const batch = writeBatch(db)

      for (const shopId of selectedShops) {
        const shopToUpdate = shops.find((shop) => shop.id === shopId)

        if (shopToUpdate && (shopToUpdate as any).firebaseId) {
          const shopRef = doc(db, "shops", (shopToUpdate as any).firebaseId)
          batch.update(shopRef, { status: newStatus })
        }
      }

      await batch.commit()
      setSelectedShops([])
      return true
    } catch (err) {
      console.error("Error bulk updating shop status:", err)
      setError("Failed to update status for selected shops. Please try again.")
      return false
    }
  }

  // Batch update shop balances
  const updateShopBalances = async (updatedBalances: { [shopId: number]: number }) => {
    try {
      const batch = writeBatch(db)

      for (const [shopIdStr, balance] of Object.entries(updatedBalances)) {
        const shopId = Number.parseInt(shopIdStr)
        const shopToUpdate = shops.find((shop) => shop.id === shopId)

        if (shopToUpdate && (shopToUpdate as any).firebaseId) {
          const shopRef = doc(db, "shops", (shopToUpdate as any).firebaseId)
          batch.update(shopRef, { balance })
        }
      }

      await batch.commit()
      return true
    } catch (err) {
      console.error("Error updating shop balances:", err)
      setError("Failed to update balances. Please try again.")
      return false
    }
  }

  // Batch update shop credit scores
  const updateShopCreditScores = async (updatedCreditScores: { [shopId: number]: number }) => {
    try {
      const batch = writeBatch(db)

      for (const [shopIdStr, creditScore] of Object.entries(updatedCreditScores)) {
        const shopId = Number.parseInt(shopIdStr)
        const shopToUpdate = shops.find((shop) => shop.id === shopId)

        if (shopToUpdate && (shopToUpdate as any).firebaseId) {
          const shopRef = doc(db, "shops", (shopToUpdate as any).firebaseId)
          batch.update(shopRef, { creditScore })
        }
      }

      await batch.commit()
      return true
    } catch (err) {
      console.error("Error updating shop credit scores:", err)
      setError("Failed to update credit scores. Please try again.")
      return false
    }
  }

  // Batch update shop tags
  const updateShopTags = async (updatedTags: { [shopId: number]: string[] }) => {
    try {
      const batch = writeBatch(db)

      for (const [shopIdStr, tags] of Object.entries(updatedTags)) {
        const shopId = Number.parseInt(shopIdStr)
        const shopToUpdate = shops.find((shop) => shop.id === shopId)

        if (shopToUpdate && (shopToUpdate as any).firebaseId) {
          const shopRef = doc(db, "shops", (shopToUpdate as any).firebaseId)
          batch.update(shopRef, { tags })
        }
      }

      await batch.commit()
      return true
    } catch (err) {
      console.error("Error updating shop tags:", err)
      setError("Failed to update tags. Please try again.")
      return false
    }
  }

  return {
    shops,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    tagFilters,
    setTagFilters,
    sortField,
    sortDirection,
    handleSort,
    selectedShops,
    handleSelectShop,
    handleSelectAll,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredAndSortedShops,
    paginatedShops,
    totalPages,
    addShop,
    addBulkShops,
    updateShop,
    deleteShop,
    handleBulkDelete,
    handleBulkStatusUpdate,
    updateShopBalances,
    updateShopCreditScores,
    updateShopTags,
  }
}
