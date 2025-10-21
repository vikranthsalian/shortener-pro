# Deployment Guide

## Prerequisites

- GitHub account with repository
- Neon PostgreSQL database
- Render account
- Google AdSense account (optional)

## Step 1: Setup Neon Database

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Save it for later

## Step 2: Setup GitHub Repository

1. Create a new GitHub repository
2. Clone this project
3. Push to GitHub:
   \`\`\`bash
   git remote add origin https://github.com/yourusername/url-shortener.git
   git branch -M main
   git push -u origin main
   \`\`\`

## Step 3: Deploy to Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: url-shortener
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

5. Add Environment Variables:
   - `NEON_NEON_DATABASE_URL`: Your Neon connection string
   - `NEXT_PUBLIC_BASE_URL`: Your Render URL (e.g., https://url-shortener.onrender.com)
   - `NEXT_PUBLIC_ADSENSE_CLIENT_ID`: Your Google AdSense client ID (optional)

6. Click "Create Web Service"

## Step 4: Run Database Migration

After deployment:

1. Connect to your Neon database
2. Run the SQL script from `scripts/01-init-schema.sql`
3. Verify tables are created

## Step 5: Setup Google AdSense (Optional)

1. Go to [google.com/adsense](https://google.com/adsense)
2. Sign up and get approved
3. Get your Client ID
4. Add to Render environment variables
5. Update ad slot IDs in `app/s/[shortCode]/page.tsx`

## Monitoring

- **Render Dashboard**: Monitor logs and performance
- **Neon Dashboard**: Monitor database usage
- **Google Analytics**: Track user behavior

## Troubleshooting

### Database Connection Error
- Verify NEON_DATABASE_URL is correct
- Check Neon dashboard for active connections
- Ensure IP whitelist includes Render

### Ads Not Showing
- Verify NEXT_PUBLIC_ADSENSE_CLIENT_ID is set
- Check browser console for errors
- Ensure AdSense account is approved

### Deployment Failed
- Check Render build logs
- Verify all environment variables are set
- Ensure package.json has correct scripts

## Custom Domain

1. In Render dashboard, go to Settings
2. Add custom domain
3. Update DNS records
4. Update NEXT_PUBLIC_BASE_URL environment variable

## Scaling

For production:
- Upgrade Render plan from Free to Starter/Pro
- Enable Render's auto-scaling
- Setup Neon connection pooling
- Add Redis caching for analytics
- Setup CDN for static assets
