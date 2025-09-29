"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningUpdate {
  summary: string;
  question: string;
  next_step: string;
}

interface LearningOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onSaveAsCard?: (data: LearningUpdate) => void;
  onSnooze?: () => void;
  className?: string;
}

export function LearningOverlay({ 
  isVisible, 
  onClose, 
  onSaveAsCard, 
  onSnooze,
  className 
}: LearningOverlayProps) {
  const [currentUpdate, setCurrentUpdate] = useState<LearningUpdate | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });

  // Listen for learning updates from WebSocket
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleLearningUpdate = (event: CustomEvent) => {
        setCurrentUpdate(event.detail);
      };

      window.addEventListener('learning-update', handleLearningUpdate as EventListener);
      return () => {
        window.removeEventListener('learning-update', handleLearningUpdate as EventListener);
      };
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, onClose]);

  const handleSaveAsCard = () => {
    if (currentUpdate && onSaveAsCard) {
      onSaveAsCard(currentUpdate);
    }
  };

  const handleSnooze = () => {
    if (onSnooze) {
      onSnooze();
    }
    onClose();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - 175, // Half of overlay width
        y: e.clientY - 50,  // Half of overlay height
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed z-50 w-80 max-h-96 bg-background border-2 border-primary rounded-lg shadow-2xl",
        "cursor-move select-none",
        className
      )}
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Learning Mode
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Close learning overlay"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 max-h-80 overflow-y-auto">
          {currentUpdate ? (
            <>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Summary</h4>
                  <p className="text-sm leading-relaxed bg-accent/50 rounded-lg p-3">
                    {currentUpdate.summary}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Question</h4>
                  <p className="text-sm leading-relaxed bg-accent/50 rounded-lg p-3">
                    {currentUpdate.question}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Next Step</h4>
                  <p className="text-sm leading-relaxed bg-accent/50 rounded-lg p-3">
                    {currentUpdate.next_step}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSaveAsCard}
                  size="sm"
                  className="flex-1 gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save as Card
                </Button>
                <Button
                  onClick={handleSnooze}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Snooze 10m
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                <Zap className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Analyzing page content...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
