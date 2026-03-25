# TaskForge - Deployment Guide

**Last Updated:** March 25, 2026
**Version:** 1.0.0

Complete guide for deploying TaskForge to production environments.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Options](#deployment-options)
   - [Vercel (Recommended)](#option-1-vercel-recommended)
   - [Docker Container](#option-2-docker-container)
   - [Traditional VPS](#option-3-traditional-vps-ubuntu)
5. [Database Setup](#database-setup)
6. [Email Configuration](#email-configuration)
7. [Slack Integration](#slack-integration)
8. [Post-Deployment](#post-deployment)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

TaskForge can be deployed in multiple ways:

| Method | Best For | Complexity | Cost |
|--------|----------|------------|------|
| **Vercel** | Quick deployment, serverless | Low | Free tier available |
| **Docker** | Containerized environments | Medium | Variable |
| **VPS** | Full control, custom setup | High | $5-20/month |

**Recommended**: Vercel for most use cases (easy, scalable, free tier)

---

## 📋 Prerequisites

### Required Software

- **Node.js**: 20.x or higher
- **PostgreSQL**: 14.x or higher
- **npm**: 9.x or higher
- **Git**: For version control

### Required Accounts

- **GitHub/GitLab**: For code repository
- **OAuth Providers**:
  - GitHub OAuth App (for GitHub login)
  - Google Cloud Project (for Google login)
- **Deployment Platform**: Vercel, AWS, or VPS provider

### Optional Services

- **SMTP Server**: For email notifications (Gmail, SendGrid, AWS SES)
- **Slack Workspace**: For Slack notifications
- **Domain Name**: Custom domain (optional)

---

## ⚙️ Environment Configuration

### Required Environment Variables

Create a `.env` file (or set in your deployment platform):

```env
# ========================================
# DATABASE
# ========================================
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Example for local:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/taskforge

# Example for Vercel Postgres:
# DATABASE_URL=postgres://username:password@host.postgres.vercel-storage.com:5432/database

# ========================================
# NEXTAUTH
# ========================================
# For development, use http://localhost:3000
# For production, use your actual domain
NEXTAUTH_URL=https://yourdomain.com

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters-long

# ========================================
# OAUTH PROVIDERS
# ========================================
# GitHub OAuth App
# Create at: https://github.com/settings/developers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth
# Create at: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Optional Environment Variables

```env
# ========================================
# EMAIL NOTIFICATIONS (Optional)
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@yourdomain.com

# For Gmail:
# 1. Enable 2FA on your Google account
# 2. Create an App Password: https://myaccount.google.com/apppasswords
# 3. Use that password as SMTP_PASSWORD

# ========================================
# SLACK NOTIFICATIONS (Optional)
# ========================================
# Method 1: Webhook (Easier)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Method 2: Bot Token (More features)
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_DEFAULT_CHANNEL=#issue-tracker

# ========================================
# OPTIONAL
# ========================================
NODE_ENV=production
PORT=3000
```

### Generating NEXTAUTH_SECRET

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))

# Or use an online generator:
# https://generate-secret.vercel.app/32
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Pros**: Easiest, automatic deployments, free tier, built-in CDN
**Cons**: Serverless limitations, cold starts

#### Step 1: Prepare Your Repository

```bash
# Push your code to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/taskforge.git
git push -u origin main
```

#### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"New Project"**
4. Import your repository
5. Configure project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

#### Step 3: Set Up PostgreSQL

**Option A: Vercel Postgres (Recommended)**

1. In your Vercel project dashboard
2. Go to **Storage** tab
3. Click **"Create Database"** → **"Postgres"**
4. Click **"Create"**
5. Vercel automatically adds `DATABASE_URL` to environment variables

**Option B: External PostgreSQL**

Use any PostgreSQL provider:
- [Neon](https://neon.tech) - Free tier, serverless
- [Supabase](https://supabase.com) - Free tier, includes auth
- [Railway](https://railway.app) - Simple, pay-as-you-go
- [AWS RDS](https://aws.amazon.com/rds/) - Enterprise

#### Step 4: Configure Environment Variables

1. In Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add all required variables from [Environment Configuration](#environment-configuration)
4. Click **"Save"**

#### Step 5: Set Up OAuth Providers

**GitHub OAuth**:
1. Go to GitHub Settings → Developer Settings → OAuth Apps
2. Create New OAuth App
3. **Application name**: TaskForge
4. **Homepage URL**: `https://your-vercel-url.vercel.app`
5. **Authorization callback URL**: `https://your-vercel-url.vercel.app/api/auth/callback/github`
6. Copy **Client ID** and **Client Secret** to Vercel env vars

**Google OAuth**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. **Application type**: Web application
6. **Authorized redirect URIs**: `https://your-vercel-url.vercel.app/api/auth/callback/google`
7. Copy **Client ID** and **Client Secret** to Vercel env vars

#### Step 6: Run Database Migrations

```bash
# Install Vercel CLI
npm install -g vercel

# Pull environment variables
vercel env pull .env.local

# Run migrations locally
npm run migrate

# Or run migrations on Vercel (if you have migration script)
vercel env pull .env.production
DATABASE_URL=<your-production-db-url> npm run migrate
```

#### Step 7: Deploy

```bash
# Trigger deployment
git push origin main

# Or manually deploy
vercel --prod
```

#### Step 8: Custom Domain (Optional)

1. In Vercel project dashboard
2. Go to **Settings** → **Domains**
3. Add your domain
4. Follow DNS configuration instructions
5. Update `NEXTAUTH_URL` to your custom domain
6. Update OAuth callback URLs to use custom domain

---

### Option 2: Docker Container

**Pros**: Portable, consistent, works anywhere
**Cons**: Requires container management

#### Step 1: Create Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
```

#### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/taskforge
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
      - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=taskforge
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Step 3: Create .env File

```bash
# Copy and fill in values
cp .env.example .env
nano .env
```

#### Step 4: Build and Run

```bash
# Build image
docker-compose build

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

#### Step 5: Run Migrations

```bash
# Inside running container
docker-compose exec app npm run migrate

# Or before starting
docker-compose run app npm run migrate
```

#### Step 6: Deploy to Production

**Option A: Docker Hub**

```bash
# Build and tag
docker build -t yourusername/taskforge:latest .

# Push to Docker Hub
docker login
docker push yourusername/taskforge:latest

# On production server
docker pull yourusername/taskforge:latest
docker run -d -p 3000:3000 --env-file .env yourusername/taskforge:latest
```

**Option B: AWS ECS/Fargate**

1. Push image to Amazon ECR
2. Create ECS task definition
3. Create ECS service
4. Configure load balancer

**Option C: Google Cloud Run**

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/YOUR_PROJECT/taskforge

# Deploy
gcloud run deploy taskforge \
  --image gcr.io/YOUR_PROJECT/taskforge \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

### Option 3: Traditional VPS (Ubuntu)

**Pros**: Full control, cost-effective
**Cons**: Manual setup, maintenance overhead

#### Step 1: Set Up Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Certbot (SSL certificates)
sudo apt install -y certbot python3-certbot-nginx
```

#### Step 2: Set Up Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL console:
CREATE DATABASE taskforge;
CREATE USER taskforge_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE taskforge TO taskforge_user;
\q
```

#### Step 3: Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/taskforge.git
cd taskforge

# Install dependencies
sudo npm install

# Create .env file
sudo nano .env
# Paste your environment variables

# Build application
sudo npm run build

# Run migrations
sudo npm run migrate

# Start with PM2
sudo pm2 start npm --name "taskforge" -- start
sudo pm2 startup
sudo pm2 save
```

#### Step 4: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/taskforge
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/taskforge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Set Up SSL

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

#### Step 6: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

#### Step 7: Automate Deployment

Create deploy script:

```bash
# deploy.sh
#!/bin/bash
cd /var/www/taskforge
git pull origin main
npm install
npm run build
pm2 restart taskforge
```

```bash
chmod +x deploy.sh
```

---

## 🗄️ Database Setup

### Initial Schema

Run migrations to set up database:

```bash
# Development
npm run migrate

# Production (with specific DATABASE_URL)
DATABASE_URL=<your-production-url> npm run migrate
```

### Database Migrations

Migrations are in `migrations/` directory:

```
migrations/
├── 001_create_users_table.sql
├── 002_create_projects_table.sql
├── 003_create_issues_table.sql
└── 004_create_comments_table.sql
```

### Backup Strategy

```bash
# Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
psql $DATABASE_URL < backup_20260325_120000.sql
```

### Automated Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * pg_dump DATABASE_URL > /backups/taskforge_$(date +\%Y\%m\%d).sql
```

---

## 📧 Email Configuration

### Gmail Setup

1. Enable 2FA on Google account
2. Create App Password: https://myaccount.google.com/apppasswords
3. Set environment variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### SendGrid Setup

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Set environment variables:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
```

### AWS SES Setup

1. Sign up for AWS SES
2. Verify domain
3. Create SMTP credentials
4. Set environment variables:

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-smtp-username
SMTP_PASSWORD=your-aws-smtp-password
SMTP_FROM=noreply@yourdomain.com
```

---

## 💬 Slack Integration

### Method 1: Webhook (Easier)

1. Go to Slack workspace
2. Settings → Apps → Incoming Webhooks
3. Create webhook
4. Copy webhook URL
5. Set environment variable:

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_DEFAULT_CHANNEL=#issue-tracker
```

### Method 2: Bot Token (More Features)

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create New App → From Scratch
3. Add Bot Token Scopes:
   - `chat:write`
   - `chat:write.public`
4. Install to Workspace
5. Copy Bot User OAuth Token
6. Set environment variables:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_DEFAULT_CHANNEL=#issue-tracker
```

---

## ✅ Post-Deployment

### Health Check

```bash
# Check if app is running
curl https://yourdomain.com

# Check API
curl https://yourdomain.com/api/health

# Check database connection
curl https://yourdomain.com/api/health/db
```

### Create First Admin User

1. Sign in with OAuth (first user)
2. Check user role in database:

```sql
SELECT id, name, email, role FROM users;
```

3. If not admin, update:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Test Features

- [ ] Sign in with GitHub
- [ ] Sign in with Google
- [ ] Create a project
- [ ] Create an issue
- [ ] Add a comment
- [ ] Toggle dark mode
- [ ] Filter issues
- [ ] Send overdue notification (if configured)

### Performance Optimization

```bash
# Enable gzip compression (Nginx)
sudo nano /etc/nginx/nginx.conf

# Add to http block:
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;

# Restart Nginx
sudo systemctl restart nginx
```

---

## 📊 Monitoring & Maintenance

### Application Monitoring

**PM2 Monitoring** (if using VPS):

```bash
# View status
pm2 status

# View logs
pm2 logs taskforge

# View metrics
pm2 monit
```

**Vercel Monitoring**:

1. Go to Vercel Dashboard
2. Analytics tab
3. View performance metrics

### Log Management

```bash
# View application logs
pm2 logs taskforge --lines 100

# View Nginx access logs
tail -f /var/log/nginx/access.log

# View Nginx error logs
tail -f /var/log/nginx/error.log

# View PostgreSQL logs
tail -f /var/log/postgresql/postgresql-14-main.log
```

### Database Maintenance

```bash
# Vacuum database
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Check table sizes
psql $DATABASE_URL -c "
  SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::text))
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(tablename::text) DESC;
"
```

### Update Application

```bash
# Pull latest changes
cd /var/www/taskforge
git pull origin main

# Install dependencies
npm install

# Run migrations (if any)
npm run migrate

# Build
npm run build

# Restart
pm2 restart taskforge
```

---

## 🔧 Troubleshooting

### Issue: Cannot Connect to Database

**Symptoms**: `ECONNREFUSED` or `connection timeout`

**Solutions**:
1. Check `DATABASE_URL` format: `postgresql://user:password@host:5432/db`
2. Verify PostgreSQL is running: `sudo systemctl status postgresql`
3. Check firewall rules
4. Verify credentials

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Issue: OAuth Login Not Working

**Symptoms**: Redirect errors, authentication failures

**Solutions**:
1. Verify `NEXTAUTH_URL` matches your domain
2. Check OAuth callback URLs match exactly
3. Ensure `NEXTAUTH_SECRET` is set
4. Clear browser cookies and try again

### Issue: Build Fails on Vercel

**Symptoms**: Build errors, deployment fails

**Solutions**:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version: `"engines": { "node": ">=20.0.0" }`
4. Try building locally: `npm run build`

### Issue: Email Notifications Not Sending

**Symptoms**: No emails received, SMTP errors

**Solutions**:
1. Verify SMTP credentials
2. Check SMTP_PORT (587 for TLS, 465 for SSL)
3. For Gmail, use App Password, not regular password
4. Check email logs in application

### Issue: High Memory Usage

**Symptoms**: Application slow, out of memory errors

**Solutions**:
1. Increase server memory
2. Optimize database queries
3. Add connection pooling limits
4. Enable gzip compression

### Issue: Slow Page Load

**Symptoms**: Pages take long to load

**Solutions**:
1. Enable caching
2. Optimize database indexes
3. Use CDN for static assets
4. Enable gzip compression
5. Check database query performance

---

## 📚 Additional Resources

- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Vercel Docs**: https://vercel.com/docs
- **Docker Docs**: https://docs.docker.com/
- **Nginx Docs**: https://nginx.org/en/docs/

---

## 🆘 Support

For deployment issues:

1. Check this guide
2. Review [ARCHITECTURE.md](ARCHITECTURE.md)
3. Check GitHub Issues
4. Contact your team admin

---

**Congratulations! Your TaskForge instance is now deployed! 🎉**

*Last updated: March 25, 2026*
