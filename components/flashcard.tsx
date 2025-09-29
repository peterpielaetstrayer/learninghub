"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FlashcardData {
  id: string
  front: string
  back: string
  category: string
  difficulty: "easy" | "medium" | "hard"
  nextReview: Date
  reviewCount: number
}

interface FlashcardProps {
  card: FlashcardData
  onRate: (cardId: string, rating: "easy" | "medium" | "hard") => void
  className?: string
}

export function Flashcard({ card, onRate, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleFlip = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      setIsFlipped(!isFlipped)
      setIsAnimating(false)
    }, 150)
  }

  const handleRate = (rating: "easy" | "medium" | "hard") => {
    onRate(card.id, rating)
    setIsFlipped(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <Card
        className={cn(
          "relative h-80 cursor-pointer transition-all duration-300 hover:shadow-lg",
          "transform-gpu perspective-1000",
          isAnimating && "scale-95",
        )}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? "Show front of flashcard" : "Show back of flashcard"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleFlip()
          }
        }}
      >
        <CardContent className="h-full p-0 relative overflow-hidden">
          {/* Front Side */}
          <div
            className={cn(
              "absolute inset-0 p-6 flex flex-col justify-between transition-all duration-300",
              "backface-hidden",
              isFlipped && "opacity-0 rotate-y-180",
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <Badge variant="secondary" className={getDifficultyColor(card.difficulty)}>
                {card.difficulty}
              </Badge>
              <Badge variant="outline">{card.category}</Badge>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <p className="text-xl font-medium text-center leading-relaxed text-balance">{card.front}</p>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Review #{card.reviewCount + 1}</span>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>Click to reveal</span>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div
            className={cn(
              "absolute inset-0 p-6 flex flex-col justify-between transition-all duration-300",
              "backface-hidden rotate-y-180 bg-accent/20",
              !isFlipped && "opacity-0",
              isFlipped && "rotate-y-0",
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <Badge variant="secondary" className={getDifficultyColor(card.difficulty)}>
                {card.difficulty}
              </Badge>
              <Badge variant="outline">{card.category}</Badge>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg leading-relaxed text-center text-balance">{card.back}</p>
            </div>

            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                <span>Click to flip back</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Buttons - Only show when flipped */}
      {isFlipped && (
        <div className="mt-6 flex justify-center gap-3">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              handleRate("hard")
            }}
            variant="outline"
            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
          >
            Hard
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              handleRate("medium")
            }}
            variant="outline"
            className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300 dark:hover:bg-yellow-900/30"
          >
            Medium
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              handleRate("easy")
            }}
            variant="outline"
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/30"
          >
            Easy
          </Button>
        </div>
      )}
    </div>
  )
}
