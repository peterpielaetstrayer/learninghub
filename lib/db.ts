import Database from 'better-sqlite3';
import { join } from 'path';

// Database instance
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = join(process.cwd(), 'data', 'learninghub.db');
    db = new Database(dbPath);
    initializeTables();
  }
  return db;
}

function initializeTables() {
  if (!db) return;

  // Create items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      url TEXT,
      title TEXT,
      raw_text TEXT,
      raw_image_path TEXT,
      source TEXT
    )
  `);

  // Create ai_outputs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_outputs (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      model_name TEXT NOT NULL,
      summary TEXT,
      tags TEXT,
      srs TEXT,
      FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
    )
  `);

  // Create cards table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      tags TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
    )
  `);

  // Create user_prefs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_prefs (
      id INTEGER PRIMARY KEY,
      theme TEXT DEFAULT 'system',
      high_contrast INTEGER DEFAULT 0,
      voice_enabled INTEGER DEFAULT 0,
      goals TEXT DEFAULT '{}'
    )
  `);

  // Insert default user preferences if none exist
  const existingPrefs = db.prepare('SELECT COUNT(*) as count FROM user_prefs').get() as { count: number };
  if (existingPrefs.count === 0) {
    db.prepare(`
      INSERT INTO user_prefs (id, theme, high_contrast, voice_enabled, goals)
      VALUES (1, 'system', 0, 0, '{}')
    `).run();
  }
}

// Helper functions for common operations
export const dbHelpers = {
  // Items
  createItem: (item: {
    id: string;
    url?: string;
    title?: string;
    raw_text?: string;
    raw_image_path?: string;
    source?: string;
  }) => {
    const db = getDatabase();
    return db.prepare(`
      INSERT INTO items (id, created_at, url, title, raw_text, raw_image_path, source)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.id,
      Date.now(),
      item.url || null,
      item.title || null,
      item.raw_text || null,
      item.raw_image_path || null,
      item.source || null
    );
  },

  getItem: (id: string) => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM items WHERE id = ?').get(id) as Item | undefined;
  },

  getItems: (options: {
    q?: string;
    tag?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    const db = getDatabase();
    const { q, tag, limit = 50, offset = 0 } = options;
    
    let query = `
      SELECT 
        i.*,
        ao.summary,
        ao.tags,
        ao.created_at as processed_at
      FROM items i
      LEFT JOIN ai_outputs ao ON i.id = ao.item_id
    `;
    
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (q) {
      conditions.push('(i.title LIKE ? OR i.raw_text LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
    
    if (tag) {
      conditions.push('ao.tags LIKE ?');
      params.push(`%"${tag}"%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    return db.prepare(query).all(...params) as ItemWithAI[];
  },

  // AI Outputs
  createAIOutput: (output: {
    id: string;
    item_id: string;
    model_name: string;
    summary?: string;
    tags?: string;
    srs?: string;
  }) => {
    const db = getDatabase();
    return db.prepare(`
      INSERT INTO ai_outputs (id, item_id, created_at, model_name, summary, tags, srs)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      output.id,
      output.item_id,
      Date.now(),
      output.model_name,
      output.summary || null,
      output.tags || null,
      output.srs || null
    );
  },

  // Cards
  createCard: (card: {
    id: string;
    item_id: string;
    front: string;
    back: string;
    tags?: string;
  }) => {
    const db = getDatabase();
    return db.prepare(`
      INSERT INTO cards (id, item_id, front, back, tags, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      card.id,
      card.item_id,
      card.front,
      card.back,
      card.tags || null,
      Date.now()
    );
  },

  getCardsForExport: () => {
    const db = getDatabase();
    return db.prepare(`
      SELECT c.front, c.back, c.tags
      FROM cards c
      ORDER BY c.created_at DESC
    `).all() as CardExport[];
  },

  // User Preferences
  getUserPrefs: () => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM user_prefs WHERE id = 1').get() as UserPrefs | undefined;
  },

  updateUserPrefs: (prefs: Partial<UserPrefs>) => {
    const db = getDatabase();
    const fields = Object.keys(prefs).map(key => `${key} = ?`).join(', ');
    const values = Object.values(prefs);
    return db.prepare(`UPDATE user_prefs SET ${fields} WHERE id = 1`).run(...values);
  },

  // Additional helpers
  getAIOutput: (itemId: string) => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM ai_outputs WHERE item_id = ?').get(itemId) as AIOutput | undefined;
  },

  updateItemText: (itemId: string, text: string) => {
    const db = getDatabase();
    return db.prepare('UPDATE items SET raw_text = ? WHERE id = ?').run(text, itemId);
  },

  getDatabase: () => getDatabase()
};

// Type definitions
export interface Item {
  id: string;
  created_at: number;
  url?: string;
  title?: string;
  raw_text?: string;
  raw_image_path?: string;
  source?: string;
}

export interface ItemWithAI extends Item {
  summary?: string;
  tags?: string;
  processed_at?: number;
}

export interface AIOutput {
  id: string;
  item_id: string;
  created_at: number;
  model_name: string;
  summary?: string;
  tags?: string;
  srs?: string;
}

export interface Card {
  id: string;
  item_id: string;
  front: string;
  back: string;
  tags?: string;
  created_at: number;
}

export interface CardExport {
  front: string;
  back: string;
  tags?: string;
}

export interface UserPrefs {
  id: number;
  theme: string;
  high_contrast: number;
  voice_enabled: number;
  goals: string;
}
