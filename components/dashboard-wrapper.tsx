'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  Brain, 
  Download, 
  Plus, 
  Settings, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface DashboardStats {
  itemsCount: number
  cardsCount: number
  processedItems: number
  recentActivity: Array<{
    id: string
    title: string
    type: 'item' | 'card' | 'process'
    createdAt: string
  }>
}

export function DashboardWrapper() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const planLimits = {
    free: { itemsPerMonth: 10, cardsTotal: 50 },
    pro: { itemsPerMonth: -1, cardsTotal: -1 },
    enterprise: { itemsPerMonth: -1, cardsTotal: -1 },
  }

  const currentPlan = session.user.subscriptionPlan || 'free'
  const limits = planLimits[currentPlan as keyof typeof planLimits]

  const itemsUsage = limits.itemsPerMonth === -1 
    ? 100 
    : (session.user.itemsCount || 0) / limits.itemsPerMonth * 100

  const cardsUsage = limits.cardsTotal === -1 
    ? 100 
    : (session.user.cardsCount || 0) / limits.cardsTotal * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">LearningHub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'}>
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name || 'Learner'}!
          </h2>
          <p className="mt-2 text-gray-600">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session.user.itemsCount || 0}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Progress value={itemsUsage} className="flex-1" />
                <span>
                  {limits.itemsPerMonth === -1 ? '∞' : `${session.user.itemsCount || 0}/${limits.itemsPerMonth}`}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flashcards</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session.user.cardsCount || 0}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Progress value={cardsUsage} className="flex-1" />
                <span>
                  {limits.cardsTotal === -1 ? '∞' : `${session.user.cardsCount || 0}/${limits.cardsTotal}`}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.processedItems || 0}</div>
              <p className="text-xs text-muted-foreground">
                AI-processed items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {session.user.subscriptionStatus === 'active' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {session.user.subscriptionStatus || 'Active'}
              </div>
              <p className="text-xs text-muted-foreground">
                Subscription status
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with your learning workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" onClick={() => router.push('/inbox')}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Item
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/review')}>
                <Brain className="w-4 h-4 mr-2" />
                Review Flashcards
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/export')}>
                <Download className="w-4 h-4 mr-2" />
                Export to Anki
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest learning activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentActivity?.length ? (
                <div className="space-y-3">
                  {stats.recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Prompt for Free Users */}
        {currentPlan === 'free' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Upgrade to Pro</CardTitle>
              <CardDescription className="text-blue-700">
                Unlock unlimited items, advanced AI processing, and more features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/pricing')} className="bg-blue-600 hover:bg-blue-700">
                View Pricing Plans
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
