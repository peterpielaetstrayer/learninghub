import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For now, return a simple status without WebSocket
    // WebSocket will be added later when needed
    return NextResponse.json({
      connected: false,
      message: 'WebSocket not available in standard Next.js mode',
      clients: 0,
    });
  } catch (error) {
    console.error('Error getting WebSocket status:', error);
    return NextResponse.json(
      { error: 'Failed to get WebSocket status' },
      { status: 500 }
    );
  }
}
