import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's stats
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        itemsCount: true,
        cardsCount: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get processed items count
    const processedItems = await prisma.item.count({
      where: {
        userId: session.user.id,
        processed: true,
      },
    })

    // Get recent activity
    const recentItems = await prisma.item.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const recentCards = await prisma.card.findMany({
      where: {
        item: { userId: session.user.id },
      },
      select: {
        id: true,
        front: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const recentActivity = [
      ...recentItems.map(item => ({
        id: item.id,
        title: item.title || 'Untitled Item',
        type: 'item' as const,
        createdAt: item.createdAt.toISOString(),
      })),
      ...recentCards.map(card => ({
        id: card.id,
        title: card.front.substring(0, 50) + (card.front.length > 50 ? '...' : ''),
        type: 'card' as const,
        createdAt: card.createdAt.toISOString(),
      })),
    ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

    return NextResponse.json({
      itemsCount: user.itemsCount,
      cardsCount: user.cardsCount,
      processedItems,
      recentActivity,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
