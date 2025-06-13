"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2 } from "lucide-react"
import type { Shop, SortField, SortDirection } from "../../types"
import { getStatusColor, getTagColor } from "../../utils/colors"

interface ShopsTableProps {
  shops: Shop[]
  selectedShops: number[]
  onSelectShop: (shopId: number, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  onEdit: (shop: Shop) => void
  onDelete: (shop: Shop) => void
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}

export function ShopsTable({
  shops,
  selectedShops,
  onSelectShop,
  onSelectAll,
  onEdit,
  onDelete,
  sortField,
  sortDirection,
  onSort,
}: ShopsTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedShops.length === shops.length && shops.length > 0}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
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
            <TableHead>Status</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onSort("creditScore")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Credit Score
                {sortField === "creditScore" &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-2 h-4 w-4" />
                  ))}
                {sortField !== "creditScore" && <ArrowUpDown className="ml-2 h-4 w-4" />}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onSort("balance")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Balance
                {sortField === "balance" &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-2 h-4 w-4" />
                  ))}
                {sortField !== "balance" && <ArrowUpDown className="ml-2 h-4 w-4" />}
              </Button>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shops.map((shop) => (
            <TableRow key={shop.id}>
              <TableCell>
                <Checkbox
                  checked={selectedShops.includes(shop.id)}
                  onCheckedChange={(checked) => onSelectShop(shop.id, checked as boolean)}
                />
              </TableCell>
              <TableCell className="font-medium">{shop.shopId}</TableCell>
              <TableCell>{shop.clientName}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(shop.status)}>{shop.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {shop.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className={getTagColor(tag)}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{shop.creditScore}</TableCell>
              <TableCell className={shop.balance < 0 ? "text-red-600 font-semibold" : ""}>
                ${shop.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(shop)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDelete(shop)}>
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
