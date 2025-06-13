"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Package, Send, Loader2, Copy, Search, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { AdvanceOrder } from "../../types"
import { AdvanceOrderTable } from "../tables/advance-order-table"
import { useAdvanceOrdersFirebase } from "../../hooks/use-advance-orders-firebase"
import { Pagination } from "../pagination"
import { useShopsFirebase } from "../../hooks/use-shops-firebase"
import { Languages } from "lucide-react" // Import Languages component

interface AdvanceOrderData {
  orderId: string
  shopId: string
  requestType: "Order" | "Buyer Inquiry" | ""
  message: string
}

export function AdvanceOrderForm() {
  const [formData, setFormData] = useState<AdvanceOrderData>({
    orderId: "",
    shopId: "",
    requestType: "",
    message: "",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState("")
  const [translatedContent, setTranslatedContent] = useState("")
  const { toast } = useToast()

  // Use Firebase hook for advance orders
  const {
    advanceOrders,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    requestTypeFilter,
    setRequestTypeFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredAndSortedAdvanceOrders,
    paginatedAdvanceOrders,
    totalPages,
    addAdvanceOrder,
    deleteAdvanceOrder,
  } = useAdvanceOrdersFirebase()

  const { shops } = useShopsFirebase()
  const [shopSearchOpen, setShopSearchOpen] = useState(false)

  // Show error toasts if Firebase operations fail
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  // Auto-generate Order ID
  const generateOrderId = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `ADV-${timestamp}-${random}`
  }

  // Fuzzy search function for shops
  const searchShops = (searchTerm: string) => {
    if (!searchTerm.trim()) return []

    const term = searchTerm.toLowerCase()

    return shops
      .filter((shop) => {
        const shopIdMatch = shop.shopId.toLowerCase().includes(term)
        const nameMatch = shop.clientName.toLowerCase().includes(term)
        return shopIdMatch || nameMatch
      })
      .sort((a, b) => {
        // Prioritize exact matches first
        const aShopIdExact = a.shopId.toLowerCase() === term
        const bShopIdExact = b.shopId.toLowerCase() === term
        const aNameExact = a.clientName.toLowerCase() === term
        const bNameExact = b.clientName.toLowerCase() === term

        if (aShopIdExact && !bShopIdExact) return -1
        if (!aShopIdExact && bShopIdExact) return 1
        if (aNameExact && !bNameExact) return -1
        if (!aNameExact && bNameExact) return 1

        // Then prioritize starts with matches
        const aShopIdStarts = a.shopId.toLowerCase().startsWith(term)
        const bShopIdStarts = b.shopId.toLowerCase().startsWith(term)
        const aNameStarts = a.clientName.toLowerCase().startsWith(term)
        const bNameStarts = b.clientName.toLowerCase().startsWith(term)

        if (aShopIdStarts && !bShopIdStarts) return -1
        if (!aShopIdStarts && bShopIdStarts) return 1
        if (aNameStarts && !bNameStarts) return -1
        if (!aNameStarts && bNameStarts) return 1

        // Finally sort alphabetically
        return a.shopId.localeCompare(b.shopId)
      })
      .slice(0, 10) // Limit to 10 suggestions
  }

  const handleInputChange = (field: keyof AdvanceOrderData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleGenerate = async () => {
    // Validation
    if (!formData.orderId.trim()) {
      toast({
        title: "Validation Error",
        description: "Order ID is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.shopId.trim()) {
      toast({
        title: "Validation Error",
        description: "Shop ID is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.requestType) {
      toast({
        title: "Validation Error",
        description: "Request Type is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Message is required",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Add to Firebase
      const success = await addAdvanceOrder({
        orderId: formData.orderId || generateOrderId(),
        shopId: formData.shopId,
        requestType: formData.requestType as "Order" | "Buyer Inquiry",
        message: formData.message,
      })

      if (success) {
        toast({
          title: "Order Generated Successfully",
          description: `Advance order ${formData.orderId} has been created and saved to Firebase`,
          variant: "default",
        })

        // Reset form after successful generation
        setFormData({
          orderId: "",
          shopId: "",
          requestType: "",
          message: "",
        })
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate advance order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyTranslatedContent = async () => {
    try {
      await navigator.clipboard.writeText(translatedContent)
      toast({
        title: "Content Copied",
        description: "Formatted content copied to clipboard",
        variant: "default",
      })
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = translatedContent
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)

      toast({
        title: "Content Copied",
        description: "Formatted content copied to clipboard",
        variant: "default",
      })
    }
  }

  const handleViewOrder = (order: AdvanceOrder) => {
    const formattedContent = `${order.orderId}
${order.shopId}
${order.requestType === "System Message" ? "系统消息" : order.requestType === "Buyer Inquiry" ? "订单买家询盘" : order.requestType}
${order.message}`

    setTranslatedContent(formattedContent)
    setIsTranslateModalOpen(true)
  }

  const handleDeleteOrder = async (orderId: string) => {
    const success = await deleteAdvanceOrder(orderId)
    if (success) {
      toast({
        title: "Order Deleted",
        description: `Advance order ${orderId} has been deleted from Firebase`,
        variant: "default",
      })
    }
  }

  const isFormValid =
    formData.orderId.trim() && formData.shopId.trim() && formData.requestType && formData.message.trim()

  // Add a new function to handle copying directly from the table
  const handleCopyOrder = (order: AdvanceOrder) => {
    const formattedContent = `${order.orderId}
${order.shopId}
${order.requestType === "System Message" ? "系统消息" : order.requestType === "Buyer Inquiry" ? "订单买家询盘" : order.requestType}
${order.message}`

    // Copy to clipboard
    try {
      navigator.clipboard.writeText(formattedContent)
      toast({
        title: "Content Copied",
        description: "Formatted content copied to clipboard",
        variant: "default",
      })
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = formattedContent
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)

      toast({
        title: "Content Copied",
        description: "Formatted content copied to clipboard",
        variant: "default",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Loading advance orders...</h3>
          <p className="text-muted-foreground">Please wait while we fetch your data from Firebase</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Package className="h-5 w-5" />
            Create Advance Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order ID Section */}
          <div className="space-y-2">
            <Label htmlFor="orderId" className="text-sm font-medium">
              Order ID *
            </Label>
            <Input
              id="orderId"
              type="text"
              value={formData.orderId}
              onChange={(e) => handleInputChange("orderId", e.target.value)}
              placeholder="Enter Order ID"
              className="w-full"
            />
          </div>

          {/* Shop ID Section - Replace the existing Shop ID section */}
          <div className="space-y-2">
            <Label htmlFor="shopId" className="text-sm font-medium">
              Shop ID / Shop Name *
            </Label>
            <div className="relative">
              <Input
                id="shopId"
                type="text"
                value={formData.shopId}
                onChange={(e) => {
                  handleInputChange("shopId", e.target.value)
                  setShopSearchOpen(e.target.value.length > 0)
                }}
                onFocus={() => setShopSearchOpen(formData.shopId.length > 0)}
                onBlur={() => setTimeout(() => setShopSearchOpen(false), 200)}
                placeholder="Type Shop ID or Name to search..."
                className="w-full"
              />
              {shopSearchOpen && formData.shopId && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchShops(formData.shopId).length > 0 ? (
                    <div className="p-1">
                      {searchShops(formData.shopId).map((shop) => (
                        <div
                          key={shop.id}
                          className="flex items-center justify-between p-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                          onClick={() => {
                            handleInputChange("shopId", shop.shopId)
                            setShopSearchOpen(false)
                          }}
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{shop.shopId}</span>
                              {formData.shopId === shop.shopId && <Check className="h-4 w-4 text-primary" />}
                            </div>
                            <span className="text-sm text-muted-foreground">{shop.clientName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={shop.status === "Active" ? "default" : "secondary"} className="text-xs">
                              {shop.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">${shop.balance.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No shops found matching "{formData.shopId}"
                    </div>
                  )}
                </div>
              )}
            </div>
            {formData.shopId &&
              (() => {
                const selectedShop = shops.find((shop) => shop.shopId === formData.shopId)
                return selectedShop ? (
                  <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    <strong>Selected:</strong> {selectedShop.shopId} - {selectedShop.clientName}
                    <span className="ml-2">
                      (Status: {selectedShop.status}, Balance: ${selectedShop.balance.toLocaleString()})
                    </span>
                  </div>
                ) : null
              })()}
          </div>

          {/* Request Type */}
          <div className="space-y-2">
            <Label htmlFor="requestType" className="text-sm font-medium">
              Request Type *
            </Label>
            <Select value={formData.requestType} onValueChange={(value) => handleInputChange("requestType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose request type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="System Message">System Message</SelectItem>
                <SelectItem value="Buyer Inquiry">Buyer Inquiry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message *
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Enter your message here..."
              rows={6}
              className="w-full resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">{formData.message.length} characters</p>
              {formData.message.length > 500 && (
                <Badge variant="secondary" className="text-xs">
                  Long message
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleGenerate} disabled={!isFormValid || isGenerating} className="w-full gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Generate & Save to Firebase
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advance Orders Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-card-foreground">
            Advance Orders from Firebase ({filteredAndSortedAdvanceOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by Order ID, Shop ID, or Message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {/* Request Type Filter */}
              <Select value={requestTypeFilter} onValueChange={setRequestTypeFilter}>
                <SelectTrigger className="w-[160px] bg-background border-border text-foreground">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Order">Order</SelectItem>
                  <SelectItem value="Buyer Inquiry">Buyer Inquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {requestTypeFilter && requestTypeFilter !== "all" && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1 bg-secondary text-secondary-foreground">
                Type: {requestTypeFilter}
                <button
                  onClick={() => setRequestTypeFilter("all")}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            </div>
          )}

          {paginatedAdvanceOrders.length > 0 ? (
            <>
              <AdvanceOrderTable
                orders={paginatedAdvanceOrders}
                onView={handleViewOrder}
                onDelete={handleDeleteOrder}
                onCopy={handleCopyOrder}
              />

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredAndSortedAdvanceOrders.length}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Advance Orders Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || requestTypeFilter !== "all"
                  ? "No orders match your current filters. Try adjusting your search criteria."
                  : "Create your first advance order using the form above."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Translation Modal */}
      <Dialog open={isTranslateModalOpen} onOpenChange={setIsTranslateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Formatted Content for Translation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border border-border">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">{translatedContent}</pre>
            </div>
            <p className="text-sm text-muted-foreground">
              This content has been formatted for easy copying. The request type has been translated to Chinese.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTranslateModalOpen(false)}>
              Close
            </Button>
            <Button onClick={handleCopyTranslatedContent} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
