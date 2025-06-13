"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Save } from "lucide-react"
import type { Shop } from "../../types"
import { getStatusColor } from "../../utils/colors"

interface BatchCreditScoreEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (updatedCreditScores: { [shopId: number]: number }) => void
  selectedShops: Shop[]
}

export function BatchCreditScoreEditModal({ isOpen, onClose, onSave, selectedShops }: BatchCreditScoreEditModalProps) {
  const [creditScores, setCreditScores] = useState<{ [shopId: number]: number }>(() => {
    const initialCreditScores: { [shopId: number]: number } = {}
    selectedShops.forEach((shop) => {
      initialCreditScores[shop.id] = shop.creditScore
    })
    return initialCreditScores
  })

  const [bulkAdjustment, setBulkAdjustment] = useState("")
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract" | "set">("set")

  const handleCreditScoreChange = (shopId: number, value: string) => {
    const numValue = Number.parseInt(value) || 0
    // Ensure credit score stays within 0-100 range
    const clampedValue = Math.max(0, Math.min(100, numValue))
    setCreditScores((prev) => ({
      ...prev,
      [shopId]: clampedValue,
    }))
  }

  const applyBulkAdjustment = () => {
    const adjustment = Number.parseInt(bulkAdjustment)
    if (isNaN(adjustment)) return

    setCreditScores((prev) => {
      const updated = { ...prev }
      selectedShops.forEach((shop) => {
        let newScore: number
        switch (adjustmentType) {
          case "add":
            newScore = shop.creditScore + adjustment
            break
          case "subtract":
            newScore = shop.creditScore - adjustment
            break
          case "set":
            newScore = adjustment
            break
        }
        // Ensure credit score stays within 0-100 range
        updated[shop.id] = Math.max(0, Math.min(100, newScore))
      })
      return updated
    })
  }

  const handleSave = () => {
    onSave(creditScores)
    onClose()
  }

  const resetCreditScores = () => {
    const resetCreditScores: { [shopId: number]: number } = {}
    selectedShops.forEach((shop) => {
      resetCreditScores[shop.id] = shop.creditScore
    })
    setCreditScores(resetCreditScores)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Batch Edit Credit Scores ({selectedShops.length} shops)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bulk Adjustment Section */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
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
                  <option value="add">Add to current score</option>
                  <option value="subtract">Subtract from current score</option>
                  <option value="set">Set score to</option>
                </select>
              </div>
              <div>
                <Label htmlFor="bulk-adjustment">Points</Label>
                <Input
                  id="bulk-adjustment"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={bulkAdjustment}
                  onChange={(e) => setBulkAdjustment(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={applyBulkAdjustment}
                  disabled={!bulkAdjustment || isNaN(Number.parseInt(bulkAdjustment))}
                  className="w-full"
                >
                  Apply to All
                </Button>
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              This will {adjustmentType === "add" ? "add" : adjustmentType === "subtract" ? "subtract" : "set"} the
              points {adjustmentType !== "set" ? `${adjustmentType === "add" ? "to" : "from"}` : "as"} all selected shop
              credit scores (0-100 range)
            </p>
          </div>

          {/* Individual Credit Score Editing */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-foreground">Individual Credit Score Editing</h4>
              <Button type="button" variant="outline" size="sm" onClick={resetCreditScores}>
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
                    <p className="text-xs text-muted-foreground">Original: {shop.creditScore} points</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Label htmlFor={`credit-score-${shop.id}`} className="text-sm font-medium">
                        New Score
                      </Label>
                      <Input
                        id={`credit-score-${shop.id}`}
                        type="number"
                        min="0"
                        max="100"
                        value={creditScores[shop.id]}
                        onChange={(e) => handleCreditScoreChange(shop.id, e.target.value)}
                        className="w-24 text-right"
                      />
                    </div>
                    <div className="text-sm">
                      {creditScores[shop.id] !== shop.creditScore && (
                        <div
                          className={`font-medium ${
                            creditScores[shop.id] > shop.creditScore ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {creditScores[shop.id] > shop.creditScore ? "+" : ""}
                          {creditScores[shop.id] - shop.creditScore} pts
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Shops:</span>
                <p className="font-semibold">{selectedShops.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Original Avg:</span>
                <p className="font-semibold">
                  {Math.round(selectedShops.reduce((sum, shop) => sum + shop.creditScore, 0) / selectedShops.length)}{" "}
                  pts
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">New Avg:</span>
                <p className="font-semibold">
                  {Math.round(
                    Object.values(creditScores).reduce((sum, score) => sum + score, 0) / selectedShops.length,
                  )}{" "}
                  pts
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Change:</span>
                <p
                  className={`font-semibold ${
                    Math.round(
                      Object.values(creditScores).reduce((sum, score) => sum + score, 0) / selectedShops.length,
                    ) -
                      Math.round(
                        selectedShops.reduce((sum, shop) => sum + shop.creditScore, 0) / selectedShops.length,
                      ) >=
                    0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Math.round(
                    Object.values(creditScores).reduce((sum, score) => sum + score, 0) / selectedShops.length,
                  ) -
                    Math.round(selectedShops.reduce((sum, shop) => sum + shop.creditScore, 0) / selectedShops.length) >=
                  0
                    ? "+"
                    : ""}
                  {Math.round(
                    Object.values(creditScores).reduce((sum, score) => sum + score, 0) / selectedShops.length,
                  ) -
                    Math.round(
                      selectedShops.reduce((sum, shop) => sum + shop.creditScore, 0) / selectedShops.length,
                    )}{" "}
                  pts
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
