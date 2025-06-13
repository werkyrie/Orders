"use client"

import { useState, useMemo } from "react"
import type { Shop, SortField, SortDirection } from "../types"
import { initialShops } from "../data/constants"

export function useShops() {
  const [shops, setShops] = useState<Shop[]>(initialShops)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tagFilters, setTagFilters] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>("clientName")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [selectedShops, setSelectedShops] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 30

  const filteredAndSortedShops = useMemo(() => {
    const filtered = shops.filter((shop) => {
      const matchesSearch =
        shop.shopId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = !statusFilter || statusFilter === "all" || shop.status === statusFilter
      const matchesTags = tagFilters.length === 0 || tagFilters.some((tag) => shop.tags.includes(tag))

      return matchesSearch && matchesStatus && matchesTags
    })

    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === "clientName") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
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

  const handleBulkDelete = () => {
    setShops(shops.filter((shop) => !selectedShops.includes(shop.id)))
    setSelectedShops([])
  }

  const handleBulkStatusUpdate = (newStatus: string) => {
    setShops(
      shops.map((shop) => (selectedShops.includes(shop.id) ? { ...shop, status: newStatus as Shop["status"] } : shop)),
    )
    setSelectedShops([])
  }

  return {
    shops,
    setShops,
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
    handleBulkDelete,
    handleBulkStatusUpdate,
  }
}
