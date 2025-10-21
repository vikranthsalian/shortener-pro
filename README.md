# URL Shortener - Monetized Link Platform

A production-ready URL shortener with built-in monetization through interstitial ads, similar to AdFly, Shorte.st, and ShrinkMe.io.

## Features

- **URL Shortening**: Create short, shareable links
- **Interstitial Ads**: Display ads before redirecting (5-second delay + skip button)
- **Google AdSense Integration**: Monetize with ads
- **Real-time Analytics**: Track clicks, impressions, and earnings
- **Admin Dashboard**: View detailed statistics per link
- **Production-Ready**: Built with Next.js, PostgreSQL, and deployed on Render

## Architecture

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────┤
│  - Home Page (URL Shortener Form)                       │
│  - Interstitial Page (Ad Display + Redirect)            │
│  - Admin Dashboard (Analytics)                          │
├─────────────────────────────────────────────────────────┤
│                    API Routes                            │
├─────────────────────────────────────────────────────────┤
│  - POST /api/shorten (Create short link)                │
│  - GET /api/redirect/[shortCode] (Fetch original URL)   │
│  - POST /api/impression/[shortCode] (Track ad view)     │
│  - GET /api/analytics/[shortCode] (Get stats)           │
├─────────────────────────────────────────────────────────┤
│                  PostgreSQL (Neon)                       │
├─────────────────────────────────────────────────────────┤
│  - urls (short_code, original_url, created_at, etc.)    │
│  - clicks (url_id, clicked_at, device_type, etc.)       │
│  - impressions (url_id, impressed_at, ad_type, etc.)    │
│  - analytics (url_id, date, clicks, impressions, etc.)  │
└─────────────────────────────────────────────────────────┘
\`\`\`

## Setup

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Setup Database
- Connect your Neon PostgreSQL database
- Run the migration script: `scripts/01-init-schema.sql`

### 4. Environment Variables
Copy `.env.example` to `.env.local` and fill in:
\`\`\`
NEON_DATABASE_URL=your_neon_connection_string
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

### 5. Run Locally
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## Deployment

### Deploy to Render

1. Push code to GitHub
2. Connect GitHub repo to Render
3. Add environment variables in Render dashboard
4. Deploy!

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## Monetization Model

- **CPM (Cost Per Mille)**: $0.50 - $5.00 per 1000 impressions
- **CPC (Cost Per Click)**: $0.01 - $0.50 per click
- **Revenue Share**: 70% to creators, 30% platform fee

## API Documentation

### Create Short Link
\`\`\`bash
POST /api/shorten
Content-Type: application/json

{
  "originalUrl": "https://example.com/very/long/url",
  "title": "My Link",
  "description": "Optional description"
}

Response:
{
  "id": 1,
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very/long/url",
  "shortUrl": "http://localhost:3000/s/abc123",
  "createdAt": "2024-01-01T00:00:00Z"
}
\`\`\`

### Get Analytics
\`\`\`bash
GET /api/analytics/abc123

Response:
{
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very/long/url",
  "createdAt": "2024-01-01T00:00:00Z",
  "totalClicks": 150,
  "totalImpressions": 200,
  "recentClicks": [...]
}
\`\`\`

## Security Considerations

- ✅ SQL injection prevention (parameterized queries)
- ✅ Rate limiting (implement in production)
- ✅ HTTPS only (enforce in production)
- ✅ CORS protection
- ✅ Input validation

## Future Enhancements

- [ ] User authentication & accounts
- [ ] Custom short codes
- [ ] Link expiration
- [ ] QR code generation
- [ ] Advanced analytics (geo-targeting, device breakdown)
- [ ] A/B testing for ads
- [ ] Webhook notifications
- [ ] API for programmatic access
- [ ] Mobile app

## License

MIT

## Support

For issues and questions, open a GitHub issue or contact support@example.com
