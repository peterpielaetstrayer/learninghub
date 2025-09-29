"use client"

import { useState, useEffect } from "react"
import { Flashcard, type FlashcardData } from "./flashcard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BarChart3, Calendar, Target, Trophy, RefreshCw, Play, Download } from "lucide-react"
import { useSRSExport } from "@/hooks/use-srs-export"

// Mock SRS algorithm - in a real app, this would be more sophisticated
const calculateNextReview = (difficulty: "easy" | "medium" | "hard", reviewCount: number): Date => {
  const now = new Date()
  const intervals = {
    easy: [1, 3, 7, 14, 30, 90], // days
    medium: [1, 2, 5, 10, 21, 60],
    hard: [1, 1, 3, 7, 14, 30],
  }

  const interval = intervals[difficulty][Math.min(reviewCount, intervals[difficulty].length - 1)]
  const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000)
  return nextReview
}

// Mock flashcard data
const mockFlashcards: FlashcardData[] = [
  {
    id: "1",
    front: "What is the fundamental principle of quantum superposition?",
    back: "A quantum system can exist in multiple states simultaneously until it is measured, at which point it collapses to a single state.",
    category: "Physics",
    difficulty: "medium",
    nextReview: new Date(),
    reviewCount: 2,
  },
  {
    id: "2",
    front: "Who painted 'The Birth of Venus'?",
    back: "Sandro Botticelli painted 'The Birth of Venus' around 1484-1486 during the Italian Renaissance.",
    category: "Art",
    difficulty: "easy",
    nextReview: new Date(),
    reviewCount: 5,
  },
  {
    id: "3",
    front: "What is the derivative of sin(x)?",
    back: "The derivative of sin(x) is cos(x).",
    category: "Math",
    difficulty: "easy",
    nextReview: new Date(),
    reviewCount: 8,
  },
  {
    id: "4",
    front: "Explain the concept of proof by contradiction.",
    back: "Proof by contradiction assumes the opposite of what you want to prove, then shows this leads to a logical contradiction, thereby proving the original statement must be true.",
    category: "Math",
    difficulty: "hard",
    nextReview: new Date(),
    reviewCount: 1,
  },
  {
    id: "5",
    front: "What characterized Renaissance art techniques?",
    back: "Renaissance art was characterized by linear perspective, chiaroscuro lighting, anatomical accuracy, and realistic human representation.",
    category: "Art",
    difficulty: "medium",
    nextReview: new Date(),
    reviewCount: 3,
  },
]

export function SRSReview() {
  const [cards, setCards] = useState<FlashcardData[]>(mockFlashcards)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [reviewedToday, setReviewedToday] = useState(0)
  const [isReviewActive, setIsReviewActive] = useState(false)
  const [dailyGoal] = useState(20)
  const { exportCards, exporting } = useSRSExport()

  const dueCards = cards.filter((card) => card.nextReview <= new Date())
  const currentCard = dueCards[currentCardIndex]
  const progress = dueCards.length > 0 ? ((currentCardIndex + 1) / dueCards.length) * 100 : 0

  const handleCardRating = (cardId: string, rating: "easy" | "medium" | "hard") => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              difficulty: rating,
              nextReview: calculateNextReview(rating, card.reviewCount),
              reviewCount: card.reviewCount + 1,
            }
          : card,
      ),
    )

    setReviewedToday((prev) => prev + 1)

    // Move to next card
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
    } else {
      // Review session complete
      setIsReviewActive(false)
      setCurrentCardIndex(0)
    }
  }

  const startReview = () => {
    setIsReviewActive(true)
    setCurrentCardIndex(0)
  }

  const resetReview = () => {
    setIsReviewActive(false)
    setCurrentCardIndex(0)
  }

  const getStreakData = () => {
    // Mock streak data
    return {
      current: 7,
      longest: 23,
      thisWeek: 5,
    }
  }

  const streakData = getStreakData()

  if (!isReviewActive) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-balance">Spaced Repetition Review</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Strengthen your memory with scientifically-proven spaced repetition
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Due Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dueCards.length}</div>
              <p className="text-xs text-muted-foreground">cards ready for review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-500" />
                Daily Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviewedToday}</div>
              <p className="text-xs text-muted-foreground">of {dailyGoal} goal</p>
              <Progress value={(reviewedToday / dailyGoal) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streakData.current}</div>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                Total Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cards.length}</div>
              <p className="text-xs text-muted-foreground">in your collection</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4">
          {dueCards.length > 0 ? (
            <Button onClick={startReview} size="lg" className="gap-2 text-lg px-8 py-6">
              <Play className="h-5 w-5" />
              Start Review Session
            </Button>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">All caught up!</h3>
              <p className="text-muted-foreground">No cards are due for review right now.</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={exportCards} 
              disabled={exporting}
              variant="outline" 
              className="gap-2 bg-transparent"
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export to Anki'}
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <BarChart3 className="h-4 w-4" />
                  View Statistics
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Review Statistics</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{streakData.current}</div>
                    <div className="text-sm text-muted-foreground">Current Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{streakData.longest}</div>
                    <div className="text-sm text-muted-foreground">Longest Streak</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{streakData.thisWeek}</div>
                  <div className="text-sm text-muted-foreground">Reviews This Week</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Categories</div>
                  {["Math", "Physics", "Art"].map((category) => {
                    const categoryCards = cards.filter((card) => card.category === category)
                    return (
                      <div key={category} className="flex justify-between text-sm">
                        <span>{category}</span>
                        <Badge variant="secondary">{categoryCards.length}</Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Review Session</h2>
          <p className="text-muted-foreground">
            Card {currentCardIndex + 1} of {dueCards.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={resetReview} className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Current Flashcard */}
      {currentCard && <Flashcard card={currentCard} onRate={handleCardRating} />}
    </div>
  )
}
