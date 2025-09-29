"use client"

import { useState, useMemo } from "react"
import { InboxCard, type InboxItem } from "./inbox-card"
import { AdvancedFilters, type FilterOptions } from "./advanced-filters"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, ImageIcon, ArrowUpDown } from "lucide-react"
import { useItems } from "@/hooks/use-items"
import { useProcessing } from "@/hooks/use-processing"

interface InboxViewProps {
  searchQuery: string
  selectedCategory: string | null
}

// Helper function to convert API data to InboxItem format
function convertToInboxItem(apiItem: any): InboxItem {
  const tags = apiItem.tags ? JSON.parse(apiItem.tags) : [];
  const cards = apiItem.srs ? JSON.parse(apiItem.srs) : [];
  
  return {
    id: apiItem.id,
    title: apiItem.title || 'Untitled',
    content: apiItem.raw_text || '',
    contentType: apiItem.raw_image_path ? 'image' : 'text',
    imageUrl: apiItem.raw_image_path,
    summary: apiItem.summary || '',
    tags,
    flashcards: cards.map((card: any, index: number) => ({
      id: `${apiItem.id}-card-${index}`,
      front: card.front,
      back: card.back,
    })),
    createdAt: new Date(apiItem.created_at),
    processed: !!apiItem.summary,
  };
}

export function InboxView({ searchQuery, selectedCategory }: InboxViewProps) {
  const { items: apiItems, loading, error, refetch } = useItems({
    searchQuery,
    tag: selectedCategory || undefined,
  });
  
  const { processItem, isProcessing } = useProcessing();
  
  // Convert API items to InboxItem format
  const items = apiItems.map(convertToInboxItem);
  const [sortBy, setSortBy] = useState<"date" | "title" | "category">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    contentTypes: [],
    processed: null,
    dateRange: "all",
    difficulty: [],
    hasFlashcards: null,
    reviewCount: [0, 20],
  })

  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter((item) => {
      // Basic search
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Category filter (from header)
      const matchesCategory =
        selectedCategory === null || item.tags.some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase())

      // Advanced filters
      const matchesAdvancedCategories =
        filters.categories.length === 0 ||
        filters.categories.some((cat) => item.tags.some((tag) => tag.toLowerCase() === cat.toLowerCase()))

      const matchesContentTypes = filters.contentTypes.length === 0 || filters.contentTypes.includes(item.contentType)

      const matchesProcessed = filters.processed === null || item.processed === filters.processed

      const matchesDateRange = (() => {
        if (filters.dateRange === "all") return true
        const now = new Date()
        const itemDate = item.createdAt
        switch (filters.dateRange) {
          case "today":
            return itemDate.toDateString() === now.toDateString()
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return itemDate >= weekAgo
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return itemDate >= monthAgo
          default:
            return true
        }
      })()

      const matchesHasFlashcards =
        filters.hasFlashcards === null ||
        (filters.hasFlashcards ? item.flashcards.length > 0 : item.flashcards.length === 0)

      return (
        matchesSearch &&
        matchesCategory &&
        matchesAdvancedCategories &&
        matchesContentTypes &&
        matchesProcessed &&
        matchesDateRange &&
        matchesHasFlashcards
      )
    })

    // Sort items
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "date":
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "category":
          comparison = (a.tags[0] || "").localeCompare(b.tags[0] || "")
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [items, searchQuery, selectedCategory, filters, sortBy, sortOrder])

  const handleUpdateItem = (id: string, updates: Partial<InboxItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const handleProcessItem = (id: string) => {
    processItem(id, {
      onSuccess: () => {
        refetch(); // Refresh the data after successful processing
      },
      onError: (error) => {
        console.error('Processing failed:', error);
        // You could add a toast notification here
      },
    });
  }

  const addNewItem = (type: "text" | "image") => {
    const newItem: InboxItem = {
      id: Date.now().toString(),
      title: `New ${type} item`,
      content: type === "text" ? "Add your content here..." : "",
      contentType: type,
      imageUrl: type === "image" ? "/sample-content.jpg" : undefined,
      summary: "AI-generated summary will appear here after processing.",
      tags: [],
      flashcards: [],
      createdAt: new Date(),
      processed: false,
    }
    setItems((prev) => [newItem, ...prev])
  }

  const availableCategories = Array.from(new Set(items.flatMap((item) => item.tags)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-balance">Knowledge Inbox</h2>
          <p className="text-muted-foreground mt-1">
            {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? "item" : "items"}
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedCategory && ` in ${selectedCategory}`}
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => addNewItem("text")} className="gap-2">
            <FileText className="h-4 w-4" />
            Add Text
          </Button>
          <Button onClick={() => addNewItem("image")} variant="outline" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Add Image
          </Button>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AdvancedFilters filters={filters} onFiltersChange={setFilters} availableCategories={availableCategories} />
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="gap-2 bg-transparent"
            aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortOrder === "asc" ? "A-Z" : "Z-A"}
          </Button>
        </div>
      </div>

      {/* Items Grid */}
      {filteredAndSortedItems.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {filteredAndSortedItems.map((item) => (
            <InboxCard 
              key={item.id} 
              item={item} 
              onUpdate={handleUpdateItem} 
              onProcess={handleProcessItem}
              isProcessing={isProcessing(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No items found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
            {searchQuery || selectedCategory || filters.categories.length > 0
              ? "Try adjusting your search or filter criteria."
              : "Start building your knowledge base by adding your first item."}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => addNewItem("text")} className="gap-2">
              <FileText className="h-4 w-4" />
              Add Text Content
            </Button>
            <Button onClick={() => addNewItem("image")} variant="outline" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Add Image Content
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
