"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download } from "lucide-react"
import type { ExportSettings } from "../../types"
import { exportFormats, exportScopes, exportColumns, statusOptions, tagOptions } from "../../data/constants"

interface ShopExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: () => void
  exportSettings: ExportSettings
  setExportSettings: (settings: ExportSettings) => void
  previewCount: string
}

export function ShopExportModal({
  isOpen,
  onClose,
  onExport,
  exportSettings,
  setExportSettings,
  previewCount,
}: ShopExportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Shops - Advanced Options
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
                    id={format.value}
                    checked={exportSettings.format === format.value}
                    onCheckedChange={() => setExportSettings({ ...exportSettings, format: format.value })}
                  />
                  <Label htmlFor={format.value} className="cursor-pointer">
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
                    id={scope.value}
                    checked={exportSettings.scope === scope.value}
                    onCheckedChange={() => setExportSettings({ ...exportSettings, scope: scope.value })}
                  />
                  <Label htmlFor={scope.value} className="cursor-pointer">
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
              {exportColumns.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.key}
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
                  <Label htmlFor={column.key} className="cursor-pointer text-sm">
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
                    columns: exportColumns.map((c) => c.key),
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
              {/* Credit Score Range */}
              <div>
                <Label className="text-sm font-medium">Credit Score Range</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    min="0"
                    max="100"
                    value={exportSettings.filters.creditScoreMin}
                    onChange={(e) =>
                      setExportSettings({
                        ...exportSettings,
                        filters: {
                          ...exportSettings.filters,
                          creditScoreMin: Number.parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    min="0"
                    max="100"
                    value={exportSettings.filters.creditScoreMax}
                    onChange={(e) =>
                      setExportSettings({
                        ...exportSettings,
                        filters: {
                          ...exportSettings.filters,
                          creditScoreMax: Number.parseInt(e.target.value) || 100,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Balance Range */}
              <div>
                <Label className="text-sm font-medium">Balance Range</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    step="0.01"
                    value={exportSettings.filters.balanceMin || ""}
                    onChange={(e) =>
                      setExportSettings({
                        ...exportSettings,
                        filters: {
                          ...exportSettings.filters,
                          balanceMin: Number.parseFloat(e.target.value) || undefined,
                        },
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    step="0.01"
                    value={exportSettings.filters.balanceMax || ""}
                    onChange={(e) =>
                      setExportSettings({
                        ...exportSettings,
                        filters: {
                          ...exportSettings.filters,
                          balanceMax: Number.parseFloat(e.target.value) || undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <Label className="text-sm font-medium">Status Filter</Label>
                <Select
                  value={exportSettings.filters.status}
                  onValueChange={(value) =>
                    setExportSettings({
                      ...exportSettings,
                      filters: { ...exportSettings.filters, status: value },
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Filter */}
              <div>
                <Label className="text-sm font-medium">Tags Filter</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full mt-1 justify-start">
                      {exportSettings.filters.tags.length > 0
                        ? `${exportSettings.filters.tags.length} tag(s) selected`
                        : "Select tags"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {tagOptions.map((tag) => (
                      <DropdownMenuCheckboxItem
                        key={tag}
                        checked={exportSettings.filters.tags.includes(tag)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setExportSettings({
                              ...exportSettings,
                              filters: {
                                ...exportSettings.filters,
                                tags: [...exportSettings.filters.tags, tag],
                              },
                            })
                          } else {
                            setExportSettings({
                              ...exportSettings,
                              filters: {
                                ...exportSettings.filters,
                                tags: exportSettings.filters.tags.filter((t) => t !== tag),
                              },
                            })
                          }
                        }}
                      >
                        {tag}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
            Export Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
