"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Calendar, Tag, BookOpen, Zap } from "lucide-react"

export interface FilterOptions {
  categories: string[]
  contentTypes: string[]
  processed: boolean | null
  dateRange: "all" | "today" | "week" | "month"
  difficulty: string[]
  hasFlashcards: boolean | null
  reviewCount: [number, number]
}

interface AdvancedFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  availableCategories: string[]
}

export function AdvancedFilters({ filters, onFiltersChange, availableCategories }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      contentTypes: [],
      processed: null,
      dateRange: "all",
      difficulty: [],
      hasFlashcards: null,
      reviewCount: [0, 20],
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.categories.length > 0) count++
    if (filters.contentTypes.length > 0) count++
    if (filters.processed !== null) count++
    if (filters.dateRange !== "all") count++
    if (filters.difficulty.length > 0) count++
    if (filters.hasFlashcards !== null) count++
    if (filters.reviewCount[0] > 0 || filters.reviewCount[1] < 20) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent relative">
          <Filter className="h-4 w-4" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </CardTitle>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 px-2 text-xs">
                    Clear All
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 w-7 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categories */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Categories
              </Label>
              <div className="space-y-2">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter("categories", [...filters.categories, category])
                        } else {
                          updateFilter(
                            "categories",
                            filters.categories.filter((c) => c !== category),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Types */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Content Type
              </Label>
              <div className="space-y-2">
                {["text", "image"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.contentTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter("contentTypes", [...filters.contentTypes, type])
                        } else {
                          updateFilter(
                            "contentTypes",
                            filters.contentTypes.filter((t) => t !== type),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={`type-${type}`} className="text-sm capitalize">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Processing Status */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Processing Status
              </Label>
              <Select
                value={filters.processed === null ? "all" : filters.processed ? "processed" : "unprocessed"}
                onValueChange={(value) => {
                  updateFilter("processed", value === "all" ? null : value === "processed")
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="processed">Processed Only</SelectItem>
                  <SelectItem value="unprocessed">Unprocessed Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Added
              </Label>
              <Select value={filters.dateRange} onValueChange={(value: any) => updateFilter("dateRange", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Difficulty Level</Label>
              <div className="space-y-2">
                {["easy", "medium", "hard"].map((difficulty) => (
                  <div key={difficulty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`difficulty-${difficulty}`}
                      checked={filters.difficulty.includes(difficulty)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter("difficulty", [...filters.difficulty, difficulty])
                        } else {
                          updateFilter(
                            "difficulty",
                            filters.difficulty.filter((d) => d !== difficulty),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={`difficulty-${difficulty}`} className="text-sm capitalize">
                      {difficulty}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Has Flashcards */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Flashcards</Label>
              <Select
                value={filters.hasFlashcards === null ? "all" : filters.hasFlashcards ? "with" : "without"}
                onValueChange={(value) => {
                  updateFilter("hasFlashcards", value === "all" ? null : value === "with")
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="with">With Flashcards</SelectItem>
                  <SelectItem value="without">Without Flashcards</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Review Count Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Review Count: {filters.reviewCount[0]} - {filters.reviewCount[1]}
              </Label>
              <Slider
                value={filters.reviewCount}
                onValueChange={(value) => updateFilter("reviewCount", value as [number, number])}
                max={20}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
