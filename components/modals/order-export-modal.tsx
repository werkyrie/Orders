"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import type { OrderExportSettings } from "../../types"
import { exportFormats, exportScopes, orderExportColumns, locationOptions } from "../../data/constants"

interface OrderExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: () => void
  exportSettings: OrderExportSettings
  setExportSettings: (settings: OrderExportSettings) => void
  previewCount: string
}

export function OrderExportModal({
  isOpen,
  onClose,
  onExport,
  exportSettings,
  setExportSettings,
  previewCount,
}: OrderExportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Orders - Advanced Options
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div>
            <Label className="text-base font-semibold">Export Format</Label>
            <div className="flex gap-4 mt-2">
              {exportFormats.map((format) => (
                <div key={format.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`order-${format.value}`}
                    checked={exportSettings.format === format.value}
                    onCheckedChange={() => setExportSettings({ ...exportSettings, format: format.value })}
                  />
                  <Label htmlFor={`order-${format.value}`} className="cursor-pointer">
                    {format.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Scope */}
          <div>
            <Label className="text-base font-semibold">Export Scope</Label>
            <div className="flex gap-4 mt-2">
              {exportScopes.map((scope) => (
                <div key={scope.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`order-${scope.value}`}
                    checked={exportSettings.scope === scope.value}
                    onCheckedChange={() => setExportSettings({ ...exportSettings, scope: scope.value })}
                  />
                  <Label htmlFor={`order-${scope.value}`} className="cursor-pointer">
                    {scope.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Column Selection */}
          <div>
            <Label className="text-base font-semibold">Select Columns to Export</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {orderExportColumns.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`order-col-${column.key}`}
                    checked={exportSettings.columns.includes(column.key)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setExportSettings({
                          ...exportSettings,
                          columns: [...exportSettings.columns, column.key],
                        })
                      } else {
                        setExportSettings({
                          ...exportSettings,
                          columns: exportSettings.columns.filter((c) => c !== column.key),
                        })
                      }
                    }}
                  />
                  <Label htmlFor={`order-col-${column.key}`} className="cursor-pointer text-sm">
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setExportSettings({
                    ...exportSettings,
                    columns: orderExportColumns.map((c) => c.key),
                  })
                }
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExportSettings({ ...exportSettings, columns: [] })}
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div>
            <Label className="text-base font-semibold">Additional Filters</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {/* Amount Range */}
              <div>
                <Label className="text-sm font-medium">Amount Range</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    step="0.01"
                    value={exportSettings.filters.amountMin || ""}
                    onChange={(e) =>
                      setExportSettings({
                        ...exportSettings,
                        filters: {
                          ...exportSettings.filters,
                          amountMin: Number.parseFloat(e.target.value) || undefined,
                        },
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    step="0.01"
                    value={exportSettings.filters.amountMax || ""}
                    onChange={(e) =>
                      setExportSettings({
                        ...exportSettings,
                        filters: {
                          ...exportSettings.filters,
                          amountMax: Number.parseFloat(e.target.value) || undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <Label className="text-sm font-medium">Location Filter</Label>
                <Select
                  value={exportSettings.filters.location}
                  onValueChange={(value) =>
                    setExportSettings({
                      ...exportSettings,
                      filters: { ...exportSettings.filters, location: value },
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locationOptions.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <Label className="text-sm font-medium">Date From</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={exportSettings.filters.dateFrom?.toISOString().split("T")[0] || ""}
                  onChange={(e) =>
                    setExportSettings({
                      ...exportSettings,
                      filters: {
                        ...exportSettings.filters,
                        dateFrom: e.target.value ? new Date(e.target.value) : undefined,
                      },
                    })
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Date To</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={exportSettings.filters.dateTo?.toISOString().split("T")[0] || ""}
                  onChange={(e) =>
                    setExportSettings({
                      ...exportSettings,
                      filters: {
                        ...exportSettings.filters,
                        dateTo: e.target.value ? new Date(e.target.value) : undefined,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <Label className="text-base font-semibold">Export Preview</Label>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {previewCount} records will be exported with {exportSettings.columns.length} columns in{" "}
                {exportSettings.format.toUpperCase()} format.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onExport} disabled={exportSettings.columns.length === 0} className="gap-2">
            <Download className="h-4 w-4" />
            Export Orders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
