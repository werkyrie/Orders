"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ShoppingCart } from "lucide-react"
import type { Order } from "../../types"
import { formatDate } from "../../utils/formatters"

interface ViewOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
}

export function ViewOrderModal({ isOpen, onClose, order }: ViewOrderModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Details
          </DialogTitle>
        </DialogHeader>
        {order && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Order ID</Label>
                <p className="font-semibold">#{order.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Shop ID</Label>
                <p className="font-semibold">{order.shopId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Client Name</Label>
                <p>{order.clientName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Amount</Label>
                <p className="font-semibold text-lg">
                  ${order.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Location</Label>
                <p>{order.location}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Order Date</Label>
              <p>{formatDate(order.createdAt)}</p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
