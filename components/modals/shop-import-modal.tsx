"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react"
import type { Shop } from "../../types"

interface ShopImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (shops: Omit<Shop, "id">[]) => void
  existingShops: Shop[]
}

interface ParsedShop {
  shopId: string
  clientName: string
  status: "Active" | "On Hold" | "Inactive"
  tags: string[]
  creditScore: number
  balance: number
  isValid: boolean
  errors: string[]
  isDuplicate: boolean
}

export function ShopImportModal({ isOpen, onClose, onImport, existingShops }: ShopImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedShop[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<"upload" | "preview">("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      processFile(selectedFile)
    } else {
      alert("Please select a valid CSV file")
    }
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length === 0) {
        alert("CSV file is empty")
        setIsProcessing(false)
        return
      }

      // Parse header
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
      const dataLines = lines.slice(1)

      const parsed: ParsedShop[] = dataLines.map((line, index) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
        const shop: ParsedShop = {
          shopId: "",
          clientName: "",
          status: "Active",
          tags: [],
          creditScore: 0,
          balance: 0,
          isValid: true,
          errors: [],
          isDuplicate: false,
        }

        // Map CSV columns to shop properties
        headers.forEach((header, i) => {
          const value = values[i] || ""

          switch (header) {
            case "shopid":
            case "shop_id":
            case "shop id":
              shop.shopId = value
              break
            case "client":
            case "clientname":
            case "client_name":
            case "client name":
              shop.clientName = value
              break
            case "status":
              if (["Active", "On Hold", "Inactive"].includes(value)) {
                shop.status = value as "Active" | "On Hold" | "Inactive"
              }
              break
            case "tags":
              if (value) {
                shop.tags = value
                  .split(";")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag)
              }
              break
            case "creditscore":
            case "credit_score":
            case "credit score":
              const creditScore = Number.parseInt(value)
              if (!isNaN(creditScore) && creditScore >= 0 && creditScore <= 100) {
                shop.creditScore = creditScore
              }
              break
            case "balance":
              const balance = Number.parseFloat(value)
              if (!isNaN(balance)) {
                shop.balance = balance
              }
              break
          }
        })

        // Validation
        if (!shop.shopId) {
          shop.errors.push("Shop ID is required")
          shop.isValid = false
        }

        if (!shop.clientName) {
          shop.errors.push("Client name is required")
          shop.isValid = false
        }

        // Check for duplicates in existing shops
        if (shop.shopId && existingShops.some((existing) => existing.shopId === shop.shopId)) {
          shop.isDuplicate = true
          shop.errors.push("Shop ID already exists")
          shop.isValid = false
        }

        return shop
      })

      setParsedData(parsed)
      setStep("preview")
    } catch (error) {
      console.error("Error processing file:", error)
      alert("Error processing CSV file. Please check the format.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = () => {
    const validShops = parsedData.filter((shop) => shop.isValid && !shop.isDuplicate)
    const shopsToImport = validShops.map((shop) => ({
      shopId: shop.shopId,
      clientName: shop.clientName,
      status: shop.status,
      tags: shop.tags,
      creditScore: shop.creditScore,
      balance: shop.balance,
    }))

    onImport(shopsToImport)
    handleClose()
  }

  const handleClose = () => {
    setFile(null)
    setParsedData([])
    setStep("upload")
    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  const validCount = parsedData.filter((shop) => shop.isValid && !shop.isDuplicate).length
  const errorCount = parsedData.filter((shop) => !shop.isValid).length
  const duplicateCount = parsedData.filter((shop) => shop.isDuplicate).length

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-card-foreground">
            <Upload className="h-5 w-5" />
            Import Shops from CSV
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">Instructions</h3>

              <Alert className="border-border bg-accent">
                <FileText className="h-4 w-4" />
                <AlertDescription className="text-accent-foreground">
                  <strong>CSV Format Requirements:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>
                      <strong>Required columns:</strong> shopid, client (or clientname)
                    </li>
                    <li>
                      <strong>Optional columns:</strong> status, tags, creditscore (or credit_score), balance
                    </li>
                    <li>
                      <strong>Tags format:</strong> Separate multiple tags with semicolons (;)
                    </li>
                    <li>
                      <strong>Status values:</strong> Active, On Hold, or Inactive (defaults to Active)
                    </li>
                    <li>
                      <strong>Credit Score:</strong> Number between 0-100 (defaults to 0)
                    </li>
                    <li>
                      <strong>Balance:</strong> Decimal number (defaults to 0)
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg border border-border">
                <h4 className="font-medium mb-2 text-muted-foreground">Example CSV Format:</h4>
                <pre className="text-sm bg-background p-3 rounded border border-border text-foreground overflow-x-auto">
                  {`shopid,client,status,tags,creditscore,balance
SH001,John's Electronics,Active,New Shop;VIP,85,15000.50
SH002,Mary's Boutique,On Hold,With Loan;Old Client,72,-2500.00
SH003,Tech Solutions Inc,Active,VIP;No Product,78,8750.25`}
                </pre>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">Upload CSV File</h3>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-card-foreground">
                    {file ? file.name : "Choose a CSV file to upload"}
                  </p>
                  <p className="text-sm text-muted-foreground">Select a CSV file containing shop data to import</p>
                </div>

                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="mt-4 max-w-xs mx-auto bg-background border-border text-foreground"
                />
              </div>

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Processing CSV file...
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-green-300">Valid Records</span>
                </div>
                <p className="text-2xl font-bold text-green-400 mt-1">{validCount}</p>
              </div>

              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <span className="font-medium text-red-300">Errors</span>
                </div>
                <p className="text-2xl font-bold text-red-400 mt-1">{errorCount}</p>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5 text-yellow-400" />
                  <span className="font-medium text-yellow-300">Duplicates</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{duplicateCount}</p>
              </div>
            </div>

            {/* Preview Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">Preview ({parsedData.length} records)</h3>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-card-foreground">Status</TableHead>
                        <TableHead className="text-card-foreground">Shop ID</TableHead>
                        <TableHead className="text-card-foreground">Client Name</TableHead>
                        <TableHead className="text-card-foreground">Status</TableHead>
                        <TableHead className="text-card-foreground">Tags</TableHead>
                        <TableHead className="text-card-foreground">Credit Score</TableHead>
                        <TableHead className="text-card-foreground">Balance</TableHead>
                        <TableHead className="text-card-foreground">Issues</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.map((shop, index) => (
                        <TableRow key={index} className="border-border">
                          <TableCell>
                            {shop.isValid && !shop.isDuplicate ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : shop.isDuplicate ? (
                              <X className="h-4 w-4 text-yellow-400" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-400" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{shop.shopId}</TableCell>
                          <TableCell className="text-foreground">{shop.clientName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                              {shop.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {shop.tags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs border-border text-foreground">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">{shop.creditScore}</TableCell>
                          <TableCell className={`font-medium ${shop.balance < 0 ? "text-red-400" : "text-foreground"}`}>
                            ${shop.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            {shop.errors.length > 0 && (
                              <div className="space-y-1">
                                {shop.errors.map((error, i) => (
                                  <Badge
                                    key={i}
                                    variant="destructive"
                                    className="text-xs bg-destructive text-destructive-foreground"
                                  >
                                    {error}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-border pt-4">
          {step === "upload" && (
            <Button onClick={handleClose} variant="outline" className="border-border text-foreground">
              Cancel
            </Button>
          )}

          {step === "preview" && (
            <>
              <Button onClick={() => setStep("upload")} variant="outline" className="border-border text-foreground">
                Back
              </Button>
              <Button onClick={handleClose} variant="outline" className="border-border text-foreground">
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={validCount === 0}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Import {validCount} Shop{validCount !== 1 ? "s" : ""}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
