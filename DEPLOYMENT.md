# 🚀 Deployment Guide

## Option 1: Vercel (Recommended for Demo)

### Quick Deploy to Vercel

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your `learninghub` repository

2. **Configure Environment Variables**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

3. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Visit your app URL

### Vercel Limitations

- ❌ No SQLite (use Supabase instead)
- ❌ No Ollama (use OpenAI API instead)
- ❌ No WebSocket server (use polling instead)

### Vercel-Compatible Modifications Needed

To make this work on Vercel, you'd need to:

1. **Replace SQLite with Supabase**:
   ```bash
   pnpm add @supabase/supabase-js
   ```

2. **Replace Ollama with OpenAI**:
   ```bash
   pnpm add openai
   ```

3. **Remove WebSocket server**:
   - Use polling instead of real-time updates
   - Remove `server.js` file

## Option 2: Railway (Full App)

### Deploy to Railway

1. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `learninghub` repository

2. **Add Database**:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will provide connection string

3. **Configure Environment**:
   ```
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   PORT=3000
   ```

4. **Deploy**:
   - Railway will automatically deploy
   - Visit your app URL

### Railway Advantages

- ✅ Supports databases
- ✅ Can run Ollama (with custom Dockerfile)
- ✅ WebSocket support
- ✅ Full functionality

## Option 3: Self-Hosted VPS

### Deploy to VPS

1. **Set up VPS**:
   - Choose provider (DigitalOcean, Linode, AWS EC2)
   - Install Node.js, PM2, Nginx

2. **Clone and Setup**:
   ```bash
   git clone https://github.com/peterpielaetstrayer/learninghub.git
   cd learninghub
   pnpm install
   pnpm build
   ```

3. **Install Ollama**:
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ollama pull llama3.2:latest
   ```

4. **Configure Nginx**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Start with PM2**:
   ```bash
   pm2 start server.js --name learninghub
   pm2 save
   pm2 startup
   ```

## 🧪 Testing Your Deployment

### Health Check

Visit: `https://your-app-url.com/api/vercel-test`

Should return:
```json
{
  "message": "Learning Hub API is working!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": "healthy"
}
```

### Full Test Checklist

- [ ] App loads without errors
- [ ] Database connection works
- [ ] API endpoints respond
- [ ] Chrome extension can connect
- [ ] AI processing works (if Ollama/OpenAI configured)
- [ ] File uploads work (screenshots)
- [ ] CSV export works

## 🔧 Environment Variables

### Required for All Deployments

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-url.com
```

### For Vercel (with external services)

```env
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### For Railway/Self-hosted (with Ollama)

```env
OLLAMA_BASE_URL=http://localhost:11434
DATABASE_URL=your_database_url
```

## 🐛 Troubleshooting

### Common Deployment Issues

1. **Build Failures**:
   - Check Node.js version (18+)
   - Ensure all dependencies are in `package.json`
   - Check for TypeScript errors

2. **Database Connection**:
   - Verify connection string
   - Check database permissions
   - Ensure database is accessible

3. **AI Processing**:
   - Verify Ollama is running (self-hosted)
   - Check OpenAI API key (Vercel)
   - Monitor API rate limits

4. **File Uploads**:
   - Check file size limits
   - Verify storage permissions
   - Test with different file types

### Getting Help

- Check deployment logs
- Test API endpoints individually
- Verify environment variables
- Check browser console for errors

---

Choose the deployment option that best fits your needs! 🚀
