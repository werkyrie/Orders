"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Save } from "lucide-react"
import type { Shop } from "../../types"
import { getStatusColor } from "../../utils/colors"

interface BatchBalanceEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (updatedBalances: { [shopId: number]: number }) => void
  selectedShops: Shop[]
}

export function BatchBalanceEditModal({ isOpen, onClose, onSave, selectedShops }: BatchBalanceEditModalProps) {
  const [balances, setBalances] = useState<{ [shopId: number]: number }>(() => {
    const initialBalances: { [shopId: number]: number } = {}
    selectedShops.forEach((shop) => {
      initialBalances[shop.id] = shop.balance
    })
    return initialBalances
  })

  const [bulkAdjustment, setBulkAdjustment] = useState("")
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract" | "set">("add")

  const handleBalanceChange = (shopId: number, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setBalances((prev) => ({
      ...prev,
      [shopId]: numValue,
    }))
  }

  const applyBulkAdjustment = () => {
    const adjustment = Number.parseFloat(bulkAdjustment)
    if (isNaN(adjustment)) return

    setBalances((prev) => {
      const updated = { ...prev }
      selectedShops.forEach((shop) => {
        switch (adjustmentType) {
          case "add":
            updated[shop.id] = shop.balance + adjustment
            break
          case "subtract":
            updated[shop.id] = shop.balance - adjustment
            break
          case "set":
            updated[shop.id] = adjustment
            break
        }
      })
      return updated
    })
  }

  const handleSave = () => {
    onSave(balances)
    onClose()
  }

  const resetBalances = () => {
    const resetBalances: { [shopId: number]: number } = {}
    selectedShops.forEach((shop) => {
      resetBalances[shop.id] = shop.balance
    })
    setBalances(resetBalances)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Batch Edit Balances ({selectedShops.length} shops)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bulk Adjustment Section */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Quick Bulk Adjustment (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="adjustment-type">Action</Label>
                <select
                  id="adjustment-type"
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as "add" | "subtract" | "set")}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="add">Add to current balance</option>
                  <option value="subtract">Subtract from current balance</option>
                  <option value="set">Set balance to</option>
                </select>
              </div>
              <div>
                <Label htmlFor="bulk-adjustment">Amount</Label>
                <Input
                  id="bulk-adjustment"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={bulkAdjustment}
                  onChange={(e) => setBulkAdjustment(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={applyBulkAdjustment}
                  disabled={!bulkAdjustment || isNaN(Number.parseFloat(bulkAdjustment))}
                  className="w-full"
                >
                  Apply to All
                </Button>
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              This will {adjustmentType === "add" ? "add" : adjustmentType === "subtract" ? "subtract" : "set"} the
              amount {adjustmentType !== "set" ? `${adjustmentType === "add" ? "to" : "from"}` : "as"} all selected shop
              balances
            </p>
          </div>

          {/* Individual Balance Editing */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-foreground">Individual Balance Editing</h4>
              <Button type="button" variant="outline" size="sm" onClick={resetBalances}>
                Reset All
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedShops.map((shop) => (
                <div
                  key={shop.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">{shop.shopId}</span>
                      <Badge className={getStatusColor(shop.status)}>{shop.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{shop.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      Original: ${shop.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Label htmlFor={`balance-${shop.id}`} className="text-sm font-medium">
                        New Balance
                      </Label>
                      <Input
                        id={`balance-${shop.id}`}
                        type="number"
                        step="0.01"
                        value={balances[shop.id]}
                        onChange={(e) => handleBalanceChange(shop.id, e.target.value)}
                        className="w-32 text-right"
                      />
                    </div>
                    <div className="text-sm">
                      {balances[shop.id] !== shop.balance && (
                        <div
                          className={`font-medium ${
                            balances[shop.id] > shop.balance ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {balances[shop.id] > shop.balance ? "+" : ""}
                          {(balances[shop.id] - shop.balance).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Shops:</span>
                <p className="font-semibold">{selectedShops.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Original Total:</span>
                <p className="font-semibold">
                  $
                  {selectedShops
                    .reduce((sum, shop) => sum + shop.balance, 0)
                    .toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">New Total:</span>
                <p className="font-semibold">
                  $
                  {Object.values(balances)
                    .reduce((sum, balance) => sum + balance, 0)
                    .toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Net Change:</span>
                <p
                  className={`font-semibold ${
                    Object.values(balances).reduce((sum, balance) => sum + balance, 0) -
                      selectedShops.reduce((sum, shop) => sum + shop.balance, 0) >=
                    0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Object.values(balances).reduce((sum, balance) => sum + balance, 0) -
                    selectedShops.reduce((sum, shop) => sum + shop.balance, 0) >=
                  0
                    ? "+"
                    : ""}
                  $
                  {(
                    Object.values(balances).reduce((sum, balance) => sum + balance, 0) -
                    selectedShops.reduce((sum, shop) => sum + shop.balance, 0)
                  ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
