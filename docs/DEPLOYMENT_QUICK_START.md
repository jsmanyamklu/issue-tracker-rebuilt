# 🚀 TaskForge - Deployment Quick Start Guide

**Goal:** Get TaskForge running in production in under 30 minutes

---

## Option 1: Vercel + Supabase (Recommended - Easiest) ⚡

**Perfect for:** Startups, SMBs, quick launches
**Cost:** Free for first 100 users, then $20-50/month
**Time:** 20-30 minutes

### Step 1: Deploy Database (10 minutes)

1. **Go to [Supabase](https://supabase.com)** and create account
2. **Create new project**
   - Name: `taskforge-prod`
   - Region: Choose closest to your users
   - Password: Generate strong password (save it!)
3. **Get Database URL**
   - Go to Project Settings → Database
   - Copy "Connection string (URI)"
   - Example: `postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres`

### Step 2: Deploy Application (10 minutes)

1. **Push to GitHub** (if not already)
   ```bash
   git push origin main
   ```

2. **Go to [Vercel](https://vercel.com)** and sign in with GitHub

3. **Import Repository**
   - Click "New Project"
   - Select your TaskForge repository
   - Click "Import"

4. **Configure Environment Variables**
   Click "Environment Variables" and add:

   ```env
   # Database
   DATABASE_URL=<paste Supabase connection string>

   # Auth (generate new secret)
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=<run: openssl rand -base64 32>

   # GitHub OAuth (create at github.com/settings/developers)
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret

   # Google OAuth (optional - create at console.cloud.google.com)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Email (optional - for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password

   # Slack (optional - for notifications)
   SLACK_WEBHOOK_URL=your_webhook_url
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

### Step 3: Initialize Database (5 minutes)

1. **Run migrations**
   - Vercel will automatically run migrations on deploy
   - Or manually via Supabase SQL Editor:

   ```sql
   -- Copy all SQL from migrations/ folder and run
   ```

2. **Create first admin user**
   - Visit your deployed app
   - Sign in with GitHub/Google
   - Manually update in Supabase:

   ```sql
   UPDATE users
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```

### Step 4: Configure OAuth (5 minutes)

**GitHub OAuth:**
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Name: TaskForge
   - Homepage: `https://your-app.vercel.app`
   - Callback: `https://your-app.vercel.app/api/auth/callback/github`
4. Copy Client ID and Secret to Vercel env vars
5. Redeploy

**Google OAuth (Optional):**
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth credentials
5. Add authorized redirect: `https://your-app.vercel.app/api/auth/callback/google`

### Step 5: Custom Domain (Optional)

1. In Vercel → Settings → Domains
2. Add your domain: `taskforge.yourdomain.com`
3. Update DNS records as shown
4. Update `NEXTAUTH_URL` env var
5. Redeploy

**Done! ✅ Your app is production-ready**

---

## Option 2: AWS Complete Stack (Enterprise)

**Perfect for:** Enterprises, compliance requirements, full control
**Cost:** $100-500/month
**Time:** 4-8 hours

### Architecture
```
Users → CloudFront (CDN) → ECS/Lambda (App) → RDS (Database)
```

### Step 1: Set Up Database (1 hour)

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier taskforge-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password <STRONG_PASSWORD> \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxx \
  --publicly-accessible

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier taskforge-db \
  --query 'DBInstances[0].Endpoint.Address'
```

### Step 2: Deploy Application (2-3 hours)

**Option A: ECS (Container)**
```bash
# Build Docker image
docker build -t taskforge .

# Push to ECR
aws ecr create-repository --repository-name taskforge
docker tag taskforge:latest <account>.dkr.ecr.us-east-1.amazonaws.com/taskforge
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/taskforge

# Create ECS service
aws ecs create-service \
  --cluster default \
  --service-name taskforge \
  --task-definition taskforge:1 \
  --desired-count 2
```

**Option B: Amplify (Easier)**
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify push
```

### Step 3: Configure CloudFront (1 hour)

- Set up CDN
- Configure SSL certificate
- Add custom domain

### Step 4: Security & Monitoring (1-2 hours)

- Set up CloudWatch
- Configure alarms
- Enable GuardDuty
- Set up backups

**AWS Total Time:** 4-8 hours
**Recommended:** Hire AWS consultant for first setup

---

## Option 3: Docker Self-Hosted

**Perfect for:** On-premise requirements, full control
**Cost:** Server cost only ($50-200/month)
**Time:** 2-4 hours

### Prerequisites
- Ubuntu 22.04 server
- Docker & Docker Compose installed
- Domain name (optional)

### Step 1: Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: taskforge
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: always

  app:
    image: node:18
    working_dir: /app
    volumes:
      - ./:/app
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/taskforge
      NEXTAUTH_URL: ${APP_URL}
      NEXTAUTH_SECRET: ${AUTH_SECRET}
      GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID}
      GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    command: sh -c "npm install && npm run build && npm start"
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: always

volumes:
  postgres_data:
```

### Step 2: Deploy

```bash
# Clone repository
git clone <your-repo> /var/www/taskforge
cd /var/www/taskforge

# Create .env file
cat > .env << EOF
DB_PASSWORD=your_strong_password
APP_URL=https://taskforge.yourdomain.com
AUTH_SECRET=$(openssl rand -base64 32)
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
EOF

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Step 3: Set Up Nginx (SSL)

```nginx
# nginx.conf
server {
    listen 80;
    server_name taskforge.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name taskforge.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 4: Set Up Backups

```bash
# Create backup script
cat > /usr/local/bin/backup-taskforge.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec taskforge_postgres_1 pg_dump -U postgres taskforge > /backups/taskforge_$DATE.sql
find /backups -name "taskforge_*.sql" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-taskforge.sh

# Schedule daily backups
echo "0 2 * * * /usr/local/bin/backup-taskforge.sh" | crontab -
```

---

## Post-Deployment Checklist ✅

### Security
- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured
- [ ] Database password is strong
- [ ] OAuth apps configured with correct URLs
- [ ] Firewall configured (only 80/443 open)
- [ ] Database not publicly accessible
- [ ] Admin user created and tested

### Monitoring
- [ ] Error tracking set up (Sentry recommended)
- [ ] Uptime monitoring (UptimeRobot free tier)
- [ ] Database backups automated
- [ ] Disk space alerts configured
- [ ] Email notifications working

### Performance
- [ ] Page load time < 2 seconds
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Caching configured
- [ ] CDN enabled (if using)

### Functionality
- [ ] Sign in/sign out working
- [ ] Create project working
- [ ] Create issue working
- [ ] Assign issues working
- [ ] Comments working
- [ ] Notifications working (email/Slack)
- [ ] Analytics loading
- [ ] All roles tested (admin, manager, user)

---

## Common Issues & Solutions 🔧

### Issue: "Database connection failed"
**Solution:**
```bash
# Check DATABASE_URL format
# Correct: postgresql://user:pass@host:5432/dbname
# Common mistake: Missing password, wrong host

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: "OAuth redirect mismatch"
**Solution:**
- Check callback URL in OAuth app settings
- Must exactly match: `https://yourdomain.com/api/auth/callback/github`
- Include https:// if using SSL

### Issue: "NextAuth secret missing"
**Solution:**
```bash
# Generate new secret
openssl rand -base64 32

# Add to environment variables
NEXTAUTH_SECRET=<generated_secret>
```

### Issue: "Build fails on Vercel"
**Solution:**
- Check Node.js version (18+ required)
- Clear build cache in Vercel settings
- Check environment variables are set
- Review build logs for specific errors

### Issue: "Migrations not running"
**Solution:**
```bash
# Manually run migrations
npm run db:migrate

# Or via SQL editor
# Copy content from migrations/*.sql and run
```

---

## Quick Commands Reference 📝

### Vercel CLI
```bash
# Install
npm i -g vercel

# Deploy
vercel

# Check logs
vercel logs

# List deployments
vercel ls

# Promote to production
vercel --prod
```

### Database Management
```bash
# Connect to database
psql $DATABASE_URL

# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql

# Check tables
psql $DATABASE_URL -c "\dt"
```

### Docker Commands
```bash
# View running containers
docker ps

# View logs
docker logs <container_id>

# Restart service
docker-compose restart app

# Update and restart
git pull
docker-compose up -d --build

# Clean up
docker system prune -a
```

---

## Monitoring Tools (Recommended)

### Free Tier Options
| Tool | Purpose | Setup Time |
|------|---------|------------|
| **UptimeRobot** | Uptime monitoring | 5 min |
| **Sentry** | Error tracking | 10 min |
| **Vercel Analytics** | Performance | Built-in |
| **PostgreSQL logs** | Database monitoring | Native |

### Paid Options (Worth It)
| Tool | Purpose | Cost/Month |
|------|---------|------------|
| **Datadog** | Full monitoring | $15+ |
| **New Relic** | APM | $25+ |
| **LogRocket** | Session replay | $50+ |

---

## Next Steps After Deployment 🎯

### Week 1
- [ ] Monitor error rates
- [ ] Test all features with real users
- [ ] Set up automated backups verification
- [ ] Create admin documentation

### Week 2
- [ ] Gather user feedback
- [ ] Optimize slow queries (check logs)
- [ ] Set up regular backup testing
- [ ] Plan first feature upgrade

### Month 1
- [ ] Review usage analytics
- [ ] Consider quick wins from FUTURE_UPGRADES_ROADMAP.md
- [ ] Implement mobile hamburger menu (if needed)
- [ ] Plan PWA upgrade (high ROI)

---

## Support Resources 📞

### Official Documentation
- **Next.js:** https://nextjs.org/docs
- **Vercel:** https://vercel.com/docs
- **Supabase:** https://supabase.com/docs
- **PostgreSQL:** https://www.postgresql.org/docs/

### Community
- **TaskForge Issues:** Create in your repository
- **Next.js Discord:** https://discord.gg/nextjs
- **Vercel Discord:** https://discord.gg/vercel

### Professional Help
- **For deployment assistance:** Hire DevOps consultant (1-2 days)
- **For feature development:** See FUTURE_UPGRADES_ROADMAP.md
- **For training:** Schedule with development team

---

## Cost Calculator 💰

### Vercel + Supabase (Recommended)
```
Free Tier (0-100 users):
  - Vercel: $0
  - Supabase: $0
  - Total: $0/month ✅

Pro Tier (100-1,000 users):
  - Vercel Pro: $20/month
  - Supabase Pro: $25/month
  - Total: $45/month

Scale Tier (1,000-10,000 users):
  - Vercel: $50/month
  - Supabase: $100/month
  - Monitoring: $50/month
  - Total: $200/month
```

### AWS (Enterprise)
```
Small (100-500 users):
  - RDS: $50/month
  - ECS: $40/month
  - CloudFront: $10/month
  - Total: $100/month

Medium (500-2,000 users):
  - RDS (scaled): $150/month
  - ECS (scaled): $100/month
  - CloudFront: $30/month
  - Monitoring: $50/month
  - Total: $330/month

Large (2,000+ users):
  - RDS: $400/month
  - ECS: $300/month
  - CloudFront: $100/month
  - Monitoring: $200/month
  - Total: $1,000+/month
```

---

**Ready to Deploy?**

🚀 **Recommended:** Start with Vercel + Supabase (Option 1)
- Easiest setup (30 minutes)
- Free for first 100 users
- Easy to scale later
- Great developer experience

📚 **For detailed upgrade paths:** See FUTURE_UPGRADES_ROADMAP.md

---

**Document Version:** 1.0
**Last Updated:** March 26, 2026
