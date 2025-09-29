"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Edit3, Zap, ImageIcon, FileText, Save, X, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InboxItem {
  id: string
  title: string
  content: string
  contentType: "text" | "image"
  imageUrl?: string
  summary: string
  tags: string[]
  flashcards: Array<{
    id: string
    front: string
    back: string
  }>
  createdAt: Date
  processed: boolean
}

interface InboxCardProps {
  item: InboxItem
  onUpdate: (id: string, updates: Partial<InboxItem>) => void
  onProcess: (id: string) => void
  isProcessing?: boolean
  className?: string
}

export function InboxCard({ item, onUpdate, onProcess, isProcessing = false, className }: InboxCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(item.title)
  const [editedSummary, setEditedSummary] = useState(item.summary)
  const [editedTags, setEditedTags] = useState(item.tags.join(", "))

  const handleSave = () => {
    onUpdate(item.id, {
      title: editedTitle,
      summary: editedSummary,
      tags: editedTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTitle(item.title)
    setEditedSummary(item.summary)
    setEditedTags(item.tags.join(", "))
    setIsEditing(false)
  }

  const handleProcess = () => {
    onProcess(item.id)
  }

  return (
    <Card className={cn("w-full transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-lg font-semibold mb-2"
                placeholder="Enter title..."
                aria-label="Edit title"
              />
            ) : (
              <h3 className="text-lg font-semibold leading-tight text-balance mb-2">{item.title}</h3>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {isEditing ? (
                <Input
                  value={editedTags}
                  onChange={(e) => setEditedTags(e.target.value)}
                  placeholder="Enter tags separated by commas..."
                  className="text-sm"
                  aria-label="Edit tags"
                />
              ) : (
                item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0" aria-label="Save changes">
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0 bg-transparent"
                  aria-label="Cancel editing"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0 bg-transparent"
                  aria-label="Edit item"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleProcess}
                  disabled={isProcessing || item.processed}
                  className="gap-2 h-8"
                  aria-label={item.processed ? "Already processed" : "Process with AI"}
                >
                  {isProcessing ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  {isProcessing ? "Processing..." : item.processed ? "Processed" : "Process"}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content Preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {item.contentType === "image" ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            <span>
              {item.contentType === "image" ? "Image Content" : "Text Content"} • {item.createdAt.toLocaleDateString()}
            </span>
          </div>

          {item.contentType === "image" && item.imageUrl ? (
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={item.imageUrl || "/placeholder.svg"}
                alt="Clipped content"
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm leading-relaxed line-clamp-3">{item.content}</p>
            </div>
          )}
        </div>

        {/* AI Summary */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">AI Summary</h4>
          {isEditing ? (
            <Textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              placeholder="Enter summary..."
              className="min-h-[80px] text-sm leading-relaxed"
              aria-label="Edit summary"
            />
          ) : (
            <p className="text-sm leading-relaxed bg-accent/50 rounded-lg p-3">{item.summary}</p>
          )}
        </div>

        {/* Flashcards */}
        {item.flashcards.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Generated Flashcards</h4>
            <Accordion type="single" collapsible className="w-full">
              {item.flashcards.map((flashcard, index) => (
                <AccordionItem key={flashcard.id} value={flashcard.id} className="border rounded-lg mb-2">
                  <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                    <span className="text-left">Flashcard {index + 1}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Front</div>
                        <div className="bg-card border rounded-lg p-3 text-sm leading-relaxed">{flashcard.front}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Back</div>
                        <div className="bg-accent/30 border rounded-lg p-3 text-sm leading-relaxed">
                          {flashcard.back}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
