"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Inbox, BookOpen, FolderOpen, ExternalLink, Menu, X, GraduationCap, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

export function DashboardSidebar({ activeTab, onTabChange, className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigationItems = [
    {
      id: "inbox",
      label: "Inbox",
      icon: Inbox,
      badge: "3",
    },
    {
      id: "srs-review",
      label: "SRS Review",
      icon: BookOpen,
      badge: "12",
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderOpen,
    },
  ]

  const externalSites = [
    {
      label: "Khan Academy",
      url: "https://khanacademy.org",
      icon: GraduationCap,
    },
    {
      label: "Coursera",
      url: "https://coursera.org",
      icon: Users,
    },
  ]

  return (
    <Card
      className={cn(
        "h-full border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!isCollapsed && <h2 className="text-lg font-semibold text-balance">Learning Hub</h2>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2" role="navigation" aria-label="Main navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12 text-base font-medium",
                  isCollapsed && "justify-center px-2",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                )}
                onClick={() => onTabChange(item.id)}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs" aria-label={`${item.badge} items`}>
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            )
          })}
        </nav>

        {/* External Sites */}
        <div className="p-4 border-t border-sidebar-border">
          {!isCollapsed && <h3 className="text-sm font-medium text-sidebar-foreground/70 mb-3">External Resources</h3>}
          <div className="space-y-2">
            {externalSites.map((site) => {
              const Icon = site.icon

              return (
                <Button
                  key={site.label}
                  variant="outline"
                  className={cn("w-full justify-start gap-3 h-10 text-sm", isCollapsed && "justify-center px-2")}
                  onClick={() => window.open(site.url, "_blank", "noopener,noreferrer")}
                  aria-label={`Open ${site.label} in new tab`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{site.label}</span>
                      <ExternalLink className="h-3 w-3 ml-auto" aria-hidden="true" />
                    </>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
