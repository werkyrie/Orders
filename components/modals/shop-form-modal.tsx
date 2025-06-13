"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Shop } from "../../types"
import { statusOptions, tagOptions } from "../../data/constants"

interface ShopFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  formData: {
    shopId: string
    clientName: string
    status: "Active" | "On Hold" | "Inactive"
    tags: string[]
    creditScore: number
    balance: number
  }
  setFormData: (data: any) => void
  isEditing: boolean
}

export function ShopFormModal({ isOpen, onClose, onSubmit, formData, setFormData, isEditing }: ShopFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Shop" : "Add New Shop"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="shopId">Shop ID</Label>
            <Input
              id="shopId"
              type="text"
              value={formData.shopId}
              onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as Shop["status"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tagOptions.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag}
                    checked={formData.tags.includes(tag)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({ ...formData, tags: [...formData.tags, tag] })
                      } else {
                        setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
                      }
                    }}
                  />
                  <Label htmlFor={tag} className="text-sm">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="creditScore">Credit Score</Label>
            <Input
              id="creditScore"
              type="number"
              min="0"
              max="100"
              value={formData.creditScore}
              onChange={(e) => setFormData({ ...formData, creditScore: Number.parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div>
            <Label htmlFor="balance">Balance</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: Number.parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Update Shop" : "Add Shop"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
