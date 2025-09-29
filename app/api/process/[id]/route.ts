import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { callOllama, prompts, ProcessingResponse } from '@/lib/ollama';
import { extractTextFromImage } from '@/lib/ocr';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get the item
    const item = dbHelpers.getItem(id);
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if already processed
    const existingOutput = dbHelpers.getAIOutput(id);
    if (existingOutput) {
      return NextResponse.json(
        { error: 'Item already processed' },
        { status: 400 }
      );
    }

    let content = item.raw_text || '';

    // If no text but has image, run OCR
    if (!content && item.raw_image_path) {
      try {
        const imagePath = `${process.cwd()}/public${item.raw_image_path}`;
        content = await extractTextFromImage(imagePath);
        
        // Update item with OCR text
        dbHelpers.updateItemText(id, content);
      } catch (error) {
        console.error('OCR failed:', error);
        return NextResponse.json(
          { error: 'Failed to extract text from image' },
          { status: 500 }
        );
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: 'No content to process' },
        { status: 400 }
      );
    }

    // Process with Ollama
    const aiResponse = await callOllama<ProcessingResponse>(
      prompts.processing(content),
      'llama3.2:latest'
    );

    // Save AI output
    const outputId = uuidv4();
    dbHelpers.createAIOutput({
      id: outputId,
      item_id: id,
      model_name: 'llama3.2:latest',
      summary: aiResponse.summary,
      tags: JSON.stringify(aiResponse.tags),
      srs: JSON.stringify(aiResponse.cards),
    });

    // Create cards
    for (const card of aiResponse.cards) {
      const cardId = uuidv4();
      dbHelpers.createCard({
        id: cardId,
        item_id: id,
        front: card.front,
        back: card.back,
        tags: JSON.stringify(aiResponse.tags),
      });
    }

    return NextResponse.json({
      success: true,
      summary: aiResponse.summary,
      tags: aiResponse.tags,
      cardsCount: aiResponse.cards.length,
    });
  } catch (error) {
    console.error('Error processing item:', error);
    return NextResponse.json(
      { error: 'Failed to process item' },
      { status: 500 }
    );
  }
}

