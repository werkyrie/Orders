"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, X, AlertCircle, Loader2 } from "lucide-react"
import type { Shop, BulkOrderRow } from "../../types"
import { locationOptions } from "../../data/constants"
import { getStatusColor, getTagColor } from "../../utils/colors"

interface BulkOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  shops: Shop[]
  bulkOrderRows: BulkOrderRow[]
  setBulkOrderRows: (rows: BulkOrderRow[] | ((prev: BulkOrderRow[]) => BulkOrderRow[])) => void
  showShopIdPicker: boolean
  setShowShopIdPicker: (show: boolean) => void
  selectedShopIds: string[]
  setSelectedShopIds: (ids: string[]) => void
  bulkAmount: string
  setBulkAmount: (amount: string) => void
  bulkLocation: string
  setBulkLocation: (location: string) => void
  isSubmittingOrder: boolean
  lookupClient: (shopId: string, isBulk: boolean, rowId?: number) => void
  isPopulating?: boolean
  setIsPopulating?: (loading: boolean) => void
}

export function BulkOrderModal({
  isOpen,
  onClose,
  onSubmit,
  shops,
  bulkOrderRows,
  setBulkOrderRows,
  showShopIdPicker,
  setShowShopIdPicker,
  selectedShopIds,
  setSelectedShopIds,
  bulkAmount,
  setBulkAmount,
  bulkLocation,
  setBulkLocation,
  isSubmittingOrder,
  lookupClient,
  isPopulating = false,
  setIsPopulating = () => {},
}: BulkOrderModalProps) {
  const populateBulkOrdersFromShopIds = async () => {
    setIsPopulating(true)

    // Small delay to show the loading state
    await new Promise((resolve) => setTimeout(resolve, 800))

    const newRows = selectedShopIds.map((shopId, index) => ({
      id: bulkOrderRows.length + index + 1,
      shopId: shopId,
      amount: bulkAmount ? Number(bulkAmount) : ("" as const),
      location: bulkLocation || "",
    }))
    setBulkOrderRows([...bulkOrderRows, ...newRows])

    // Auto-lookup client info for each shop ID
    newRows.forEach((row) => {
      if (row.shopId) {
        lookupClient(row.shopId, true, row.id)
      }
    })

    // Show success toast
    const event = new CustomEvent("toast", {
      detail: {
        title: "Orders Created",
        description: `Successfully created ${selectedShopIds.length} order${selectedShopIds.length > 1 ? "s" : ""} from selected shops`,
        variant: "success",
      },
    })
    document.dispatchEvent(event)

    setIsPopulating(false)
  }

  const applyBulkAmount = () => {
    if (!bulkAmount) return

    const amount = Number(bulkAmount)
    if (isNaN(amount) || amount <= 0) return

    setBulkOrderRows((rows) =>
      rows.map((row) => ({
        ...row,
        amount: amount,
      })),
    )
  }

  const applyBulkLocation = () => {
    if (!bulkLocation) return

    setBulkOrderRows((rows) =>
      rows.map((row) => ({
        ...row,
        location: bulkLocation,
      })),
    )
  }

  const removeBulkOrderRow = (id: number) => {
    setBulkOrderRows((rows) => rows.filter((row) => row.id !== id))
  }

  const updateBulkOrderRow = (id: number, field: string, value: any) => {
    setBulkOrderRows((rows) =>
      rows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value }
          if (field === "shopId") {
            updatedRow.clientInfo = null
            updatedRow.error = ""
            lookupClient(value, true, id)
          }
          return updatedRow
        }
        return row
      }),
    )
  }

  const addBulkOrderRow = () => {
    setBulkOrderRows([...bulkOrderRows, { id: bulkOrderRows.length + 1, shopId: "", amount: "", location: "" }])
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create Bulk Orders
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Shop ID List Picker */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">Quick Setup: Select Multiple Shop IDs</h4>
            </div>

            <div className="flex items-center justify-between mb-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const activeShopIds = shops.filter((shop) => shop.status === "Active").map((shop) => shop.shopId)
                  setSelectedShopIds(activeShopIds)

                  // Show toast notification
                  const event = new CustomEvent("toast", {
                    detail: {
                      title: "Active Shops Selected",
                      description: `Selected ${activeShopIds.length} active shops`,
                      variant: "info",
                    },
                  })
                  document.dispatchEvent(event)
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Select All Active Shops
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedShopIds([])}
                disabled={selectedShopIds.length === 0}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-3">
              <div className="max-h-60 overflow-y-auto p-2 border rounded bg-card">
                <div className="space-y-2">
                  {shops.map((shop) => (
                    <div
                      key={shop.shopId}
                      className="flex items-center justify-between p-3 border border-border rounded hover:bg-accent"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`bulk-${shop.shopId}`}
                          checked={selectedShopIds.includes(shop.shopId)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedShopIds([...selectedShopIds, shop.shopId])
                            } else {
                              setSelectedShopIds(selectedShopIds.filter((id) => id !== shop.shopId))
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Label
                              htmlFor={`bulk-${shop.shopId}`}
                              className="font-medium cursor-pointer text-foreground"
                            >
                              {shop.shopId}
                            </Label>
                            <Badge className={getStatusColor(shop.status)}>{shop.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{shop.clientName}</p>
                          {shop.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {shop.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className={`${getTagColor(tag)} text-xs`}>
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium text-foreground">Credit: {shop.creditScore}</div>
                        <div className={`font-semibold ${shop.balance < 0 ? "text-red-500" : "text-green-500"}`}>
                          ${shop.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedShopIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{selectedShopIds.length} shop(s) selected</span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={populateBulkOrdersFromShopIds}
                    className="gap-2"
                    disabled={isPopulating}
                  >
                    {isPopulating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Orders...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create Orders for Selected Shops
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedShopIds([])}>
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Bulk Settings - Apply to All */}
          <div className="p-4 bg-muted rounded-lg border border-border">
            <h4 className="font-medium text-foreground mb-3">Bulk Settings (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulk-amount">Amount for All Orders</Label>
                <div className="flex gap-2">
                  <Input
                    id="bulk-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={bulkAmount}
                    onChange={(e) => setBulkAmount(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={applyBulkAmount}
                    disabled={!bulkAmount || Number.parseFloat(bulkAmount) <= 0}
                  >
                    Apply to All
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Set the same amount for all orders</p>
              </div>
              <div>
                <Label htmlFor="bulk-location">Location for All Orders</Label>
                <div className="flex gap-2">
                  <Select value={bulkLocation} onValueChange={setBulkLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={applyBulkLocation}
                    disabled={!bulkLocation}
                  >
                    Apply to All
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Set the same location for all orders</p>
              </div>
            </div>
          </div>

          {/* Individual Order Rows */}
          {bulkOrderRows.map((row, index) => (
            <div key={row.id} className="p-4 border border-border rounded-lg bg-card space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Order #{index + 1}</h4>
                {bulkOrderRows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBulkOrderRow(row.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Shop ID *</Label>
                  <Input
                    type="text"
                    value={row.shopId}
                    onChange={(e) => updateBulkOrderRow(row.id, "shopId", e.target.value)}
                    placeholder="Enter Shop ID"
                  />
                  {row.error && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {row.error}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={row.amount}
                    onChange={(e) => updateBulkOrderRow(row.id, "amount", Number.parseFloat(e.target.value) || "")}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Location *</Label>
                  <Select value={row.location} onValueChange={(value) => updateBulkOrderRow(row.id, "location", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Client Info for Bulk Order Row */}
              {row.isLoading && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Looking up client...</span>
                </div>
              )}

              {row.clientInfo && (
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Client:</span>
                      <p className="text-foreground">{row.clientInfo.clientName}</p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge className={getStatusColor(row.clientInfo.status)} size="sm">
                        {row.clientInfo.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Credit:</span>
                      <p className="text-foreground">{row.clientInfo.creditScore}</p>
                    </div>
                    <div>
                      <span className="font-medium">Balance:</span>
                      <p className={`font-semibold ${row.clientInfo.balance < 0 ? "text-red-600" : "text-green-600"}`}>
                        ${row.clientInfo.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addBulkOrderRow} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Another Order
          </Button>
        </div>

        <DialogFooter className="sticky bottom-0 bg-card pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmittingOrder}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              isSubmittingOrder ||
              !bulkOrderRows.some((row) => row.clientInfo && typeof row.amount === "number" && row.amount > 0)
            }
            className="gap-2"
          >
            {isSubmittingOrder ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Orders...
              </>
            ) : (
              <>
                <Package className="h-4 w-4" />
                Submit All Orders (
                {
                  bulkOrderRows.filter((row) => row.clientInfo && typeof row.amount === "number" && row.amount > 0)
                    .length
                }
                )
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
