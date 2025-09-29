// Simple Spaced Repetition System utilities

export interface SRSData {
  interval: number; // days
  repetitions: number;
  easeFactor: number;
  nextReview: number; // timestamp
}

export interface SRSResult {
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: number;
}

// Default SRS parameters
const DEFAULT_EASE_FACTOR = 2.5;
const DEFAULT_INTERVAL = 1; // 1 day
const MINIMUM_EASE_FACTOR = 1.3;

export function createSRSData(): SRSData {
  return {
    interval: DEFAULT_INTERVAL,
    repetitions: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    nextReview: Date.now() + (DEFAULT_INTERVAL * 24 * 60 * 60 * 1000),
  };
}

export function updateSRS(
  current: SRSData,
  quality: 'again' | 'hard' | 'good' | 'easy'
): SRSResult {
  let { interval, repetitions, easeFactor } = current;

  // Quality mapping: again=0, hard=1, good=2, easy=3
  const qualityMap = { again: 0, hard: 1, good: 2, easy: 3 };
  const q = qualityMap[quality];

  if (q < 3) {
    // Failed or hard - reset repetitions
    repetitions = 0;
    interval = 1;
  } else {
    // Passed - update based on quality
    repetitions += 1;

    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }

    // Update ease factor
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    easeFactor = Math.max(easeFactor, MINIMUM_EASE_FACTOR);
  }

  const nextReview = Date.now() + (interval * 24 * 60 * 60 * 1000);

  return {
    interval,
    repetitions,
    easeFactor,
    nextReview,
  };
}

export function isDueForReview(srsData: SRSData): boolean {
  return Date.now() >= srsData.nextReview;
}

export function getDaysUntilReview(srsData: SRSData): number {
  const now = Date.now();
  const diff = srsData.nextReview - now;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

export function formatSRSData(srsData: SRSData): string {
  return JSON.stringify(srsData);
}

export function parseSRSData(json: string): SRSData | null {
  try {
    const parsed = JSON.parse(json);
    if (
      typeof parsed.interval === 'number' &&
      typeof parsed.repetitions === 'number' &&
      typeof parsed.easeFactor === 'number' &&
      typeof parsed.nextReview === 'number'
    ) {
      return parsed as SRSData;
    }
    return null;
  } catch {
    return null;
  }
}
