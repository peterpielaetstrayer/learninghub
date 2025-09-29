"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Search, TrendingUp } from "lucide-react"

interface SearchSuggestionsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  recentSearches: string[]
  popularSearches: string[]
}

export function SearchSuggestions({
  searchQuery,
  onSearchChange,
  recentSearches,
  popularSearches,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Mock search suggestions based on query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const mockSuggestions = [
        "quantum physics fundamentals",
        "quantum mechanics",
        "quantum computing",
        "renaissance art techniques",
        "renaissance history",
        "mathematical proofs",
        "math formulas",
        "physics equations",
        "art history timeline",
        "science concepts",
      ].filter(
        (suggestion) => suggestion.toLowerCase().includes(searchQuery.toLowerCase()) && suggestion !== searchQuery,
      )

      setSuggestions(mockSuggestions.slice(0, 5))
      setShowSuggestions(mockSuggestions.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery])

  if (!showSuggestions && recentSearches.length === 0 && searchQuery.length === 0) {
    return null
  }

  return (
    <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
      <CardContent className="p-0">
        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="p-3 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Suggestions</span>
            </div>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-8 px-2 text-sm"
                  onClick={() => {
                    onSearchChange(suggestion)
                    setShowSuggestions(false)
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && searchQuery.length === 0 && (
          <div className="p-3 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Recent</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {recentSearches.slice(0, 5).map((search, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-accent text-xs"
                  onClick={() => onSearchChange(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Popular Searches */}
        {popularSearches.length > 0 && searchQuery.length === 0 && (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Popular</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {popularSearches.slice(0, 5).map((search, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent text-xs"
                  onClick={() => onSearchChange(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
