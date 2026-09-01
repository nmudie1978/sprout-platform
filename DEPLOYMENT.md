# Production Deployment Guide

This guide covers deploying the Youth Platform to production using Vercel (recommended) or other hosting providers.

---

## 📋 Pre-Deployment Checklist

### 1. **Environment Variables**
Ensure all required environment variables are set:

```bash
# Required
DATABASE_URL=              # PostgreSQL connection string
NEXTAUTH_URL=             # Your production URL (e.g., https://yourapp.com)
NEXTAUTH_SECRET=          # Generate with: openssl rand -base64 32

# Email — Resend. REQUIRED IN PRODUCTION: email verification is a hard gate,
# so if these are missing or the key is revoked, NOBODY CAN SIGN UP, and it
# fails silently (the auth routes return a generic 200 either way).
# /api/health probes the key and reports `mail`.
RESEND_API_KEY=           # from resend.com, starts "re_"
MAIL_FROM=                # e.g. "Endeavrly <noreply@endeavrly.com>"
NEXT_PUBLIC_APP_URL=      # origin for emailed links, e.g. https://endeavrly.com

# The EMAIL_SERVER_* / EMAIL_FROM SMTP vars are INERT — no EmailProvider is
# configured. Delete them from your environment; nothing reads them.

# Optional but recommended
OPENAI_API_KEY=          # For AI assistant feature
NODE_ENV=production
```

### 2. **Database Migration**
Run all database migrations:

```bash
npm run db:migrate
npm run db:seed           # Seed career cards
npm run db:seed-help      # Seed help documentation
```

### 3. **Security Audit**
- [ ] All environment variables in production (not in code)
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] Security headers are set (check next.config.js)

### 4. **Performance Check**
```bash
npm run build
npm run start
```

Run Lighthouse audit:
- Performance > 90
- Accessibility > 90
- Best Practices > 90
- SEO > 90

---

## 🚀 Deployment Options

### **Option 1: Vercel (Recommended)**

#### Why Vercel?
- Built for Next.js (optimal performance)
- Automatic SSL/TLS certificates
- Global CDN
- Zero-config deployment
- Generous free tier

#### Steps:

**1. Install Vercel CLI**
```bash
npm install -g vercel
```

**2. Link Project**
```bash
cd youth-platform
vercel login
vercel link
```

**3. Set Environment Variables**
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add EMAIL_SERVER_HOST
vercel env add EMAIL_SERVER_PORT
vercel env add EMAIL_SERVER_USER
vercel env add EMAIL_SERVER_PASSWORD
vercel env add EMAIL_FROM
vercel env add OPENAI_API_KEY
```

**4. Deploy**
```bash
vercel --prod
```

**5. Run Database Migrations**

After first deploy, connect to your production database and run:
```bash
DATABASE_URL="your-production-db-url" npm run db:migrate
DATABASE_URL="your-production-db-url" npm run db:seed
DATABASE_URL="your-production-db-url" npm run db:seed-help
```

---

### **Option 2: Docker + Cloud Provider**

#### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - EMAIL_SERVER_HOST=${EMAIL_SERVER_HOST}
      - EMAIL_SERVER_PORT=${EMAIL_SERVER_PORT}
      - EMAIL_SERVER_USER=${EMAIL_SERVER_USER}
      - EMAIL_SERVER_PASSWORD=${EMAIL_SERVER_PASSWORD}
      - EMAIL_FROM=${EMAIL_FROM}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: youth_platform
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: youth_platform
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

**Deploy to:**
- AWS ECS
- Google Cloud Run
- DigitalOcean App Platform
- Fly.io

---

### **Option 3: Traditional VPS (e.g., DigitalOcean, Linode)**

**1. Install Dependencies**
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install Nginx
sudo apt-get install -y nginx
```

**2. Setup Database**
```bash
sudo -u postgres psql
CREATE DATABASE youth_platform;
CREATE USER youth_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE youth_platform TO youth_user;
\q
```

**3. Clone and Build**
```bash
cd /var/www
git clone <your-repo> youth-platform
cd youth-platform
npm install
npm run db:generate
npm run build
```

**4. Setup PM2 (Process Manager)**
```bash
npm install -g pm2
pm2 start npm --name "youth-platform" -- start
pm2 save
pm2 startup
```

**5. Configure Nginx**

`/etc/nginx/sites-available/youth-platform`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

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

```bash
sudo ln -s /etc/nginx/sites-available/youth-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**6. Setup SSL with Certbot**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🗄️ Database Setup

### **Recommended: Managed PostgreSQL**

**Providers:**
- **Vercel Postgres** (easiest if using Vercel)
- **Supabase** (generous free tier, good DX)
- **Neon** (serverless PostgreSQL)
- **Railway** (simple setup)
- **DigitalOcean Managed Databases**
- **AWS RDS**

### **Connection Pooling**

For serverless deployments (Vercel), use connection pooling:

**With Supabase:**
```bash
# Use the pooling URL (port 6543)
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"
```

**With Neon:**
```bash
# Use the pooled connection string
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

### **Prisma Configuration for Production**

Update `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}
```

Set both URLs:
```bash
DATABASE_URL="pooled-connection-string"
DIRECT_URL="direct-connection-string"
```

---

## 📧 Email Configuration

### **Option 1: SendGrid**

```bash
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=<your-sendgrid-api-key>
EMAIL_FROM=noreply@yourdomain.com
```

### **Option 2: AWS SES**

```bash
EMAIL_SERVER_HOST=email-smtp.eu-west-1.amazonaws.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=<your-access-key-id>
EMAIL_SERVER_PASSWORD=<your-secret-access-key>
EMAIL_FROM=noreply@yourdomain.com
```

### **Option 3: Gmail (Development Only)**

```bash
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=<app-password>
EMAIL_FROM=your-email@gmail.com
```

---

## 🔒 Security Best Practices

### **1. Environment Variables**
- ✅ Never commit `.env` files
- ✅ Use strong, random secrets
- ✅ Rotate credentials regularly
- ✅ Use different credentials per environment

### **2. Database Security**
- ✅ Use SSL/TLS for database connections
- ✅ Restrict database access to application IP only
- ✅ Enable automatic backups
- ✅ Use least-privilege database user

### **3. API Security**
- ✅ Rate limiting enabled (check `src/lib/rate-limit.ts`)
- ✅ Input sanitization (use `src/lib/sanitize.ts`)
- ✅ CORS configured correctly
- ✅ Security headers set (check `next.config.js`)

### **4. Authentication**
- ✅ NEXTAUTH_SECRET is cryptographically strong
- ✅ Magic link expiration configured
- ✅ HTTPS enforced in production
- ✅ Session timeout configured

---

## 📊 Monitoring & Logging

### **Recommended Tools**

**Error Tracking:**
- [Sentry](https://sentry.io) - Real-time error tracking
- [LogRocket](https://logrocket.com) - Session replay

**Performance Monitoring:**
- Vercel Analytics (built-in if using Vercel)
- [New Relic](https://newrelic.com)
- [Datadog](https://datadoghq.com)

**Setup Sentry (Example):**

```bash
npm install @sentry/nextjs
```

`sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

---

## 🧪 Post-Deployment Verification

### **1. Smoke Tests**

```bash
# Health check
curl https://yourapp.com/api/health

# Health — expect {"status":"ok","db":"up","redis":"up","mail":"up"}.
#   "mail":"invalid-key"    -> the Resend key is present but revoked: NOBODY
#                              can sign up, because verification is a hard gate
#   "redis":"down"          -> rate limits and AI cost caps have silently
#                              degraded to per-instance in-memory
#   "commit"                -> compare against origin/main to catch a deploy
#                              that never landed

# Auth flow (the real one — credentials, no magic link)
# - Visit /auth/signup, create an account
# - Confirm the verification email actually ARRIVES (not just that signup 200s;
#   the endpoints return a generic 200 whether or not mail was sent)
# - Click the link; confirm you end up signed in
# - Open the link on a DIFFERENT device: the original tab should sign itself in
# - Try signing in before confirming: must be refused
# - Sign up again with the same address: no second account, and the owner gets
#   a "you already have an account" email
# - Forgot password -> reset -> sign in with the new password

# Core features
# - Browse and compare careers
# - My Journey: Discover / Understand / Clarity
# - Career Radar preference matching
# - Career Twin (AI) — check the usage caps hold
#
# NOTE: there are no job postings, applications or employer accounts. The jobs
# marketplace was removed; see <removed_features_strict> in CLAUDE.md. If a
# checklist asks you to test one, the checklist is out of date.
```

### **2. Database Verification**

```sql
-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check row counts
SELECT COUNT(*) FROM "CareerCard";
SELECT COUNT(*) FROM "HelpDoc";
SELECT COUNT(*) FROM "User";
```

### **3. Performance Check**

```bash
# Run Lighthouse
lighthouse https://yourapp.com --view

# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://yourapp.com
```

`curl-format.txt`:
```
time_namelookup:  %{time_namelookup}s\n
time_connect:  %{time_connect}s\n
time_starttransfer:  %{time_starttransfer}s\n
time_total:  %{time_total}s\n
```

---

## 🔄 CI/CD Pipeline

### **GitHub Actions Example**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📈 Scaling Considerations

### **Database Scaling**
- Start with shared database (Supabase free tier)
- Upgrade to dedicated when >1000 users
- Use read replicas for heavy read workloads
- Consider sharding if >100k users

### **Application Scaling**
- Vercel auto-scales (no config needed)
- Docker: Use load balancer + multiple containers
- Monitor response times and error rates

### **Cost Optimization**
- Use Vercel free tier (hobby projects)
- Upgrade to Pro when needed (~$20/month)
- Database: Supabase free tier → $25/month
- OpenAI: ~$5-20/month depending on usage
- Total: $0-50/month for <1000 users

---

## 🆘 Troubleshooting

### **Build Fails**

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### **Database Connection Issues**

```bash
# Test connection
DATABASE_URL="your-url" npx prisma db pull

# Check SSL requirement
# Add ?sslmode=require to connection string
```

### **Magic Link Not Sending**

```bash
# Check email configuration
# Test SMTP connection
# Verify EMAIL_FROM is authorized sender
# Check spam folder
```

### **Rate Limit Issues**

```bash
# Increase limits in src/lib/rate-limit.ts
# Or implement Redis-based rate limiting
```

---

## ✅ Production Readiness Checklist

- [ ] All environment variables set
- [ ] Database migrated and seeded
- [ ] SSL/TLS certificate installed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error tracking setup (Sentry)
- [ ] Performance monitoring enabled
- [ ] Backups configured
- [ ] Domain configured and DNS updated
- [ ] Email sending tested
- [ ] Magic link authentication tested
- [ ] All core features tested
- [ ] Mobile responsiveness verified
- [ ] Accessibility audit passed
- [ ] GDPR compliance reviewed (for EU users)
- [ ] Privacy policy and terms published

---

## 📞 Support

For deployment issues:
1. Check application logs
2. Review Vercel/platform dashboard
3. Check database logs
4. Verify environment variables
5. Test locally with production build

**Need help?** Open an issue on GitHub.

---

**Congratulations! Your Youth Platform is now live! 🎉**
