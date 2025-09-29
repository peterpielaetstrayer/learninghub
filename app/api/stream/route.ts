import { NextRequest, NextResponse } from 'next/server';
import { getWebSocketServer } from '@/lib/ws';

export async function GET(request: NextRequest) {
  try {
    const io = getWebSocketServer();
    
    if (!io) {
      return NextResponse.json(
        { error: 'WebSocket server not initialized' },
        { status: 500 }
      );
    }

    // Return WebSocket connection info
    return NextResponse.json({
      connected: true,
      clients: io.engine.clientsCount,
    });
  } catch (error) {
    console.error('Error getting WebSocket status:', error);
    return NextResponse.json(
      { error: 'Failed to get WebSocket status' },
      { status: 500 }
    );
  }
}
