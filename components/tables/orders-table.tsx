"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown, ArrowUp, ArrowDown, Eye } from "lucide-react"
import type { Order, OrderSortField, SortDirection } from "../../types"
import { formatDate } from "../../utils/formatters"

interface OrdersTableProps {
  orders: Order[]
  selectedOrders: number[]
  onSelectOrder: (orderId: number, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  onView: (order: Order) => void
  sortField: OrderSortField
  sortDirection: SortDirection
  onSort: (field: OrderSortField) => void
}

export function OrdersTable({
  orders,
  selectedOrders,
  onSelectOrder,
  onSelectAll,
  onView,
  sortField,
  sortDirection,
  onSort,
}: OrdersTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedOrders.length === orders.length && orders.length > 0}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Order ID</TableHead>
            <TableHead>Shop ID</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onSort("clientName")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Client Name
                {sortField === "clientName" &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-2 h-4 w-4" />
                  ))}
                {sortField !== "clientName" && <ArrowUpDown className="ml-2 h-4 w-4" />}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onSort("amount")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Amount
                {sortField === "amount" &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-2 h-4 w-4" />
                  ))}
                {sortField !== "amount" && <ArrowUpDown className="ml-2 h-4 w-4" />}
              </Button>
            </TableHead>
            <TableHead>Location</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onSort("createdAt")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Date
                {sortField === "createdAt" &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-2 h-4 w-4" />
                  ))}
                {sortField !== "createdAt" && <ArrowUpDown className="ml-2 h-4 w-4" />}
              </Button>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Checkbox
                  checked={selectedOrders.includes(order.id)}
                  onCheckedChange={(checked) => onSelectOrder(order.id, checked as boolean)}
                />
              </TableCell>
              <TableCell className="font-medium">#{order.id}</TableCell>
              <TableCell className="font-medium">{order.shopId}</TableCell>
              <TableCell>{order.clientName}</TableCell>
              <TableCell className="font-semibold">
                ${order.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>{order.location}</TableCell>
              <TableCell className="text-sm text-gray-600">{formatDate(order.createdAt)}</TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => onView(order)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
