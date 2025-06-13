"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tags, Save, Plus } from "lucide-react"
import type { Shop } from "../../types"
import { tagOptions } from "../../data/constants"
import { getStatusColor, getTagColor } from "../../utils/colors"

interface BatchTagsEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (updatedTags: { [shopId: number]: string[] }) => void
  selectedShops: Shop[]
}

export function BatchTagsEditModal({ isOpen, onClose, onSave, selectedShops }: BatchTagsEditModalProps) {
  const [shopTags, setShopTags] = useState<{ [shopId: number]: string[] }>(() => {
    const initialTags: { [shopId: number]: string[] } = {}
    selectedShops.forEach((shop) => {
      initialTags[shop.id] = [...shop.tags]
    })
    return initialTags
  })

  const [bulkAction, setBulkAction] = useState<"add" | "remove" | "replace">("add")
  const [selectedBulkTags, setSelectedBulkTags] = useState<string[]>([])

  const handleTagToggle = (shopId: number, tag: string, checked: boolean) => {
    setShopTags((prev) => {
      const currentTags = prev[shopId] || []
      if (checked) {
        return {
          ...prev,
          [shopId]: [...currentTags, tag],
        }
      } else {
        return {
          ...prev,
          [shopId]: currentTags.filter((t) => t !== tag),
        }
      }
    })
  }

  const applyBulkTagAction = () => {
    if (selectedBulkTags.length === 0) return

    setShopTags((prev) => {
      const updated = { ...prev }
      selectedShops.forEach((shop) => {
        const currentTags = shop.tags
        switch (bulkAction) {
          case "add":
            // Add tags that aren't already present
            const tagsToAdd = selectedBulkTags.filter((tag) => !currentTags.includes(tag))
            updated[shop.id] = [...currentTags, ...tagsToAdd]
            break
          case "remove":
            // Remove selected tags
            updated[shop.id] = currentTags.filter((tag) => !selectedBulkTags.includes(tag))
            break
          case "replace":
            // Replace all tags with selected tags
            updated[shop.id] = [...selectedBulkTags]
            break
        }
      })
      return updated
    })
  }

  const handleSave = () => {
    onSave(shopTags)
    onClose()
  }

  const resetTags = () => {
    const resetTags: { [shopId: number]: string[] } = {}
    selectedShops.forEach((shop) => {
      resetTags[shop.id] = [...shop.tags]
    })
    setShopTags(resetTags)
  }

  const handleBulkTagToggle = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedBulkTags([...selectedBulkTags, tag])
    } else {
      setSelectedBulkTags(selectedBulkTags.filter((t) => t !== tag))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Batch Edit Tags ({selectedShops.length} shops)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bulk Tag Actions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Bulk Tag Actions (Optional)</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bulk-action">Action</Label>
                  <select
                    id="bulk-action"
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value as "add" | "remove" | "replace")}
                    className="w-full p-2 border border-border rounded-md"
                  >
                    <option value="add">Add tags to all shops</option>
                    <option value="remove">Remove tags from all shops</option>
                    <option value="replace">Replace all tags with selected</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label>Select Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2 p-3 border border-border rounded-md bg-card max-h-32 overflow-y-auto">
                    {tagOptions.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`bulk-${tag}`}
                          checked={selectedBulkTags.includes(tag)}
                          onCheckedChange={(checked) => handleBulkTagToggle(tag, checked as boolean)}
                        />
                        <Label htmlFor={`bulk-${tag}`} className="text-sm cursor-pointer">
                          <Badge variant="secondary" className={`${getTagColor(tag)} text-xs`}>
                            {tag}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={applyBulkTagAction}
                  disabled={selectedBulkTags.length === 0}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Apply {bulkAction} to All Shops
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedBulkTags([])}
                  disabled={selectedBulkTags.length === 0}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              This will {bulkAction} the selected tags{" "}
              {bulkAction === "add" ? "to" : bulkAction === "remove" ? "from" : "for"} all selected shops
            </p>
          </div>

          {/* Individual Tag Editing */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-foreground">Individual Tag Editing</h4>
              <Button type="button" variant="outline" size="sm" onClick={resetTags}>
                Reset All
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedShops.map((shop) => (
                <div key={shop.id} className="p-4 border border-border rounded-lg bg-card">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-medium">{shop.shopId}</span>
                    <Badge className={getStatusColor(shop.status)}>{shop.status}</Badge>
                    <span className="text-sm text-muted-foreground">{shop.clientName}</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Original Tags:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {shop.tags.length > 0 ? (
                          shop.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className={`${getTagColor(tag)} text-xs`}>
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No tags</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">New Tags:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tagOptions.map((tag) => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${shop.id}-${tag}`}
                              checked={shopTags[shop.id]?.includes(tag) || false}
                              onCheckedChange={(checked) => handleTagToggle(shop.id, tag, checked as boolean)}
                            />
                            <Label htmlFor={`${shop.id}-${tag}`} className="text-sm cursor-pointer">
                              <Badge variant="secondary" className={`${getTagColor(tag)} text-xs`}>
                                {tag}
                              </Badge>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Show changes */}
                    {JSON.stringify(shopTags[shop.id]?.sort()) !== JSON.stringify(shop.tags.sort()) && (
                      <div className="pt-2 border-t border-border">
                        <Label className="text-sm font-medium text-muted-foreground">Preview Changes:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {shopTags[shop.id]?.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className={`${getTagColor(tag)} text-xs ${
                                !shop.tags.includes(tag) ? "ring-2 ring-green-400" : ""
                              }`}
                            >
                              {tag}
                              {!shop.tags.includes(tag) && <span className="ml-1 text-green-600">+</span>}
                            </Badge>
                          ))}
                          {shop.tags
                            .filter((tag) => !shopTags[shop.id]?.includes(tag))
                            .map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs line-through opacity-50 ring-2 ring-red-400"
                              >
                                {tag}
                                <span className="ml-1 text-red-600">-</span>
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
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
                <span className="text-muted-foreground">Shops with Changes:</span>
                <p className="font-semibold">
                  {
                    selectedShops.filter(
                      (shop) => JSON.stringify(shopTags[shop.id]?.sort()) !== JSON.stringify(shop.tags.sort()),
                    ).length
                  }
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Most Common Tag:</span>
                <p className="font-semibold">
                  {(() => {
                    const tagCounts: { [tag: string]: number } = {}
                    Object.values(shopTags).forEach((tags) => {
                      tags?.forEach((tag) => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1
                      })
                    })
                    const mostCommon = Object.entries(tagCounts).sort(([, a], [, b]) => b - a)[0]
                    return mostCommon ? `${mostCommon[0]} (${mostCommon[1]})` : "None"
                  })()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Unique Tags:</span>
                <p className="font-semibold">
                  {
                    new Set(
                      Object.values(shopTags)
                        .flat()
                        .filter((tag) => tag),
                    ).size
                  }
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
