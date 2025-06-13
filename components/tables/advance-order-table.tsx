"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// First, import the Copy icon
import { Eye, Trash2, Copy } from "lucide-react"
import type { AdvanceOrder } from "../../types"
import { formatDate } from "../../utils/formatters"

// Update the interface to include a new onCopy function
interface AdvanceOrderTableProps {
  orders: AdvanceOrder[]
  onView: (order: AdvanceOrder) => void
  onDelete: (orderId: string) => void
  onCopy: (order: AdvanceOrder) => void
}

// Update the function parameters to include onCopy
export function AdvanceOrderTable({ orders, onView, onDelete, onCopy }: AdvanceOrderTableProps) {
  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case "System Message":
        return "bg-blue-900/50 text-blue-300 border-blue-700"
      case "Buyer Inquiry":
        return "bg-purple-900/50 text-purple-300 border-purple-700"
      default:
        return "bg-gray-800/50 text-gray-300 border-gray-600"
    }
  }

  const truncateMessage = (message: string, maxLength = 50) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + "..."
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Shop ID</TableHead>
            <TableHead>Request Type</TableHead>
            <TableHead>Message Preview</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell className="font-medium">{order.orderId}</TableCell>
              <TableCell className="font-medium">{order.shopId}</TableCell>
              <TableCell>
                <Badge className={getRequestTypeColor(order.requestType)}>{order.requestType}</Badge>
              </TableCell>
              <TableCell className="max-w-xs">
                <span className="text-sm text-muted-foreground" title={order.message}>
                  {truncateMessage(order.message)}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
              {/* In the Actions cell, add a new Copy button between the View and Delete buttons */}
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView(order)}
                    className="gap-1"
                    title="View and translate"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCopy(order)}
                    className="gap-1 text-blue-600 hover:text-blue-700"
                    title="Copy formatted content"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(order.orderId)}
                    className="gap-1 text-red-600 hover:text-red-700"
                    title="Delete order"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
