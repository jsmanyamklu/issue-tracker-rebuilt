# Setup Guide - Issue Tracker

Complete guide to set up and run the Issue Tracker application.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

## Step 1: Clone and Install

```bash
cd issue-tracker-rebuilt
npm install
```

## Step 2: Database Setup

### Create PostgreSQL Database

```bash
# Using psql
createdb issue_tracker

# Or connect and run:
psql -U postgres
CREATE DATABASE issue_tracker;
```

### Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your database URL:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/issue_tracker
```

### Run Migrations

```bash
npm run migrate
```

This will create all necessary tables, indexes, and constraints.

### (Optional) Seed Sample Data

```bash
npm run db:seed
```

This creates sample users, projects, and issues for testing.

## Step 3: Authentication Setup

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Add to `.env`:

```bash
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
```

### Configure OAuth Providers

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set application type to "Web application"
6. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Copy Client ID and Client Secret to `.env`:
   ```bash
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

#### GitHub OAuth

1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - Application name: Issue Tracker (Dev)
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Copy Client ID and generate a Client Secret
6. Add to `.env`:
   ```bash
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

## Step 4: (Optional) AI Features Setup

If you want to enable AI features:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to `.env`:
   ```bash
   OPENAI_API_KEY=your-openai-api-key
   AI_MODEL=gpt-4-turbo-preview
   ```

**Note**: AI features are optional. The app works without them.

## Step 5: Run the Application

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run start
```

## Step 6: First Use

1. Navigate to `http://localhost:3000`
2. Click **Sign In**
3. Choose Google or GitHub
4. Authorize the application
5. You'll be redirected to the dashboard

## Project Structure

```
issue-tracker-rebuilt/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   ├── dashboard/          # Dashboard page
│   │   ├── projects/           # Projects pages
│   │   ├── issues/             # Issues pages
│   │   └── my-issues/          # User's issues
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   └── auth/               # Auth components
│   ├── controllers/            # Controller layer
│   ├── services/               # Service layer (business logic)
│   ├── repositories/           # Repository layer (SQL queries)
│   ├── lib/                    # Utilities and helpers
│   │   ├── db/                 # Database connection
│   │   ├── auth/               # NextAuth config
│   │   └── ai/                 # AI module
│   └── types/                  # TypeScript types
├── migrations/                 # Database migrations
├── scripts/                    # Utility scripts
│   ├── migrate.js              # Run migrations
│   ├── db-reset.js             # Reset database
│   └── seed.js                 # Seed sample data
├── .env                        # Environment variables (create this)
├── .env.example                # Environment template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind CSS config
├── next.config.js              # Next.js config
├── middleware.ts               # Auth middleware
├── README.md                   # Project overview
├── ARCHITECTURE.md             # Architecture documentation
├── API_DOCUMENTATION.md        # API reference
├── AUTHENTICATION_GUIDE.md     # Auth setup details
├── DATABASE_SCHEMA.md          # Database schema docs
└── SETUP_GUIDE.md              # This file
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Database
npm run migrate          # Run migrations
npm run db:reset         # Reset database (careful!)
npm run db:seed          # Seed sample data
```

## Troubleshooting

### "Database connection failed"

- Check that PostgreSQL is running
- Verify `DATABASE_URL` in `.env` is correct
- Ensure the database exists

### "OAuth redirect URI mismatch"

- Verify redirect URIs in OAuth provider settings match exactly:
  - Google: `http://localhost:3000/api/auth/callback/google`
  - GitHub: `http://localhost:3000/api/auth/callback/github`

### "Migrations failed"

- Check database credentials
- Ensure database is empty or run `npm run db:reset` first
- Check PostgreSQL version (needs 14+)

### "AI features not working"

- Verify `OPENAI_API_KEY` is set in `.env`
- Check API key has credits/quota
- AI features are optional - app works without them

### Port already in use

Change the port in `package.json`:

```json
"scripts": {
  "dev": "next dev -p 3001"
}
```

## Production Deployment

### Environment Variables

Set these in your hosting platform:

```bash
DATABASE_URL=your-production-database-url
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
OPENAI_API_KEY=your-openai-api-key  # Optional
```

### Update OAuth Redirect URIs

In Google and GitHub OAuth settings, add production callback URLs:

- Google: `https://yourdomain.com/api/auth/callback/google`
- GitHub: `https://yourdomain.com/api/auth/callback/github`

### Deploy

The application can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- AWS (EC2, ECS, Lambda)
- Any Node.js hosting platform

### Database

For production, use:
- Managed PostgreSQL (AWS RDS, Google Cloud SQL, Azure Database)
- Supabase (just database, not the SDK)
- Railway
- Neon

## Next Steps

After setup, explore:

1. **Dashboard** - View your issues and projects
2. **Create Project** - Start organizing your work
3. **Create Issues** - Track bugs and features
4. **AI Features** - Try auto-classification and root cause analysis
5. **API** - Use the REST API for integrations

## Support

- Documentation: See `ARCHITECTURE.md` and `API_DOCUMENTATION.md`
- Database: See `DATABASE_SCHEMA.md`
- Auth: See `AUTHENTICATION_GUIDE.md`
- Issues: Check troubleshooting section above

Happy tracking!
