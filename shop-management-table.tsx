"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  X,
  Package,
  DollarSign,
  Copy,
  Languages,
  Loader2,
  TrendingUp,
  Tags,
  Shield,
  Eye,
} from "lucide-react"
import { ShoppingCart } from "lucide-react"

// Import components
import { ShopsTable } from "./components/tables/shops-table"
import { OrdersTable } from "./components/tables/orders-table"
import { Pagination } from "./components/pagination"
import { ShopFormModal } from "./components/modals/shop-form-modal"
import { ViewOrderModal } from "./components/modals/view-order-modal"
import { BulkOrderModal } from "./components/modals/bulk-order-modal"
import { ShopExportModal } from "./components/modals/shop-export-modal"
import { OrderExportModal } from "./components/modals/order-export-modal"
import { BatchBalanceEditModal } from "./components/modals/batch-balance-edit-modal"
import { ShopImportModal } from "./components/modals/shop-import-modal"
import { ToastProvider } from "./components/ui/toast-provider"
import { BatchCreditScoreEditModal } from "./components/modals/batch-credit-score-edit-modal"
import { BatchTagsEditModal } from "./components/modals/batch-tags-edit-modal"
import { AdvanceOrderForm } from "./components/forms/advance-order-form"
import { Header } from "./components/layout/header"
import { RoleGuard } from "./components/auth/role-guard"

// Import hooks
import { useShopsFirebase } from "./hooks/use-shops-firebase"
import { useOrdersFirebase } from "./hooks/use-orders-firebase"
import { useAuth } from "./hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

// Import types and constants
import type { Shop, Order, BulkOrderRow } from "./types"
import { statusOptions, tagOptions, locationOptions } from "./data/constants"
import {
  handleShopExport,
  handleOrderExport,
  getFilteredShopsForExport,
  getFilteredOrdersForExport,
} from "./utils/export"
import { checkFirebaseConnection } from "./lib/firebase"

export default function ShopManagementTable() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("shops")
  const [firebaseStatus, setFirebaseStatus] = useState<"checking" | "connected" | "error">("checking")

  // Shop management with Firebase
  const {
    shops,
    loading: shopsLoading,
    error: shopsError,
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
  } = useShopsFirebase()

  // Order management with Firebase
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
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
  } = useOrdersFirebase()

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingShop, setEditingShop] = useState<Shop | null>(null)
  const [deletingShop, setDeletingShop] = useState<Shop | null>(null)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [isViewOrderModalOpen, setIsViewOrderModalOpen] = useState(false)
  const [isBatchBalanceEditModalOpen, setIsBatchBalanceEditModalOpen] = useState(false)
  const [isBatchCreditScoreEditModalOpen, setIsBatchCreditScoreEditModalOpen] = useState(false)
  const [isBatchTagsEditModalOpen, setIsBatchTagsEditModalOpen] = useState(false)

  // Import/Export state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportSettings, setExportSettings] = useState({
    format: "csv",
    scope: "all",
    columns: ["shopId", "clientName", "status", "tags", "creditScore", "balance"],
    filters: {
      status: "all",
      tags: [] as string[],
      creditScoreMin: 0,
      creditScoreMax: 100,
      balanceMin: undefined as number | undefined,
      balanceMax: undefined as number | undefined,
    },
  })

  // Order export state
  const [isOrderExportModalOpen, setIsOrderExportModalOpen] = useState(false)
  const [orderExportSettings, setOrderExportSettings] = useState({
    format: "csv",
    scope: "all",
    columns: ["id", "shopId", "clientName", "amount", "location", "createdAt"],
    filters: {
      location: "all",
      dateFrom: undefined as Date | undefined,
      dateTo: undefined as Date | undefined,
      amountMin: undefined as number | undefined,
      amountMax: undefined as number | undefined,
    },
  })

  // Order creation states
  const [isBulkOrderModalOpen, setIsBulkOrderModalOpen] = useState(false)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [bulkOrderRows, setBulkOrderRows] = useState<BulkOrderRow[]>([{ id: 1, shopId: "", amount: "", location: "" }])
  const [showShopIdPicker, setShowShopIdPicker] = useState(false)
  const [selectedShopIds, setSelectedShopIds] = useState<string[]>([])
  const [bulkAmount, setBulkAmount] = useState("")
  const [bulkLocation, setBulkLocation] = useState("")
  const [isPopulating, setIsPopulating] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    shopId: "",
    clientName: "",
    status: "Active" as const,
    tags: [] as string[],
    creditScore: 0,
    balance: 0,
  })

  const { toast } = useToast()

  // Check if user is admin
  const isAdmin = user?.role === "admin"
  const isViewer = user?.role === "viewer"

  // Check Firebase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkFirebaseConnection()
        setFirebaseStatus(isConnected ? "connected" : "error")

        if (isConnected) {
          toast({
            title: "Firebase Connected",
            description: "Successfully connected to Firebase database",
            variant: "default",
          })
        } else {
          toast({
            title: "Firebase Connection Error",
            description: "Failed to connect to Firebase. Please check your configuration.",
            variant: "destructive",
          })
        }
      } catch (error) {
        setFirebaseStatus("error")
        toast({
          title: "Firebase Connection Error",
          description: "Failed to connect to Firebase. Please check your configuration.",
          variant: "destructive",
        })
      }
    }

    checkConnection()
  }, [toast])

  // Add event listener for custom toast events
  useEffect(() => {
    const handleToast = (e: any) => {
      if (e.detail) {
        toast({
          title: e.detail.title,
          description: e.detail.description,
          variant: e.detail.variant,
        })
      }
    }

    document.addEventListener("toast", handleToast)
    return () => {
      document.removeEventListener("toast", handleToast)
    }
  }, [toast])

  // Show error toasts if Firebase operations fail
  useEffect(() => {
    if (shopsError) {
      toast({
        title: "Shops Error",
        description: shopsError,
        variant: "destructive",
      })
    }
  }, [shopsError, toast])

  useEffect(() => {
    if (ordersError) {
      toast({
        title: "Orders Error",
        description: ordersError,
        variant: "destructive",
      })
    }
  }, [ordersError, toast])

  // Show access denied message for viewers trying to access advance orders
  useEffect(() => {
    if (isViewer && activeTab === "advance-order") {
      toast({
        title: "Access Denied",
        description: "Advance Orders are only available to Admin users",
        variant: "destructive",
      })
      setActiveTab("shops")
    }
  }, [activeTab, isViewer, toast])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only Admin users can modify shop data",
        variant: "destructive",
      })
      return
    }

    if (formData.creditScore > 100) {
      toast({
        title: "Validation Error",
        description: "Credit score cannot exceed 100.",
        variant: "destructive",
      })
      return
    }

    if (editingShop) {
      // Update existing shop
      const success = await updateShop(editingShop.id, formData)
      if (success) {
        toast({
          title: "Shop Updated",
          description: `Successfully updated ${formData.clientName}`,
          variant: "default",
        })
        setIsEditModalOpen(false)
      }
    } else {
      // Add new shop
      const success = await addShop(formData)
      if (success) {
        toast({
          title: "Shop Added",
          description: `Successfully added ${formData.clientName}`,
          variant: "default",
        })
        setIsAddModalOpen(false)
      }
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      shopId: "",
      clientName: "",
      status: "Active",
      tags: [],
      creditScore: 0,
      balance: 0,
    })
    setEditingShop(null)
  }

  const handleEdit = (shop: Shop) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only Admin users can edit shops",
        variant: "destructive",
      })
      return
    }

    setEditingShop(shop)
    setFormData({
      shopId: shop.shopId,
      clientName: shop.clientName,
      status: shop.status,
      tags: shop.tags,
      creditScore: shop.creditScore,
      balance: shop.balance,
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (shop: Shop) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only Admin users can delete shops",
        variant: "destructive",
      })
      return
    }

    setDeletingShop(shop)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingShop && isAdmin) {
      const success = await deleteShop(deletingShop.id)
      if (success) {
        toast({
          title: "Shop Deleted",
          description: `Successfully deleted ${deletingShop.clientName}`,
          variant: "default",
        })
      }
      setIsDeleteModalOpen(false)
      setDeletingShop(null)
    }
  }

  const handleViewOrder = (order: Order) => {
    setViewingOrder(order)
    setIsViewOrderModalOpen(true)
  }

  // Handle batch balance edit
  const handleBatchBalanceEdit = () => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only Admin users can edit balances",
        variant: "destructive",
      })
      return
    }
    setIsBatchBalanceEditModalOpen(true)
  }

  const handleBatchBalanceSave = async (updatedBalances: { [shopId: number]: number }) => {
    if (!isAdmin) return

    const success = await updateShopBalances(updatedBalances)

    if (success) {
      toast({
        title: "Balances Updated",
        description: `Successfully updated balances for ${selectedShops.length} shop${selectedShops.length > 1 ? "s" : ""}`,
        variant: "default",
      })

      // Clear selection after update
      handleSelectAll(false)
    }
  }

  // Handle batch credit score edit
  const handleBatchCreditScoreEdit = () => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only Admin users can edit credit scores",
        variant: "destructive",
      })
      return
    }
    setIsBatchCreditScoreEditModalOpen(true)
  }

  const handleBatchCreditScoreSave = async (updatedCreditScores: { [shopId: number]: number }) => {
    if (!isAdmin) return

    const success = await updateShopCreditScores(updatedCreditScores)

    if (success) {
      toast({
        title: "Credit Scores Updated",
        description: `Successfully updated credit scores for ${selectedShops.length} shop${selectedShops.length > 1 ? "s" : ""}`,
        variant: "default",
      })

      // Clear selection after update
      handleSelectAll(false)
    }
  }

  // Handle batch tags edit
  const handleBatchTagsEdit = () => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only Admin users can edit tags",
        variant: "destructive",
      })
      return
    }
    setIsBatchTagsEditModalOpen(true)
  }

  const handleBatchTagsSave = async (updatedTags: { [shopId: number]: string[] }) => {
    if (!isAdmin) return

    const success = await updateShopTags(updatedTags)

    if (success) {
      toast({
        title: "Tags Updated",
        description: `Successfully updated tags for ${selectedShops.length} shop${selectedShops.length > 1 ? "s" : ""}`,
        variant: "default",
      })

      // Clear selection after update
      handleSelectAll(false)
    }
  }

  // Handle shop import
  const handleShopImport = async (shopsToImport: Omit<Shop, "id">[]) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only Admin users can import shops",
        variant: "destructive",
      })
      return
    }

    const success = await addBulkShops(shopsToImport)

    if (success) {
      toast({
        title: "Shops Imported",
        description: `Successfully imported ${shopsToImport.length} shop${shopsToImport.length > 1 ? "s" : ""} to Firebase`,
        variant: "default",
      })
    }
  }

  // Translation function for locations
  const translateLocation = (location: string): string => {
    const locationTranslations: { [key: string]: string } = {
      Albania: "阿尔巴尼亚",
      Argentina: "阿根廷",
      Australia: "澳大利亚",
      Canada: "加拿大",
      France: "法国",
      Germany: "德国",
      Italy: "意大利",
      Japan: "日本",
      Malaysia: "马来西亚",
      Netherlands: "荷兰",
      Philippines: "菲律宾",
      Russia: "俄罗斯",
      Singapore: "新加坡",
      "South Korea": "韩国",
      Spain: "西班牙",
      Switzerland: "瑞士",
      Thailand: "泰国",
      Turkey: "土耳其",
      "United Arab Emirates": "阿拉伯联合酋长国",
      "United Kingdom": "英国",
      "United States": "美国",
      Vietnam: "越南",
      China: "中国",
    }
    return locationTranslations[location] || location
  }

  // Handle copy orders to clipboard (English)
  const handleCopyOrdersToClipboard = async () => {
    const selectedOrdersData = orders.filter((order) => selectedOrders.includes(order.id))

    if (selectedOrdersData.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select orders to copy to clipboard",
        variant: "destructive",
      })
      return
    }

    const clipboardText = selectedOrdersData
      .map((order) => {
        return `SHOP ID: ${order.shopId}\nAMOUNT: $${order.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}\nLOCATION: ${order.location}`
      })
      .join("\n\n---\n\n")

    try {
      await navigator.clipboard.writeText(clipboardText)
      toast({
        title: "Orders Copied",
        description: `Successfully copied ${selectedOrdersData.length} order${selectedOrdersData.length > 1 ? "s" : ""} to clipboard`,
        variant: "default",
      })
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = clipboardText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)

      toast({
        title: "Orders Copied",
        description: `Successfully copied ${selectedOrdersData.length} order${selectedOrdersData.length > 1 ? "s" : ""} to clipboard`,
        variant: "default",
      })
    }
  }

  // Handle copy orders to clipboard (Chinese)
  const handleCopyOrdersToClipboardChinese = async () => {
    const selectedOrdersData = orders.filter((order) => selectedOrders.includes(order.id))

    if (selectedOrdersData.length === 0) {
      toast({
        title: "未选择订单",
        description: "请选择要复制到剪贴板的订单",
        variant: "destructive",
      })
      return
    }

    const clipboardText = selectedOrdersData
      .map((order) => {
        return `${order.shopId}\n $${Math.round(order.amount)}\n${translateLocation(order.location)}`
      })
      .join("\n\n---\n\n")

    try {
      await navigator.clipboard.writeText(clipboardText)
      toast({
        title: "订单已复制",
        description: `成功复制 ${selectedOrdersData.length} 个订单到剪贴板`,
        variant: "default",
      })
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = clipboardText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)

      toast({
        title: "订单已复制",
        description: `成功复制 ${selectedOrdersData.length} 个订单到剪贴板`,
        variant: "default",
      })
    }
  }

  // Get selected shop objects for batch balance editing
  const getSelectedShopObjects = () => {
    return shops.filter((shop) => selectedShops.includes(shop.id))
  }

  // Client lookup function
  const lookupClient = async (shopId: string, isBulk = false, rowId?: number) => {
    if (!shopId.trim()) {
      if (isBulk && rowId) {
        setBulkOrderRows((rows) =>
          rows.map((row) => (row.id === rowId ? { ...row, clientInfo: null, error: "", isLoading: false } : row)),
        )
      }
      return
    }

    if (isBulk && rowId) {
      setBulkOrderRows((rows) => rows.map((row) => (row.id === rowId ? { ...row, isLoading: true, error: "" } : row)))
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    const foundShop = shops.find((shop) => shop.shopId === shopId)

    if (isBulk && rowId) {
      setBulkOrderRows((rows) =>
        rows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                clientInfo: foundShop || null,
                error: foundShop ? "" : "Shop ID not found. Please check and try again.",
                isLoading: false,
              }
            : row,
        ),
      )
    }
  }

  // Handle bulk order submission
  const handleBulkOrderSubmit = async () => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only Admin users can create orders",
        variant: "destructive",
      })
      return
    }

    const validRows = bulkOrderRows.filter(
      (row) =>
        row.shopId.trim() && row.clientInfo && typeof row.amount === "number" && row.amount > 0 && row.location.trim(),
    )

    if (validRows.length === 0) {
      return
    }

    setIsSubmittingOrder(true)

    try {
      // Prepare order data
      const orderDataArray = validRows.map((row) => ({
        shopId: row.shopId,
        clientName: row.clientInfo!.clientName,
        amount: row.amount as number,
        location: row.location,
      }))

      // Add orders to Firebase
      const success = await addBulkOrders(orderDataArray)

      if (success) {
        toast({
          title: "Orders Created",
          description: `Successfully created ${validRows.length} order${validRows.length > 1 ? "s" : ""} in Firebase`,
          variant: "default",
        })

        setActiveTab("orders")
      }
    } catch (error) {
      console.error("Error creating orders:", error)
      toast({
        title: "Error",
        description: "Failed to create orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingOrder(false)
      setIsBulkOrderModalOpen(false)
      setBulkOrderRows([{ id: 1, shopId: "", amount: "", location: "" }])
      setBulkAmount("")
      setBulkLocation("")
    }
  }

  const handleAdvancedExport = () => {
    handleShopExport(shops, filteredAndSortedShops, selectedShops, exportSettings)
    setIsExportModalOpen(false)
  }

  const handleOrderExportAction = () => {
    handleOrderExport(orders, filteredAndSortedOrders, selectedOrders, orderExportSettings)
    setIsOrderExportModalOpen(false)
  }

  const getExportPreviewText = () => {
    const dataToExport = getFilteredShopsForExport(shops, filteredAndSortedShops, selectedShops, exportSettings)
    return dataToExport.length.toString()
  }

  const getOrderExportPreviewText = () => {
    const dataToExport = getFilteredOrdersForExport(
      orders,
      filteredAndSortedOrders,
      selectedOrders,
      orderExportSettings,
    )
    return dataToExport.length.toString()
  }

  // Loading states
  if (shopsLoading && activeTab === "shops") {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Loading shops data from Firebase...</h2>
          <p className="text-muted-foreground">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  if (ordersLoading && activeTab === "orders") {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Loading orders data from Firebase...</h2>
          <p className="text-muted-foreground">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <ToastProvider />

        {/* Header with Firebase Status and User Info */}
        <Header firebaseStatus={firebaseStatus} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="shops">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Shops ({shops.length})
              </div>
            </TabsTrigger>
            <TabsTrigger value="orders">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Orders ({orders.length})
              </div>
            </TabsTrigger>
            <RoleGuard allowedRoles={["admin"]}>
              <TabsTrigger value="advance-order">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Advance Orders
                  <Badge variant="secondary" className="ml-1 text-xs">
                    Admin Only
                  </Badge>
                </div>
              </TabsTrigger>
            </RoleGuard>
          </TabsList>

          <TabsContent value="shops">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-card-foreground flex items-center justify-between">
                  Shop Management
                  {isViewer && (
                    <Badge variant="secondary" className="gap-1">
                      <Eye className="h-4 w-4" />
                      Read-Only Mode
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search by Shop ID, Client Name, or Tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background border-border text-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] bg-background border-border text-foreground">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">All Status</SelectItem>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Tag Filter - Dark Mode Compatible */}
                    <div className="relative">
                      <Button
                        variant="outline"
                        className="gap-2 border-border text-foreground"
                        onClick={() => {
                          // Create a dark mode compatible dropdown
                          const dropdown = document.createElement("div")
                          dropdown.className = "fixed inset-0 z-50 flex items-start justify-center pt-20"
                          dropdown.innerHTML = `
                            <div class="bg-card border border-border rounded-lg shadow-lg p-4 w-64 max-h-96 overflow-y-auto text-card-foreground">
                              <div class="font-semibold mb-3 text-card-foreground">Filter by Tags</div>
                              <div class="space-y-1">
                                ${tagOptions
                                  .map(
                                    (tag) => `
                                  <label class="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-secondary/20 p-1 rounded">
                                    <input 
                                      type="checkbox" 
                                      value="${tag}" 
                                      ${tagFilters.includes(tag) ? "checked" : ""}
                                      class="tag-checkbox h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                                    />
                                    <span class="text-card-foreground">${tag}</span>
                                  </label>
                                `,
                                  )
                                  .join("")}
                              </div>
                              <div class="border-t border-border pt-3 mt-3 flex justify-between">
                                <button class="text-sm text-primary hover:text-primary/80" id="clear-tags">Clear All</button>
                                <button class="text-sm text-muted-foreground hover:text-card-foreground" id="close-tags">Close</button>
                              </div>
                            </div>
                            <div class="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10" id="backdrop"></div>
                          `

                          document.body.appendChild(dropdown)

                          // Handle checkbox changes
                          dropdown.querySelectorAll(".tag-checkbox").forEach((checkbox) => {
                            checkbox.addEventListener("change", (e) => {
                              const tag = (e.target as HTMLInputElement).value
                              const isChecked = (e.target as HTMLInputElement).checked

                              if (isChecked) {
                                setTagFilters((prev) => [...prev, tag])
                              } else {
                                setTagFilters((prev) => prev.filter((t) => t !== tag))
                              }
                            })
                          })

                          // Handle clear all
                          document.getElementById("clear-tags")?.addEventListener("click", () => {
                            setTagFilters([])
                            dropdown.querySelectorAll(".tag-checkbox").forEach((cb) => {
                              ;(cb as HTMLInputElement).checked = false
                            })
                          })

                          // Handle close
                          const closeDropdown = () => document.body.removeChild(dropdown)
                          document.getElementById("close-tags")?.addEventListener("click", closeDropdown)
                          document.getElementById("backdrop")?.addEventListener("click", closeDropdown)
                        }}
                      >
                        <Filter className="h-4 w-4" />
                        Tags {tagFilters.length > 0 && `(${tagFilters.length})`}
                      </Button>
                    </div>

                    {/* Admin Only Actions */}
                    <RoleGuard allowedRoles={["admin"]}>
                      {/* Import Button */}
                      <Button
                        variant="outline"
                        className="gap-2 border-border text-foreground"
                        onClick={() => setIsImportModalOpen(true)}
                      >
                        <Upload className="h-4 w-4" />
                        Import
                      </Button>
                    </RoleGuard>

                    {/* Export Button - Available to all users */}
                    <Button
                      variant="outline"
                      className="gap-2 border-border text-foreground"
                      onClick={() => setIsExportModalOpen(true)}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>

                    {/* Add Shop - Admin Only */}
                    <RoleGuard allowedRoles={["admin"]}>
                      <Button
                        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setIsAddModalOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Add Shop
                      </Button>
                    </RoleGuard>
                  </div>
                </div>

                {/* Active Filters */}
                {((statusFilter && statusFilter !== "all") || tagFilters.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {statusFilter && statusFilter !== "all" && (
                      <Badge variant="secondary" className="gap-1 bg-secondary text-secondary-foreground">
                        Status: {statusFilter}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
                      </Badge>
                    )}
                    {tagFilters.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 bg-secondary text-secondary-foreground">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => setTagFilters(tagFilters.filter((t) => t !== tag))}
                        />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Bulk Actions - Admin Only */}
                <RoleGuard allowedRoles={["admin"]}>
                  {selectedShops.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-accent rounded-lg border border-border">
                      <span className="text-sm font-medium text-accent-foreground">
                        {selectedShops.length} selected
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBulkDelete}
                        className="border-border text-foreground"
                      >
                        Delete Selected
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBatchBalanceEdit}
                        className="gap-2 border-border text-foreground"
                      >
                        <DollarSign className="h-4 w-4" />
                        Edit Balances
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBatchCreditScoreEdit}
                        className="gap-2 border-border text-foreground"
                      >
                        <TrendingUp className="h-4 w-4" />
                        Edit Credit Scores
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBatchTagsEdit}
                        className="gap-2 border-border text-foreground"
                      >
                        <Tags className="h-4 w-4" />
                        Edit Tags
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="border-border text-foreground">
                            Update Status
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-popover border-border">
                          {statusOptions.map((status) => (
                            <DropdownMenuCheckboxItem
                              key={status}
                              onSelect={() => handleBulkStatusUpdate(status)}
                              className="text-popover-foreground"
                            >
                              {status}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </RoleGuard>

                {/* Shops Table */}
                <ShopsTable
                  shops={paginatedShops}
                  selectedShops={isAdmin ? selectedShops : []}
                  onSelectShop={isAdmin ? handleSelectShop : () => {}}
                  onSelectAll={isAdmin ? handleSelectAll : () => {}}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredAndSortedShops.length}
                  onPageChange={setCurrentPage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2 text-card-foreground">
                  <ShoppingCart className="h-6 w-6" />
                  Order Management
                  {isViewer && (
                    <Badge variant="secondary" className="gap-1 ml-auto">
                      <Eye className="h-4 w-4" />
                      Read-Only Mode
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filters for Orders */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search by Order ID, Shop ID, Client Name, or Location..."
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                        className="pl-10 bg-background border-border text-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Location Filter */}
                    <Select value={orderLocationFilter} onValueChange={setOrderLocationFilter}>
                      <SelectTrigger className="w-[140px] bg-background border-border text-foreground">
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">All Locations</SelectItem>
                        {locationOptions.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Export Orders - Available to all users */}
                    <Button
                      variant="outline"
                      className="gap-2 border-border text-foreground"
                      onClick={() => setIsOrderExportModalOpen(true)}
                    >
                      <Download className="h-4 w-4" />
                      Export Orders
                    </Button>

                    {/* Add Order - Admin Only */}
                    <RoleGuard allowedRoles={["admin"]}>
                      <Button
                        variant="default"
                        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setIsBulkOrderModalOpen(true)}
                      >
                        <Package className="h-4 w-4" />
                        Add Order
                      </Button>
                    </RoleGuard>
                  </div>
                </div>

                {/* Active Filters for Orders */}
                {orderLocationFilter && orderLocationFilter !== "all" && (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1 bg-secondary text-secondary-foreground">
                      Location: {orderLocationFilter}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setOrderLocationFilter("all")} />
                    </Badge>
                  </div>
                )}

                {/* Bulk Actions for Orders */}
                {selectedOrders.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-accent rounded-lg border border-border">
                    <span className="text-sm font-medium text-accent-foreground">{selectedOrders.length} selected</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyOrdersToClipboard}
                      className="gap-2 border-border text-foreground"
                    >
                      <Copy className="h-4 w-4" />
                      Copy to Clipboard
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyOrdersToClipboardChinese}
                      className="gap-2 border-border text-foreground"
                    >
                      <Languages className="h-4 w-4" />
                      复制中文版本
                    </Button>
                    <RoleGuard allowedRoles={["admin"]}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBulkOrderDelete}
                        className="border-border text-foreground"
                      >
                        Delete Selected
                      </Button>
                    </RoleGuard>
                  </div>
                )}

                {/* Orders Table */}
                <OrdersTable
                  orders={paginatedOrders}
                  selectedOrders={selectedOrders}
                  onSelectOrder={handleSelectOrder}
                  onSelectAll={handleSelectAllOrders}
                  onView={handleViewOrder}
                  sortField={orderSortField}
                  sortDirection={orderSortDirection}
                  onSort={handleOrderSort}
                />

                {/* Orders Pagination */}
                <Pagination
                  currentPage={orderCurrentPage}
                  totalPages={orderTotalPages}
                  itemsPerPage={orderItemsPerPage}
                  totalItems={filteredAndSortedOrders.length}
                  onPageChange={setOrderCurrentPage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <RoleGuard allowedRoles={["admin"]}>
            <TabsContent value="advance-order">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2 text-card-foreground">
                    <Package className="h-6 w-6" />
                    Advance Order Management
                    <Badge variant="default" className="gap-1 bg-purple-600 text-white">
                      <Shield className="h-4 w-4" />
                      Admin Only
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AdvanceOrderForm />
                </CardContent>
              </Card>
            </TabsContent>
          </RoleGuard>
        </Tabs>

        {/* Modals - Admin Only */}
        <RoleGuard allowedRoles={["admin"]}>
          <ShopFormModal
            isOpen={isAddModalOpen || isEditModalOpen}
            onClose={() => {
              setIsAddModalOpen(false)
              setIsEditModalOpen(false)
              resetForm()
            }}
            onSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            isEditing={!!editingShop}
          />

          <ViewOrderModal
            isOpen={isViewOrderModalOpen}
            onClose={() => setIsViewOrderModalOpen(false)}
            order={viewingOrder}
          />

          {/* Delete Confirmation Modal */}
          <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-card-foreground">Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This action cannot be undone. This will permanently delete the shop "{deletingShop?.clientName}" and
                  remove all associated data from Firebase.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border text-foreground">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Shop Import Modal */}
          <ShopImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleShopImport}
            existingShops={shops}
          />

          {/* Bulk Order Modal */}
          <BulkOrderModal
            isOpen={isBulkOrderModalOpen}
            onClose={() => {
              setIsBulkOrderModalOpen(false)
              setBulkOrderRows([{ id: 1, shopId: "", amount: "", location: "" }])
              setSelectedShopIds([])
              setShowShopIdPicker(false)
              setBulkAmount("")
              setBulkLocation("")
            }}
            onSubmit={handleBulkOrderSubmit}
            shops={shops}
            bulkOrderRows={bulkOrderRows}
            setBulkOrderRows={setBulkOrderRows}
            showShopIdPicker={showShopIdPicker}
            setShowShopIdPicker={setShowShopIdPicker}
            selectedShopIds={selectedShopIds}
            setSelectedShopIds={setSelectedShopIds}
            bulkAmount={bulkAmount}
            setBulkAmount={setBulkAmount}
            bulkLocation={bulkLocation}
            setBulkLocation={setBulkLocation}
            isSubmittingOrder={isSubmittingOrder}
            lookupClient={lookupClient}
            isPopulating={isPopulating}
            setIsPopulating={setIsPopulating}
          />

          {/* Batch Balance Edit Modal */}
          <BatchBalanceEditModal
            isOpen={isBatchBalanceEditModalOpen}
            onClose={() => setIsBatchBalanceEditModalOpen(false)}
            onSave={handleBatchBalanceSave}
            selectedShops={getSelectedShopObjects()}
          />

          {/* Batch Credit Score Edit Modal */}
          <BatchCreditScoreEditModal
            isOpen={isBatchCreditScoreEditModalOpen}
            onClose={() => setIsBatchCreditScoreEditModalOpen(false)}
            onSave={handleBatchCreditScoreSave}
            selectedShops={getSelectedShopObjects()}
          />

          {/* Batch Tags Edit Modal */}
          <BatchTagsEditModal
            isOpen={isBatchTagsEditModalOpen}
            onClose={() => setIsBatchTagsEditModalOpen(false)}
            onSave={handleBatchTagsSave}
            selectedShops={getSelectedShopObjects()}
          />
        </RoleGuard>

        {/* Export Modals - Available to all users */}
        <ShopExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleAdvancedExport}
          exportSettings={exportSettings}
          setExportSettings={setExportSettings}
          previewCount={getExportPreviewText()}
        />

        <OrderExportModal
          isOpen={isOrderExportModalOpen}
          onClose={() => setIsOrderExportModalOpen(false)}
          onExport={handleOrderExportAction}
          exportSettings={orderExportSettings}
          setExportSettings={setOrderExportSettings}
          previewCount={getOrderExportPreviewText()}
        />
      </div>
    </div>
  )
}
