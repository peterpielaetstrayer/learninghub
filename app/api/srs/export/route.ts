import { NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';

export async function GET() {
  try {
    const cards = dbHelpers.getCardsForExport();
    
    // Convert to CSV format
    const csvHeader = 'Front,Back,Tags\n';
    const csvRows = cards.map(card => {
      const front = `"${(card.front || '').replace(/"/g, '""')}"`;
      const back = `"${(card.back || '').replace(/"/g, '""')}"`;
      const tags = `"${(card.tags || '').replace(/"/g, '""')}"`;
      return `${front},${back},${tags}`;
    });
    
    const csvContent = csvHeader + csvRows.join('\n');
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="learninghub-cards.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting cards:', error);
    return NextResponse.json(
      { error: 'Failed to export cards' },
      { status: 500 }
    );
  }
}
