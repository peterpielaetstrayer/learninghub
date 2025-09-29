import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, title, selection, screenshotDataUrl } = body;

    if (!url && !title) {
      return NextResponse.json(
        { error: 'URL or title is required' },
        { status: 400 }
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
    const result = dbHelpers.createItem({
      id: itemId,
      url,
      title,
      raw_text: selection,
      raw_image_path: rawImagePath,
      source: 'browser_extension',
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
