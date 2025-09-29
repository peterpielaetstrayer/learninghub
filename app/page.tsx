"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { AccessibilityPanel } from "@/components/accessibility-panel"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { SearchSuggestions } from "@/components/search-suggestions"
import { InboxView } from "@/components/inbox-view"
import { SRSReview } from "@/components/srs-review"
import { LearningOverlay } from "@/components/learning-overlay"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Search, Zap } from "lucide-react"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("inbox")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [learningModeActive, setLearningModeActive] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "quantum physics",
    "renaissance art",
    "mathematical proofs",
  ])
  const searchInputRef = useRef<HTMLInputElement>(null)

  const categories = ["Math", "History", "Science", "Language", "Art"]
  const popularSearches = ["physics", "math", "art", "history", "science"]

  const handleSearchFocus = () => {
    searchInputRef.current?.focus()
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (value.length > 0) {
      setShowSearchSuggestions(true)
    }
  }

  const handleSearchSubmit = (query: string) => {
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches((prev) => [query.trim(), ...prev.slice(0, 4)])
    }
    setShowSearchSuggestions(false)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="h-screen flex bg-background">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Sidebar */}
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} className="flex-shrink-0" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-2xl relative">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search your knowledge base..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit(searchQuery)
                    }
                    if (e.key === "Escape") {
                      setShowSearchSuggestions(false)
                    }
                  }}
                  className="pl-10 h-10 text-base"
                  aria-label="Search knowledge base"
                />
                {showSearchSuggestions && (
                  <SearchSuggestions
                    searchQuery={searchQuery}
                    onSearchChange={(query) => {
                      setSearchQuery(query)
                      handleSearchSubmit(query)
                    }}
                    recentSearches={recentSearches}
                    popularSearches={popularSearches}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={learningModeActive ? "default" : "outline"}
                size="sm"
                onClick={() => setLearningModeActive(!learningModeActive)}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                Learning Mode
              </Button>
              <KeyboardShortcuts onTabChange={setActiveTab} onSearch={handleSearchFocus} />
              <AccessibilityPanel />
              <ThemeToggle />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm font-medium text-muted-foreground">Categories:</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Category filters">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelectedCategory(selectedCategory === category ? null : category)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedCategory === category}
                  aria-label={`Filter by ${category} category`}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 p-6 overflow-auto" role="main">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3 mb-6" role="tablist">
              <TabsTrigger value="inbox" className="text-base" role="tab">
                Inbox
              </TabsTrigger>
              <TabsTrigger value="srs-review" className="text-base" role="tab">
                SRS Review
              </TabsTrigger>
              <TabsTrigger value="projects" className="text-base" role="tab">
                Projects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="mt-0 h-full" role="tabpanel">
              <InboxView searchQuery={searchQuery} selectedCategory={selectedCategory} />
            </TabsContent>

            <TabsContent value="srs-review" className="mt-0 h-full" role="tabpanel">
              <SRSReview />
            </TabsContent>

            <TabsContent value="projects" className="mt-0 h-full" role="tabpanel">
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-4 text-balance">Learning Projects</h2>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                  Organize your learning materials into structured projects.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Learning Mode Overlay */}
      <LearningOverlay
        isVisible={learningModeActive}
        onClose={() => setLearningModeActive(false)}
        onSaveAsCard={(data) => {
          // TODO: Implement save as card functionality
          console.log('Save as card:', data);
        }}
        onSnooze={() => {
          // TODO: Implement snooze functionality
          console.log('Snooze learning mode');
        }}
      />
    </div>
  )
}
