# TaskForge - Sharing Options for Testing

## How to Share TaskForge with Testers

You have several options to give TaskForge to someone for testing:

---

## Option 1: Local Setup (Best for Detailed Testing)

**When to use**: Internal team testing, detailed QA, development testing

**Requirements for Tester**:
- Node.js v18+
- PostgreSQL v14+
- Git
- 30-60 minutes for setup

**How to Share**:
1. Share the GitHub repository URL: https://github.com/jsmanyamklu/issue-tracker-rebuilt
2. Share the **[TESTER-SETUP-GUIDE.md](TESTER-SETUP-GUIDE.md)** file
3. Provide support for initial setup

**Pros**:
✅ Full control over data
✅ Can test all features
✅ Fast performance (local)
✅ Can debug issues
✅ No hosting costs

**Cons**:
❌ Requires technical setup
❌ Each tester needs their own setup
❌ Not accessible remotely

---

## Option 2: Deploy to Vercel (Easiest Cloud Option)

**When to use**: Remote testers, non-technical users, client demos

**Time to Deploy**: 5-10 minutes
**Cost**: Free (hobby tier)

### Steps to Deploy:

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import from GitHub: `issue-tracker-rebuilt`
   - Click "Import"

3. **Set Up Database**
   - Go to https://neon.tech (free PostgreSQL)
   - Create new project
   - Copy connection string

4. **Configure Environment Variables**
   In Vercel dashboard, add:
   ```
   DATABASE_URL=postgresql://...from-neon...
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
   GOOGLE_CLIENT_ID=your-google-id
   GOOGLE_CLIENT_SECRET=your-google-secret
   GITHUB_CLIENT_ID=your-github-id
   GITHUB_CLIENT_SECRET=your-github-secret
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes

6. **Run Migrations**
   - In Vercel dashboard → "Settings" → "Functions"
   - Or run locally: `DATABASE_URL=your-production-url npm run migrate`

**You get**: `https://taskforge-yourname.vercel.app`

**Share with testers**: Just send the URL!

**Pros**:
✅ Easy to share (just a URL)
✅ No setup for testers
✅ Free hosting
✅ Automatic deployments
✅ HTTPS included

**Cons**:
❌ Shared database (all testers see same data)
❌ Need to set up OAuth
❌ Internet required

---

## Option 3: Deploy to Railway (Full Stack)

**When to use**: Need PostgreSQL included, want simple all-in-one deployment

**Time to Deploy**: 10-15 minutes
**Cost**: Free trial ($5 credit), then ~$5-10/month

### Steps to Deploy:

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select `issue-tracker-rebuilt`

3. **Add PostgreSQL Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically creates database

4. **Configure Environment Variables**
   Railway auto-sets `DATABASE_URL`, add others:
   ```
   NEXTAUTH_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
   NEXTAUTH_SECRET=your-secret
   GOOGLE_CLIENT_ID=your-id
   GOOGLE_CLIENT_SECRET=your-secret
   GITHUB_CLIENT_ID=your-id
   GITHUB_CLIENT_SECRET=your-secret
   ```

5. **Deploy**
   - Railway auto-deploys
   - Wait 3-5 minutes

6. **Run Migrations**
   - In Railway dashboard → "Terminal"
   - Run: `npm run migrate`

**You get**: `https://taskforge-production.railway.app`

**Pros**:
✅ Database included
✅ Easy management
✅ Good for staging environment
✅ Real production-like setup

**Cons**:
❌ Costs money after trial
❌ Need credit card for trial

---

## Option 4: Docker (Self-Hosted)

**When to use**: Want to host on your own server, company policy requires self-hosting

**Requirements**:
- Server with Docker installed
- 2GB RAM minimum

### Steps to Deploy:

1. **Create docker-compose.yml** (already in repo)

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Run with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Access**
   - Local: http://localhost:3000
   - Remote: http://your-server-ip:3000

**Pros**:
✅ Full control
✅ Self-hosted
✅ Isolated environment
✅ Production-like

**Cons**:
❌ Need server/VPS
❌ Need to manage infrastructure
❌ Requires Docker knowledge

---

## Option 5: Simple Hosted Server

**When to use**: Have access to traditional web hosting

**Requirements**:
- VPS or shared hosting with Node.js
- SSH access

### Steps:

1. **Connect to server via SSH**
   ```bash
   ssh user@your-server.com
   ```

2. **Clone repository**
   ```bash
   git clone https://github.com/jsmanyamklu/issue-tracker-rebuilt.git
   cd issue-tracker-rebuilt
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up database** (PostgreSQL must be installed on server)

5. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit settings
   ```

6. **Run migrations**
   ```bash
   npm run migrate
   npm run db:seed  # Optional
   ```

7. **Start with PM2** (process manager)
   ```bash
   npm install -g pm2
   pm2 start npm --name "taskforge" -- start
   ```

8. **Set up Nginx** (reverse proxy)
   ```nginx
   server {
       listen 80;
       server_name taskforge.yourcompany.com;

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

---

## Comparison Table

| Option | Setup Time | Cost | Best For | Technical Level |
|--------|-----------|------|----------|----------------|
| **Local Setup** | 30-60 min | Free | Detailed testing | Medium |
| **Vercel** | 5-10 min | Free | Quick demos | Low |
| **Railway** | 10-15 min | $5-10/mo | Staging env | Low |
| **Docker** | 20-30 min | Server cost | Self-hosting | High |
| **VPS/Server** | 30-60 min | $5-20/mo | Production | High |

---

## Recommended Approach for Testing

### For Internal Team Testing:
**Use Option 1 (Local Setup)**
- Each developer/tester sets up locally
- Full control and fast iteration
- Share [TESTER-SETUP-GUIDE.md](TESTER-SETUP-GUIDE.md)

### For Client/Stakeholder Demos:
**Use Option 2 (Vercel)**
- Quick to set up
- Professional URL
- Always accessible
- No client setup needed

### For UAT (User Acceptance Testing):
**Use Option 3 (Railway) or Option 5 (VPS)**
- Production-like environment
- Persistent data
- Can be reset as needed

---

## OAuth Setup (Required for Remote Deployment)

For Options 2-5, you need to set up OAuth:

### Google OAuth:
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth credentials
5. Add authorized redirect: `https://your-domain.com/api/auth/callback/google`

### GitHub OAuth:
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Add callback URL: `https://your-domain.com/api/auth/callback/github`
4. Get Client ID and Secret

---

## Quick Start for Sharing

### Scenario 1: "Test this ASAP"
**Solution**: Deploy to Vercel (10 minutes)
```bash
# 1. Push to GitHub (already done)
# 2. Import to Vercel (click, click, done)
# 3. Share URL
```

### Scenario 2: "We need thorough QA testing"
**Solution**: Local setup for each tester
```bash
# Share: TESTER-SETUP-GUIDE.md
# Support: Help testers with initial setup
# Testing: Use TESTING-CHECKLIST.md
```

### Scenario 3: "Client wants to see it"
**Solution**: Deploy to Vercel + Seed demo data
```bash
# Deploy to Vercel
# Run: DATABASE_URL=... npm run db:seed
# Share professional URL
```

---

## Test User Accounts

After deployment, create test accounts for different roles:

### Option A: Via Seed Script
```bash
npm run db:seed
```

This creates:
- `admin@taskforge.com` (Admin)
- `manager@taskforge.com` (Manager)
- `developer@taskforge.com` (Developer)
- `viewer@taskforge.com` (Viewer)

### Option B: Manually in Database
```sql
INSERT INTO users (id, email, name, role) VALUES
(gen_random_uuid(), 'test@example.com', 'Test User', 'admin');
```

### Option C: Sign Up via OAuth
- User signs up with Google/GitHub
- You manually update their role in Admin Panel

---

## What to Share with Testers

### Minimum:
1. **Access method** (URL or setup guide)
2. **Test credentials** (if applicable)
3. **[TESTING-CHECKLIST.md](TESTING-CHECKLIST.md)** - What to test

### Recommended:
1. **[TESTER-SETUP-GUIDE.md](TESTER-SETUP-GUIDE.md)** - Setup instructions
2. **[SCREEN-BY-SCREEN-GUIDE.md](SCREEN-BY-SCREEN-GUIDE.md)** - How to use
3. **Bug report template** - How to report issues
4. **Timeline** - When testing should be complete

### Ideal:
1. **Kickoff meeting** - Explain the app and goals
2. **Test scenarios** - Specific user stories to test
3. **Success criteria** - What "pass" means
4. **Communication channel** - Slack, email, etc.

---

## Support During Testing

### Be Available For:
- Initial setup issues
- OAuth configuration help
- Database connection problems
- Questions about features
- Bug report clarifications

### Provide:
- Your contact info (email, Slack, phone)
- Expected response time
- Known issues list
- FAQ document

---

## After Testing

### Collect Feedback:
- Bug reports (use GitHub Issues)
- Feature requests
- UX feedback
- Performance issues

### Next Steps:
1. Fix critical bugs
2. Prioritize feature requests
3. Plan next iteration
4. Thank your testers! 🙏

---

## Need Help?

- **Setup Issues**: See [TESTER-SETUP-GUIDE.md](TESTER-SETUP-GUIDE.md)
- **Deployment Help**: Check provider docs (Vercel, Railway)
- **Feature Questions**: See [SCREEN-BY-SCREEN-GUIDE.md](SCREEN-BY-SCREEN-GUIDE.md)
- **Bug Reports**: Use GitHub Issues

---

**Choose the option that best fits your testing needs!**

Most teams start with **local setup for internal testing**, then deploy to **Vercel for external testing/demos**.

---

*Last Updated: March 25, 2026*
*Version: 2.0.0*
