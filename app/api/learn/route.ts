import { NextRequest, NextResponse } from 'next/server';
import { callOllama, prompts, LearningModeResponse } from '@/lib/ollama';
import { extractTextFromImage } from '@/lib/ocr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, imageDataUrl } = body;

    if (!text && !imageDataUrl) {
      return NextResponse.json(
        { error: 'Text or image is required' },
        { status: 400 }
      );
    }

    let content = text || '';

    // If image provided, extract text from it
    if (imageDataUrl && !text) {
      try {
        content = await extractTextFromImage(imageDataUrl);
      } catch (error) {
        console.error('OCR failed:', error);
        return NextResponse.json(
          { error: 'Failed to extract text from image' },
          { status: 500 }
        );
      }
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: 'No content to process' },
        { status: 400 }
      );
    }

    // Process with Ollama
    const response = await callOllama<LearningModeResponse>(
      prompts.learningMode(content),
      'llama3.2:latest'
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing learning content:', error);
    return NextResponse.json(
      { error: 'Failed to process learning content' },
      { status: 500 }
    );
  }
}
