# 🧠 Personal Learning Companion

A local-first learning companion that captures content from your browser, processes it with AI, and creates flashcards for spaced repetition learning.

## ✨ Features

- **Browser Clipping**: Right-click any webpage to save content
- **AI Processing**: Local LLM (Ollama) generates summaries and flashcards
- **Spaced Repetition**: SRS system with Anki export
- **Learning Mode**: Real-time page analysis with overlay
- **Privacy-First**: All processing runs locally by default
- **Accessibility**: Neurodivergent-friendly design with keyboard shortcuts

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18+)
2. **Ollama** - [Download here](https://ollama.ai/)
3. **Chrome/Edge** browser

### Installation

1. **Clone and install**:
   ```bash
   git clone https://github.com/peterpielaetstrayer/learninghub.git
   cd learninghub
   pnpm install
   ```

2. **Set up Ollama**:
   ```bash
   # Install Ollama (if not already installed)
   # Download from: https://ollama.ai/
   
   # Pull the required model
   ollama pull llama3.2:latest
   
   # Start Ollama server
   ollama serve
   ```

3. **Start the app**:
   ```bash
   pnpm dev
   ```

4. **Install Chrome Extension**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension` folder

## 🧪 Testing

Visit [http://localhost:3000](http://localhost:3000) and:

1. **Test Browser Clipping**:
   - Right-click any webpage → "Save to Learning Hub"
   - Check if item appears in inbox

2. **Test AI Processing**:
   - Click "Process" button on an item
   - Verify AI generates summary and flashcards

3. **Test Learning Mode**:
   - Click "Learning Mode" toggle
   - Verify overlay appears and can be dragged

4. **Test SRS Export**:
   - Go to SRS Review tab
   - Click "Export to Anki"
   - Verify CSV downloads correctly

## 🚀 Deployment Options

### Option 1: Vercel (Demo Version)
**Best for**: Quick demos and sharing

**Limitations**: No SQLite, no Ollama, limited functionality

**Steps**:
1. Connect GitHub repo to Vercel
2. Deploy automatically
3. Set up external database (Supabase) and AI service (OpenAI)

### Option 2: Railway/Render (Full App)
**Best for**: Full functionality with databases

**Steps**:
1. Connect GitHub repo to Railway/Render
2. Add PostgreSQL database
3. Deploy with Ollama support

### Option 3: Self-Hosted VPS
**Best for**: Full privacy and control

**Steps**:
1. Deploy to VPS (DigitalOcean, Linode, etc.)
2. Install Ollama on server
3. Set up reverse proxy (Nginx)

## 🏗️ Architecture

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   └── page.tsx           # Main dashboard
├── components/            # React components
├── lib/                   # Core utilities
│   ├── db.ts             # SQLite database
│   ├── ollama.ts         # AI client
│   └── srs.ts            # Spaced repetition
├── hooks/                 # React hooks
├── extension/             # Chrome extension
└── data/                  # SQLite database files
```

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434

# Database (for production)
DATABASE_URL=your_database_url

# AI Service (for Vercel deployment)
OPENAI_API_KEY=your_openai_key
```

### Chrome Extension Settings

Configure in `extension/options.html`:
- API Base URL: `http://localhost:3000`
- Learning Mode Interval: 10 seconds
- Max Content Length: 5000 characters

## 🎯 Usage

1. **Capture Content**: Right-click any webpage to save
2. **Process with AI**: Click "Process" to generate summaries and flashcards
3. **Review Flashcards**: Use SRS Review for spaced repetition
4. **Learning Mode**: Toggle for real-time page analysis
5. **Export to Anki**: Download CSV for Anki import

## 🛠️ Development

### Database Schema

```sql
-- Items table
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  url TEXT,
  title TEXT,
  raw_text TEXT,
  raw_image_path TEXT,
  source TEXT
);

-- AI outputs table
CREATE TABLE ai_outputs (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  model_name TEXT NOT NULL,
  summary TEXT,
  tags TEXT,
  srs TEXT
);

-- Cards table
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  tags TEXT,
  created_at INTEGER NOT NULL
);
```

### API Endpoints

- `POST /api/inbox` - Save content from browser
- `POST /api/process/[id]` - Process item with AI
- `GET /api/items` - List items with filters
- `GET /api/srs/export` - Export flashcards as CSV
- `POST /api/learn` - Learning Mode processing
- `GET /api/stream` - WebSocket status

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

1. **Port 3000 in use**: Kill the process or use a different port
2. **Ollama not responding**: Ensure Ollama is running on port 11434
3. **Database errors**: Check if `data/` directory exists and is writable
4. **Extension not working**: Check browser console for errors

### Getting Help

- Check the [Issues](https://github.com/peterpielaetstrayer/learninghub/issues) page
- Create a new issue with detailed error information
- Include your operating system and browser version

---

Built with ❤️ for learners who value privacy and effective learning.
