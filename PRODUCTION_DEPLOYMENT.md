# 🚀 Production Deployment Guide

This guide will walk you through deploying LearningHub to production with full subscription functionality.

## Prerequisites

- GitHub repository with your code
- Stripe account for payments
- Email service (Gmail, SendGrid, etc.)
- Domain name (optional but recommended)

## Step 1: Set Up External Services

### 1.1 Stripe Setup

1. **Create Stripe Account**: Go to [stripe.com](https://stripe.com) and create an account
2. **Get API Keys**: 
   - Go to Developers → API Keys
   - Copy your Publishable Key and Secret Key
   - Note: Use test keys for development, live keys for production

3. **Set Up Webhooks**:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the webhook secret

### 1.2 Email Service Setup

**Option A: Gmail (Free)**
1. Enable 2-factor authentication on your Google account
2. Generate an App Password
3. Use these settings:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: your Gmail address
   - Password: your app password

**Option B: SendGrid (Recommended for Production)**
1. Create account at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Verify sender identity
4. Use these settings:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - User: `apikey`
   - Password: your API key

### 1.3 OAuth Providers

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)

**GitHub OAuth:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:3000/api/auth/callback/github` (development)
   - `https://your-domain.com/api/auth/callback/github` (production)

## Step 2: Database Setup

### 2.1 Railway (Recommended)

1. **Create Railway Account**: Go to [railway.app](https://railway.app)
2. **Create New Project**: Connect your GitHub repository
3. **Add PostgreSQL Database**:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will provide connection string
4. **Deploy Application**:
   - Railway will auto-deploy from your GitHub repo
   - Set environment variables (see Step 3)

### 2.2 Alternative: Supabase

1. **Create Supabase Account**: Go to [supabase.com](https://supabase.com)
2. **Create New Project**
3. **Get Connection String**: Go to Settings → Database
4. **Run Migrations**: Use the connection string with Prisma

## Step 3: Environment Variables

Set these environment variables in your deployment platform:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Email
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@your-domain.com"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AI Services (for production)
OPENAI_API_KEY="sk-..."

# App Configuration
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Step 4: Deploy to Railway

### 4.1 Connect Repository

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your LearningHub repository
4. Railway will automatically detect it's a Next.js app

### 4.2 Configure Environment

1. Go to your project dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add all environment variables from Step 3

### 4.3 Set Up Database

1. Click "New" → "Database" → "PostgreSQL"
2. Railway will create a PostgreSQL database
3. Copy the `DATABASE_URL` from the database service
4. Add it to your app's environment variables

### 4.4 Deploy

1. Railway will automatically deploy when you push to your main branch
2. Go to "Deployments" tab to see deployment status
3. Once deployed, you'll get a URL like `https://your-app.railway.app`

## Step 5: Database Migration

After deployment, run the database migration:

```bash
# Connect to your deployed app
railway run npx prisma migrate deploy
```

Or if using Railway CLI:
```bash
railway run npx prisma db push
```

## Step 6: Custom Domain (Optional)

1. **Buy Domain**: Purchase from Namecheap, GoDaddy, etc.
2. **Configure DNS**: 
   - Add CNAME record pointing to your Railway app
   - Or use Railway's custom domain feature
3. **Update Environment**: 
   - Update `NEXTAUTH_URL` to your custom domain
   - Update OAuth redirect URIs

## Step 7: Testing Production

### 7.1 Health Check

Visit: `https://your-domain.com/api/vercel-test`

Should return:
```json
{
  "message": "Learning Hub API is working!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": "healthy"
}
```

### 7.2 Test Authentication

1. Go to `https://your-domain.com/auth/signin`
2. Try signing in with Google/GitHub
3. Verify you're redirected to dashboard

### 7.3 Test Subscriptions

1. Go to `https://your-domain.com/pricing`
2. Click "Subscribe to Pro"
3. Complete Stripe checkout with test card: `4242 4242 4242 4242`
4. Verify subscription is created

### 7.4 Test Core Features

1. **Add Item**: Use Chrome extension or manual entry
2. **Process with AI**: Click process button
3. **Create Flashcards**: Verify cards are created
4. **Export**: Test CSV export functionality

## Step 8: Monitoring & Maintenance

### 8.1 Set Up Monitoring

1. **Railway Metrics**: Built-in monitoring in Railway dashboard
2. **Error Tracking**: Consider Sentry for error monitoring
3. **Analytics**: Stripe dashboard for payment analytics

### 8.2 Regular Maintenance

1. **Database Backups**: Railway handles this automatically
2. **Security Updates**: Keep dependencies updated
3. **Performance Monitoring**: Monitor response times and usage

## Step 9: Scaling Considerations

### 9.1 Database Scaling

- Railway PostgreSQL scales automatically
- Consider read replicas for high traffic
- Monitor connection limits

### 9.2 Application Scaling

- Railway auto-scales based on traffic
- Consider CDN for static assets
- Monitor memory and CPU usage

### 9.3 Cost Optimization

- Monitor usage and costs in Railway dashboard
- Optimize database queries
- Consider caching strategies

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check `DATABASE_URL` format
   - Verify database is running
   - Check network connectivity

2. **Authentication Not Working**:
   - Verify OAuth redirect URIs
   - Check `NEXTAUTH_URL` matches your domain
   - Verify OAuth app settings

3. **Stripe Webhooks Failing**:
   - Check webhook URL is correct
   - Verify webhook secret
   - Check webhook events are selected

4. **Email Not Sending**:
   - Verify email credentials
   - Check SMTP settings
   - Test with different email providers

### Getting Help

- Check Railway logs in dashboard
- Monitor Stripe webhook logs
- Use browser developer tools for frontend issues
- Check Next.js build logs

## Security Checklist

- [ ] Environment variables are secure
- [ ] Database is not publicly accessible
- [ ] OAuth redirect URIs are correct
- [ ] Stripe webhook secret is secure
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place

## Cost Estimation

### Railway (Monthly)
- **Hobby Plan**: $5/month (includes database)
- **Pro Plan**: $20/month (better performance)
- **Custom Domain**: Free

### Stripe (Per Transaction)
- **2.9% + 30¢** per successful charge
- **No monthly fees**

### Total Estimated Cost
- **Starting**: ~$5-25/month
- **With 100 paying customers**: ~$30-50/month
- **With 1000 paying customers**: ~$300-500/month

---

🎉 **Congratulations!** Your LearningHub app is now live with full subscription functionality!

## Next Steps

1. **Marketing**: Set up landing page, social media
2. **Analytics**: Add Google Analytics, Mixpanel
3. **Support**: Set up help desk, documentation
4. **Features**: Add more AI models, integrations
5. **Mobile**: Consider React Native app

Need help? Check the troubleshooting section or create an issue in the repository.
