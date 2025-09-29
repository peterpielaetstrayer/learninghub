import { createWorker } from 'tesseract.js';

let worker: Tesseract.Worker | null = null;

export async function initializeOCR(): Promise<void> {
  if (!worker) {
    worker = await createWorker('eng');
  }
}

export async function extractTextFromImage(imageDataUrl: string): Promise<string> {
  if (!worker) {
    await initializeOCR();
  }
  
  if (!worker) {
    throw new Error('Failed to initialize OCR worker');
  }

  try {
    const { data: { text } } = await worker.recognize(imageDataUrl);
    return text.trim();
  } catch (error) {
    throw new Error(`OCR failed: ${error}`);
  }
}

export async function cleanupOCR(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
