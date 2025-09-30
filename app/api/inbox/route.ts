import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, title, selection, screenshotDataUrl } = body;

    if (!url && !title) {
      return NextResponse.json(
        { error: 'URL or title is required' },
        { status: 400 }
      );
    }

    // Check usage limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        subscriptionPlan: true, 
        itemsCount: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has reached their limit
    const planLimits = {
      free: { itemsPerMonth: 10 },
      pro: { itemsPerMonth: -1 }, // unlimited
      enterprise: { itemsPerMonth: -1 }, // unlimited
    };

    const limit = planLimits[user.subscriptionPlan as keyof typeof planLimits]?.itemsPerMonth;
    if (limit > 0 && user.itemsCount >= limit) {
      return NextResponse.json(
        { 
          error: 'Usage limit reached', 
          message: 'Upgrade your plan to add more items',
          upgradeRequired: true 
        },
        { status: 403 }
      );
    }

    const itemId = uuidv4();
    let rawImagePath: string | undefined;

    // Handle screenshot if provided
    if (screenshotDataUrl) {
      try {
        // Ensure captures directory exists
        const capturesDir = join(process.cwd(), 'public', 'captures');
        await mkdir(capturesDir, { recursive: true });

        // Save screenshot
        const base64Data = screenshotDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `${itemId}.png`;
        const filepath = join(capturesDir, filename);
        
        await writeFile(filepath, buffer);
        rawImagePath = `/captures/${filename}`;
      } catch (error) {
        console.error('Failed to save screenshot:', error);
        // Continue without screenshot
      }
    }

    // Create item
    const item = await prisma.item.create({
      data: {
        id: itemId,
        url,
        title,
        rawText: selection,
        rawImagePath,
        source: 'browser_extension',
        userId: session.user.id,
      },
    });

    // Update user's item count
    await prisma.user.update({
      where: { id: session.user.id },
      data: { itemsCount: { increment: 1 } },
    });

    return NextResponse.json({ id: itemId });
  } catch (error) {
    console.error('Error creating inbox item:', error);
    return NextResponse.json(
      { error: 'Failed to create inbox item' },
      { status: 500 }
    );
  }
}
