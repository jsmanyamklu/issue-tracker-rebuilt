# Production Deployment Guide

This guide covers deploying the Issue Tracker application to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployments](#cloud-deployments)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 16+ database
- Docker & Docker Compose (for containerized deployment)
- Domain name and SSL certificate (for HTTPS)

## Environment Setup

### 1. Environment Variables

Create a `.env.production` file with these variables:

```bash
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/issue_tracker

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars

# OAuth Providers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379

# Optional: Logging
LOG_LEVEL=info
LOG_QUERIES=false
```

### 2. Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

### 3. OAuth Setup

#### GitHub OAuth:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

#### Google OAuth:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
4. Copy Client ID and Client Secret to `.env`

## Docker Deployment

### Option 1: Docker Compose (Recommended for Simple Deployments)

```bash
# 1. Clone repository
git clone <your-repo>
cd issue-tracker-rebuilt

# 2. Create production environment file
cp .env.example .env.production
# Edit .env.production with your values

# 3. Build and start services
docker-compose up -d

# 4. Run database migrations
docker-compose exec app npm run migrate

# 5. Check health
curl http://localhost:3000/api/health
```

### Option 2: Docker Build & Run

```bash
# Build image
docker build -t issue-tracker:latest .

# Run PostgreSQL
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your-password \
  -e POSTGRES_DB=issue_tracker \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine

# Run application
docker run -d \
  --name issue-tracker \
  --link postgres:postgres \
  -e DATABASE_URL=postgresql://postgres:your-password@postgres:5432/issue_tracker \
  -e NEXTAUTH_URL=https://yourdomain.com \
  -e NEXTAUTH_SECRET=your-secret \
  -e GITHUB_CLIENT_ID=your-client-id \
  -e GITHUB_CLIENT_SECRET=your-client-secret \
  -p 3000:3000 \
  issue-tracker:latest
```

## Cloud Deployments

### AWS (ECS/Fargate)

1. **Push Docker image to ECR**:
```bash
aws ecr create-repository --repository-name issue-tracker
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag issue-tracker:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/issue-tracker:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/issue-tracker:latest
```

2. **Set up RDS PostgreSQL**:
   - Create RDS PostgreSQL instance
   - Note down connection string
   - Configure security groups

3. **Create ECS Task Definition**:
   - Use Fargate launch type
   - Configure container with environment variables
   - Set up load balancer

### Google Cloud Platform (Cloud Run)

```bash
# 1. Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/issue-tracker

# 2. Deploy to Cloud Run
gcloud run deploy issue-tracker \
  --image gcr.io/PROJECT_ID/issue-tracker \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=postgresql://... \
  --set-env-vars NEXTAUTH_URL=https://... \
  --set-env-vars NEXTAUTH_SECRET=...
```

### Railway

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login and initialize
railway login
railway init

# 3. Add PostgreSQL
railway add

# 4. Deploy
railway up
```

### Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod

# Note: Set up PostgreSQL separately (Railway, Supabase, Neon, etc.)
```

## NGINX Reverse Proxy Setup

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
```

## Database Setup

### Running Migrations

```bash
# Using npm
npm run migrate

# Using Docker
docker-compose exec app npm run migrate
```

### Database Backups

```bash
# Backup
pg_dump -h localhost -U postgres -d issue_tracker > backup_$(date +%Y%m%d).sql

# Restore
psql -h localhost -U postgres -d issue_tracker < backup_20240101.sql

# Automated backups (cron)
0 2 * * * pg_dump -h localhost -U postgres -d issue_tracker > /backups/backup_$(date +\%Y\%m\%d).sql
```

## Monitoring & Maintenance

### Health Checks

```bash
# Application health
curl https://yourdomain.com/api/health

# Metrics
curl https://yourdomain.com/api/metrics
```

### Logging

Logs are written to:
- Console (stdout/stderr)
- `/app/logs/combined.log` (all logs)
- `/app/logs/error.log` (errors only)

View logs:
```bash
# Docker
docker-compose logs -f app

# View error logs
docker-compose exec app tail -f /app/logs/error.log
```

### Performance Monitoring

Set up monitoring with:
- **Prometheus**: Scrape `/api/metrics`
- **Grafana**: Visualize metrics
- **Sentry**: Error tracking
- **Datadog/New Relic**: APM

### Database Maintenance

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('issue_tracker'));

-- Vacuum and analyze
VACUUM ANALYZE;

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Scaling

### Horizontal Scaling

1. Use load balancer (NGINX, AWS ALB, etc.)
2. Run multiple application instances
3. Use session store (Redis) for session sharing
4. Configure database connection pooling

### Vertical Scaling

1. Increase container resources (CPU, Memory)
2. Optimize database (indexes, query optimization)
3. Add Redis caching layer
4. Use CDN for static assets

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables secured (no hardcoded secrets)
- [ ] Database connections encrypted
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Regular dependency updates (`npm audit`)
- [ ] Database backups automated
- [ ] Access logs enabled
- [ ] Firewall rules configured

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose exec app env | grep DATABASE_URL

# Test database connection
docker-compose exec app psql $DATABASE_URL -c "SELECT 1"
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U postgres -c "SELECT version()"

# Check connection string format
# Should be: postgresql://user:pass@host:port/database
```

### OAuth Not Working

1. Verify callback URLs match exactly
2. Check CLIENT_ID and CLIENT_SECRET are correct
3. Ensure NEXTAUTH_URL matches your domain
4. Verify NEXTAUTH_SECRET is set and >32 characters

### Performance Issues

```bash
# Check database indexes
docker-compose exec app npm run migrate

# Monitor slow queries
# Enable LOG_QUERIES=true in .env

# Check memory usage
docker stats

# Analyze database
docker-compose exec postgres psql -U postgres -d issue_tracker -c "VACUUM ANALYZE"
```

## Support

For issues and questions:
- GitHub Issues: [your-repo]/issues
- Documentation: [your-docs-url]
- Email: support@yourdomain.com
