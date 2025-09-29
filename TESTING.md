# Testing Guide for Learning Hub

## 🧪 Local Testing

### Prerequisites
1. **Ollama Setup**:
   ```bash
   # Install Ollama (if not already installed)
   # Download from: https://ollama.ai/
   
   # Pull the required model
   ollama pull llama3.2:latest
   
   # Start Ollama server
   ollama serve
   ```

2. **Start the App**:
   ```bash
   pnpm dev
   ```

3. **Test Database**:
   ```bash
   node scripts/test-db.js
   ```

### Testing Checklist

#### ✅ Backend API Testing
- [ ] Database initializes correctly
- [ ] API routes respond (check http://localhost:3000/api/stream)
- [ ] Ollama connection works (test with a simple API call)

#### ✅ Chrome Extension Testing
1. Load extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension` folder
   - Verify extension appears in toolbar

2. Test functionality:
   - [ ] Right-click on any webpage → "Save to Learning Hub"
   - [ ] Check if item appears in inbox
   - [ ] Click "Process" button on an item
   - [ ] Verify AI processing works (summary + flashcards generated)

#### ✅ Learning Mode Testing
- [ ] Click "Learning Mode" toggle in the app
- [ ] Verify overlay appears
- [ ] Test keyboard shortcuts (Ctrl+L, Esc)
- [ ] Test dragging the overlay

#### ✅ SRS Export Testing
- [ ] Generate some flashcards by processing items
- [ ] Go to SRS Review tab
- [ ] Click "Export to Anki"
- [ ] Verify CSV file downloads correctly

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Demo)
**Pros**: Easy deployment, great for demos
**Cons**: No SQLite, no Ollama, limited functionality

**Steps**:
1. Create GitHub repository
2. Deploy to Vercel
3. Use external database (Supabase/PlanetScale)
4. Use external AI service (OpenAI API)

### Option 2: Railway/Render (Better for Full App)
**Pros**: Supports databases, can run Ollama
**Cons**: More complex setup

### Option 3: Self-Hosted (Best for Privacy)
**Pros**: Full local control, privacy
**Cons**: Requires server management

## 🔄 Quick Vercel Deployment

If you want to deploy to Vercel for demo purposes:

1. **Create GitHub repo**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Create repo on GitHub and push
   ```

2. **Modify for Vercel**:
   - Replace SQLite with Supabase
   - Replace Ollama with OpenAI API
   - Update environment variables

3. **Deploy**:
   - Connect GitHub repo to Vercel
   - Set environment variables
   - Deploy

Would you like me to help you with any of these options?
